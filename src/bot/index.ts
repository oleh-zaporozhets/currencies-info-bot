import TelegramBot from 'node-telegram-bot-api';
import UsersRepository from '@/repositories/users';
import FinanceAggregation from '@/utils/finance-aggregation';
import { Currencies } from '@/interfaces/common';

class Bot {
  private _bot: TelegramBot;

  public constructor(
    token: string,
    private _usersRepository: UsersRepository,
    private _financeAggregation: FinanceAggregation,
  ) {
    this._bot = new TelegramBot(token, { polling: true });

    this._initializeRoutes();
  }

  private _initializeRoutes = () => {
    this._bot.onText(/\/start/, this._start);
    this._bot.onText(/Get Info ℹ️/, this._info);
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

    const options: TelegramBot.SendMessageOptions = {
      reply_markup: {
        keyboard: [[{ text: 'Get Info ℹ️' }]],
      },
    };

    this._bot.sendMessage(_id, 'Welcome 🚀', options);
  };

  private _info = async (message: TelegramBot.Message) => {
    try {
      const { id } = message.chat;

      const currencies = [Currencies.USD, Currencies.EUR];

      const response = (
        await this._financeAggregation.getAggregation(currencies)
      ).join('\n');

      this._bot.sendMessage(id, response, { parse_mode: 'Markdown' });
    } catch (e) {
      console.error(e);
    }
  };
}

export default Bot;
