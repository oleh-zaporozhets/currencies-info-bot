import TelegramBot from 'node-telegram-bot-api';
import UsersRepository from '@/repositories/users';
import FinanceApi from '@/api/finance';
import { Currencies, Spread } from '@/interfaces/common';
import getArrayOfCurrencies from '@/utils/array-of-currencies';
import getSpread from '@/utils/get-spread';
import getAverage from '@/utils/get-average';

class Bot {
  private _bot: TelegramBot;

  public constructor(
    token: string,
    private _usersRepository: UsersRepository,
    private _financeApi: FinanceApi,
  ) {
    this._bot = new TelegramBot(token, { polling: true });

    this._initializeRoutes();
  }

  private _initializeRoutes = () => {
    this._bot.onText(new RegExp('/start'), this._start);
    this._bot.onText(new RegExp('/info'), this._info);
  };

  private _start = async (message: TelegramBot.Message) => {
    const {
      id: _id,
      first_name: firstName,
      last_name: lastName,
      username,
    } = message.chat;

    const foundUser = await this._usersRepository.find(_id);

    if (foundUser) return;

    const user = {
      _id,
      firstName,
      lastName,
      username,
    };

    await this._usersRepository.insert(user);

    this._bot.sendMessage(_id, 'Welcome 🚀');
  };

  private _info = async (message: TelegramBot.Message) => {
    try {
      const { id } = message.chat;

      const {
        organizations,
      } = await this._financeApi.getCurrenciesExchangeRate();

      const usd = organizations
        .map(getArrayOfCurrencies(Currencies.USD))
        .filter((currency) => currency);
      const eur = organizations
        .map(getArrayOfCurrencies(Currencies.EUR))
        .filter((currency) => currency);

      const usdAsk = usd.map(getSpread(Spread.ask));
      const usdBid = usd.map(getSpread(Spread.bid));

      const eurAsk = eur.map(getSpread(Spread.ask));
      const eurBid = eur.map(getSpread(Spread.bid));

      const usdAskAverage = getAverage(usdAsk);
      const usdBidAverage = getAverage(usdBid);
      const useWeightedAverage = getAverage([usdAskAverage, usdBidAverage]);

      const eurAskAverage = getAverage(eurAsk);
      const eurBidAverage = getAverage(eurBid);
      const eurWeightedAverage = getAverage([eurAskAverage, eurBidAverage]);

      const responseUsd = `*USD:* ${usdBidAverage} / ${usdAskAverage} | *${useWeightedAverage}*`;
      const responseEur = `*EUR:* ${eurAskAverage} / ${eurBidAverage} | *${eurWeightedAverage}*`;

      const response = `${responseUsd}\n${responseEur}`;

      this._bot.sendMessage(id, response, { parse_mode: 'Markdown' });
    } catch (e) {
      console.error(e);
    }
  };
}

export default Bot;
