import TelegramBot from 'node-telegram-bot-api';
import difference from 'lodash/difference';
import UsersRepository from '@/repositories/users';
import FinanceAggregation from '@/utils/finance-aggregation';
import getCurrencyWithFlag from '@/utils/get-currency-with-flag';
import { Actions, IAction } from '@/interfaces/bot';
import IUser from '@/interfaces/user';
import { Currencies } from '@/interfaces/common';

class Bot {
  private _bot: TelegramBot;

  public constructor(
    token: string,
    port: number,
    private _usersRepository: UsersRepository,
    private _financeAggregation: FinanceAggregation,
  ) {
    this._bot = new TelegramBot(token, {
      webHook: {
        port,
      },
    });

    this._initializeRoutes();
  }

  public setWebHook = (url: string) => {
    this._bot.setWebHook(url);
  };

  private _initializeRoutes = () => {
    this._bot.onText(/\/start/, this._start);

    this._bot.onText(/\/menu/, this._menu);

    this._bot.onText(/Актуальный курс валют 💱/, this._exchange);
    this._bot.onText(/\/exchange/, this._exchange);

    this._bot.onText(/Настройки ⚙️/, this._settings);
    this._bot.onText(/\/settings/, this._settings);

    this._bot.onText(/Информация ℹ️/, this._information);
    this._bot.onText(/\/information/, this._information);

    this._bot.on('callback_query', this._callbackQuery);
  };

  private _getMenuButtons = (): TelegramBot.SendMessageOptions => ({
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

  private _start = async (message: TelegramBot.Message) => {
    const {
      id: _id,
      first_name: firstName,
      last_name: lastName,
      username,
    } = message.chat;

    const foundUser = await this._usersRepository.find(_id);

    if (foundUser) return;

    const user: IUser = {
      _id,
      firstName,
      lastName,
      username,
      currencies: [Currencies.USD, Currencies.EUR],
    };

    await this._usersRepository.insert(user);

    const msg =
      'Привет! 🚀 Я умею показывать актуальный курс валют в Украине 🇺🇦!\n\n*Актуальный курс валют 💱* - вернет актуальный курс валют для твоего списка. По умолчанию, это - *USD 🇺🇸* и *EUR 🇪🇺*.\n*Настройки ⚙️* - позволит изменить список активных валют.\n*Информация ℹ️* - дополнительная информация.';

    this._bot.sendMessage(_id, msg, this._getMenuButtons());
  };

  private _menu = (message: TelegramBot.Message) => {
    const { id } = message.chat;

    this._bot.sendMessage(id, 'Меню:', this._getMenuButtons());
  };

  private _exchange = async (message: TelegramBot.Message) => {
    try {
      const { id: _id } = message.chat;

      const foundUser = await this._usersRepository.find(_id);

      if (!foundUser) {
        throw new Error("User wasn't found");
      }

      const { currencies } = foundUser;

      const response = (
        await this._financeAggregation.getAggregation(currencies)
      ).join('\n\n');

      if (!response) {
        this._bot.sendMessage(
          _id,
          'Добавь хотя бы одну активную валюту в настройках 🙂',
        );
        return;
      }

      const options: TelegramBot.SendMessageOptions = {
        parse_mode: 'Markdown',
      };

      this._bot.sendMessage(_id, response, options);
    } catch (e) {
      console.error(e);
    }
  };

  private _settings = async (message: TelegramBot.Message) => {
    try {
      const { id: _id } = message.chat;

      const foundUser = await this._usersRepository.find(_id);

      if (!foundUser) {
        throw new Error("User wasn't found");
      }

      const { currencies } = foundUser;

      const options: TelegramBot.SendMessageOptions = {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Добавить валюту',
                callback_data: JSON.stringify({
                  action: Actions.ADD_CURRENCIES,
                }),
              },
            ],
            [
              {
                text: 'Удалить валюту',
                callback_data: JSON.stringify({
                  action: Actions.REMOVE_CURRENCIES,
                }),
              },
            ],
          ],
        },
      };

      const activeCurrencies = currencies.map(getCurrencyWithFlag).join(', ');

      this._bot.sendMessage(
        _id,
        `Список активных валют:\n*${activeCurrencies}*`,
        options,
      );
    } catch (e) {
      console.error(e);
    }
  };

  private _information = async (message: TelegramBot.Message) => {
    try {
      const { id: _id } = message.chat;

      const foundUser = await this._usersRepository.find(_id);

      if (!foundUser) {
        throw new Error("User wasn't found");
      }

      const allCurrenciesList = Object.values(Currencies)
        .map(getCurrencyWithFlag)
        .join(', ');
      const userCurrenciesList = foundUser.currencies
        .map(getCurrencyWithFlag)
        .join(', ');

      const msg = `Я агрегирую курс обмена наличных валют в Украине 🇺🇦 из открытых источников, которые обновляются каждые 10 минут и содержат наиболее актуальную информацию – последние установленные на текущий момент курсы валют в банках и ПОВ Украины.\nЯ знаю курс валют для:\n${allCurrenciesList}\n\nСейчас в твоем списке такие валюты:\n*${userCurrenciesList}*`;

      const options: TelegramBot.SendMessageOptions = {
        parse_mode: 'Markdown',
      };

      this._bot.sendMessage(_id, msg, options);
    } catch (e) {
      console.error(e);
    }
  };

  private _callbackQuery = async (CallbackQuery: TelegramBot.CallbackQuery) => {
    try {
      const { data, message } = CallbackQuery;
      const { text, message_id: messageId } = message!;
      const { id: _id } = message!.chat;

      const editMessageOptions = {
        chat_id: _id,
        message_id: messageId,
        reply_markup: {
          parse_mode: 'Markdown',
          inline_keyboard: [],
        },
      };

      this._bot.editMessageText(text!, editMessageOptions);

      const { action, payload }: IAction = JSON.parse(data!);

      switch (action) {
        case Actions.ADD_CURRENCIES: {
          this.handleAddCurrencies(_id);
          break;
        }
        case Actions.REMOVE_CURRENCIES: {
          this.handleRemoveCurrencies(_id);
          break;
        }
        case Actions.ADD_CURRENCY: {
          this.handleAddCurrency(_id, payload);
          break;
        }
        case Actions.REMOVE_CURRENCY: {
          this.handleRemoveCurrency(_id, payload);
          break;
        }
        default: {
          const _: never = action;
          throw new Error(`Unknown action ${_}`);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  private handleAddCurrencies = async (_id: number) => {
    try {
      const foundUser = await this._usersRepository.find(_id);

      if (!foundUser) {
        throw new Error("User wasn't found");
      }

      const { currencies } = foundUser;

      const globalCurrencies = Object.values(Currencies);

      const potentialCurrencies = difference(globalCurrencies, currencies);

      if (!potentialCurrencies.length) {
        this._bot.sendMessage(
          _id,
          'У тебя уже максимальное количество валют 😉',
        );
        return;
      }

      const options: TelegramBot.SendMessageOptions = {
        reply_markup: {
          inline_keyboard: potentialCurrencies.map((currency) => [
            {
              text: currency,
              callback_data: JSON.stringify({
                action: Actions.ADD_CURRENCY,
                payload: currency,
              }),
            },
          ]),
        },
      };

      this._bot.sendMessage(_id, 'Какую валюту необходимо добавить?', options);
    } catch (e) {
      console.error(e);
    }
  };

  private handleAddCurrency = async (_id: number, currency: Currencies) => {
    try {
      await this._usersRepository.addCurrency(_id, currency);

      const options: TelegramBot.SendMessageOptions = {
        parse_mode: 'Markdown',
      };

      this._bot.sendMessage(
        _id,
        `Готово! Добавили: *${getCurrencyWithFlag(currency)}*`,
        options,
      );
    } catch (e) {
      console.error(e);
    }
  };

  private handleRemoveCurrencies = async (_id: number) => {
    try {
      const foundUser = await this._usersRepository.find(_id);

      if (!foundUser) {
        throw new Error("User wasn't found");
      }

      const { currencies } = foundUser;

      if (!currencies.length) {
        this._bot.sendMessage(_id, 'Нет активных валют 🤭');
        return;
      }

      const options: TelegramBot.SendMessageOptions = {
        reply_markup: {
          inline_keyboard: currencies.map((currency) => [
            {
              text: currency,
              callback_data: JSON.stringify({
                action: Actions.REMOVE_CURRENCY,
                payload: currency,
              }),
            },
          ]),
        },
      };

      this._bot.sendMessage(_id, 'Какую валюту необходимо удалить?', options);
    } catch (e) {
      console.error(e);
    }
  };

  private handleRemoveCurrency = async (_id: number, currency: Currencies) => {
    try {
      await this._usersRepository.removeCurrency(_id, currency);

      const options: TelegramBot.SendMessageOptions = {
        parse_mode: 'Markdown',
      };

      this._bot.sendMessage(
        _id,
        `Готово! Удалили *${getCurrencyWithFlag(currency)}*`,
        options,
      );
    } catch (e) {
      console.error(e);
    }
  };
}

export default Bot;
