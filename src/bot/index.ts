import isNull from 'lodash/isNull';
import TelegramBot, {
  Message,
  SendMessageOptions,
  CallbackQuery,
  EditMessageTextOptions,
} from 'node-telegram-bot-api';
import FinanceAggregation from '@/finance-aggregation';
import { ACTIONS, Actions } from '@/interfaces/bot';
import { CURRENCIES } from '@/interfaces/common';
import UsersRepository from '@/repositories/users';
import ResponseBuilder from '@/response-builder';
import getCurrencyWithFlag from '@/utils/get-currency-with-flag';
import neverReached from '@/utils/never-reached';

export default class {
  private readonly bot: TelegramBot;

  public constructor(
    token: string,
    port: number,
    private readonly usersRepository: UsersRepository,
    private readonly financeAggregation: FinanceAggregation,
    private readonly responseBuilder: ResponseBuilder,
  ) {
    this.bot = new TelegramBot(token, {
      webHook: {
        port,
      },
    });

    this.initializeRoutes();
  }

  public setWebHook = (url: string) => {
    this.bot.setWebHook(url);
  };

  private initializeRoutes = () => {
    this.bot.onText(/\/start/, this.handleStart);

    this.bot.onText(/\/menu/, this.getMenu);

    this.bot.onText(/Актуальный курс валют 💱/, this.getExchange);
    this.bot.onText(/\/exchange/, this.getExchange);

    this.bot.onText(/Настройки ⚙️/, this.getSettings);
    this.bot.onText(/\/settings/, this.getSettings);

    this.bot.onText(/Информация ℹ️/, this.getInformation);
    this.bot.onText(/\/information/, this.getInformation);

    this.bot.on('callback_query', this.handleCallbackQuery);
  };

  private getMenuButtons = (): SendMessageOptions => ({
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: [
        [{ text: 'Актуальный курс валют 💱' }],
        [{ text: 'Настройки ⚙️' }],
        [{ text: 'Информация ℹ️' }],
      ],
      resize_keyboard: true,
    },
  });

  private handleStart = async (message: Message) => {
    const {
      id,
      first_name: firstName,
      last_name: lastName,
      username,
    } = message.chat;

    const user = {
      _id: id,
      firstName,
      lastName,
      username,
    };

    await this.usersRepository.upsert(user);

    this.responseBuilder.addLine('Привет! 🚀');
    this.responseBuilder.addLine('Я умею показывать актуальный курс валют в Украине 🇺🇦');
    this.responseBuilder.addEmptyLine();
    this.responseBuilder.addLine('*Актуальный курс валют 💱* — вернет текущий курс валют для твоего списка активных валют. По умолчанию это — *USD 🇺🇸* и *EUR 🇪🇺*.');
    this.responseBuilder.addLine('*Настройки ⚙️* — позволит изменить список активных валют.');
    this.responseBuilder.addLine('*Информация ℹ️* — дополнительная информация.');

    const msg = this.responseBuilder.getResponse();

    this.bot.sendMessage(id, msg, this.getMenuButtons());
  };

  private getMenu = (message: Message) => {
    const { id } = message.chat;

    this.bot.sendMessage(id, 'Меню:', this.getMenuButtons());
  };

  private getExchange = async (message: Message) => {
    try {
      const { id } = message.chat;

      const currencies = await this.usersRepository.getCurrenciesForUserById(id);

      if (!currencies.length) {
        this.bot.sendMessage(id, 'Добавь хотя бы одну активную валюту в настройках 🙂');
        return;
      }

      const response = await this.financeAggregation.getAggregation(currencies);

      if (response.every(isNull)) {
        this.bot.sendMessage(id, 'Никто не работает сейчас...😴');
        return;
      }

      const responseToString = response.join('\n\n');

      const options: SendMessageOptions = {
        parse_mode: 'Markdown',
      };

      this.bot.sendMessage(id, responseToString, options);
    } catch (e) {
      console.error(e);
    }
  };

  private getSettings = async (message: Message) => {
    try {
      const { id } = message.chat;

      const currencies = await this.usersRepository.getCurrenciesForUserById(id);

      const allCurrenciesList = Object.values(CURRENCIES);

      const preparedCurrencies = allCurrenciesList.map((currency) => {
        const textToShow = currencies.includes(currency) ? `${currency} ✅` : `${currency} ◻️`;

        return {
          currency,
          textToShow,
        };
      });

      const options: SendMessageOptions = {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: preparedCurrencies.map(({ currency, textToShow }) => [
            {
              text: textToShow,
              callback_data: JSON.stringify({
                action: ACTIONS.TOGGLE_CURRENCY,
                payload: currency,
              }),
            },
          ]),
        },
      };

      this.bot.sendMessage(id, 'Выбери необходимые валюты:', options);
    } catch (e) {
      console.error(e);
    }
  };

  private getInformation = async (message: Message) => {
    try {
      const { id } = message.chat;

      const currencies = await this.usersRepository.getCurrenciesForUserById(id);

      const allCurrenciesList = Object.values(CURRENCIES).map(getCurrencyWithFlag).join(', ');
      const userCurrenciesList = currencies.map(getCurrencyWithFlag).join(', ');

      this.responseBuilder.addLine('Я агрегирую курс обмена наличных валют в Украине 🇺🇦 из открытых источников, которые обновляются каждые 10 минут и содержат наиболее актуальную информацию — последние установленные на текущий момент курсы валют в банках и ПОВ Украины.');
      this.responseBuilder.addLine('Я знаю курс валют для:');
      this.responseBuilder.addLine(allCurrenciesList);
      this.responseBuilder.addEmptyLine();
      this.responseBuilder.addLine('Сейчас в твоем списке такие валюты:');
      this.responseBuilder.addBoldLine(userCurrenciesList);

      const msg = this.responseBuilder.getResponse();

      const options: SendMessageOptions = {
        parse_mode: 'Markdown',
      };

      this.bot.sendMessage(id, msg, options);
    } catch (e) {
      console.error(e);
    }
  };

  private handleCallbackQuery = async (callbackQuery: CallbackQuery) => {
    try {
      const { data, message } = callbackQuery;
      const { action, payload }: Actions = JSON.parse(data!);

      switch (action) {
        case ACTIONS.TOGGLE_CURRENCY: {
          this.toggleCurrency(message!, payload);
          break;
        }
        default: {
          neverReached(action);
          throw new Error(`Unknown action ${action}`);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  private toggleCurrency = async (message: Message, currencyToToggle: CURRENCIES) => {
    try {
      const { text, message_id: messageId } = message!;
      const { id } = message!.chat;

      const { value: user } = await this.usersRepository.toggleCurrencyForUserById(
        id,
        currencyToToggle,
      );

      const { currencies } = user!;

      const allCurrenciesList = Object.values(CURRENCIES);

      const preparedCurrencies = allCurrenciesList.map((currency) => {
        const textToShow = currencies.includes(currency) ? `${currency} ✅` : `${currency} ◻️`;

        return {
          currency,
          textToShow,
        };
      });

      const editMessageOptions: EditMessageTextOptions = {
        chat_id: id,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: preparedCurrencies.map(({ currency, textToShow }) => [
            {
              text: textToShow,
              callback_data: JSON.stringify({
                action: ACTIONS.TOGGLE_CURRENCY,
                payload: currency,
              }),
            },
          ]),
        },
      };

      this.bot.editMessageText(text!, editMessageOptions);
    } catch (e) {
      console.error(e);
    }
  };
}
