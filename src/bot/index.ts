import difference from 'lodash/difference';
import isNull from 'lodash/isNull';
import TelegramBot from 'node-telegram-bot-api';
import FinanceAggregation from '@/finance-aggregation';
import { ACTIONS, IAction } from '@/interfaces/bot';
import { CURRENCIES } from '@/interfaces/common';
import User from '@/models/user';
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
    this.bot.onText(/\/start/, this.start);

    this.bot.onText(/\/menu/, this.menu);

    this.bot.onText(/Актуальный курс валют 💱/, this.exchange);
    this.bot.onText(/\/exchange/, this.exchange);

    this.bot.onText(/Настройки ⚙️/, this.settings);
    this.bot.onText(/\/settings/, this.settings);

    this.bot.onText(/Информация ℹ️/, this.information);
    this.bot.onText(/\/information/, this.information);

    this.bot.on('callback_query', this.callbackQuery);
  };

  private getMenuButtons = (): TelegramBot.SendMessageOptions => ({
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

  private start = async (message: TelegramBot.Message) => {
    const {
      id,
      first_name: firstName,
      last_name: lastName,
      username,
    } = message.chat;

    const user: User = {
      _id: id,
      currencies: [CURRENCIES.USD, CURRENCIES.EUR],
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

  private menu = (message: TelegramBot.Message) => {
    const { id } = message.chat;

    this.bot.sendMessage(id, 'Меню:', this.getMenuButtons());
  };

  private exchange = async (message: TelegramBot.Message) => {
    try {
      const { id } = message.chat;

      const foundUser = await this.usersRepository.findOneById(id);

      if (!foundUser) {
        throw new Error("User wasn't found");
      }

      const { currencies } = foundUser;

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

      const options: TelegramBot.SendMessageOptions = {
        parse_mode: 'Markdown',
      };

      this.bot.sendMessage(id, responseToString, options);
    } catch (e) {
      console.error(e);
    }
  };

  private settings = async (message: TelegramBot.Message) => {
    try {
      const { id } = message.chat;

      const foundUser = await this.usersRepository.findOneById(id);

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
                  action: ACTIONS.ADD_CURRENCIES,
                }),
              },
            ],
            [
              {
                text: 'Удалить валюту',
                callback_data: JSON.stringify({
                  action: ACTIONS.REMOVE_CURRENCIES,
                }),
              },
            ],
          ],
        },
      };

      const activeCurrencies = currencies.map(getCurrencyWithFlag).join(', ');

      this.responseBuilder.addLine('Список активных валют:');
      this.responseBuilder.addBoldLine(activeCurrencies);

      const msg = this.responseBuilder.getResponse();

      this.bot.sendMessage(id, msg, options);
    } catch (e) {
      console.error(e);
    }
  };

  private information = async (message: TelegramBot.Message) => {
    try {
      const { id } = message.chat;

      const foundUser = await this.usersRepository.findOneById(id);

      if (!foundUser) {
        throw new Error("User wasn't found");
      }

      const allCurrenciesList = Object.values(CURRENCIES).map(getCurrencyWithFlag).join(', ');
      const userCurrenciesList = foundUser.currencies.map(getCurrencyWithFlag).join(', ');

      this.responseBuilder.addLine('Я агрегирую курс обмена наличных валют в Украине 🇺🇦 из открытых источников, которые обновляются каждые 10 минут и содержат наиболее актуальную информацию — последние установленные на текущий момент курсы валют в банках и ПОВ Украины.');
      this.responseBuilder.addLine('Я знаю курс валют для:');
      this.responseBuilder.addLine(allCurrenciesList);
      this.responseBuilder.addEmptyLine();
      this.responseBuilder.addLine('Сейчас в твоем списке такие валюты:');
      this.responseBuilder.addBoldLine(userCurrenciesList);

      const msg = this.responseBuilder.getResponse();

      const options: TelegramBot.SendMessageOptions = {
        parse_mode: 'Markdown',
      };

      this.bot.sendMessage(id, msg, options);
    } catch (e) {
      console.error(e);
    }
  };

  private callbackQuery = async (CallbackQuery: TelegramBot.CallbackQuery) => {
    try {
      const { data, message } = CallbackQuery;
      const { text, message_id: messageId } = message!;
      const { id } = message!.chat;

      const editMessageOptions = {
        chat_id: id,
        message_id: messageId,
        reply_markup: {
          parse_mode: 'Markdown',
          inline_keyboard: [],
        },
      };

      this.bot.editMessageText(text!, editMessageOptions);

      const { action, payload }: IAction = JSON.parse(data!);

      switch (action) {
        case ACTIONS.ADD_CURRENCIES: {
          this.handleAddCurrencies(id);
          break;
        }
        case ACTIONS.REMOVE_CURRENCIES: {
          this.handleRemoveCurrencies(id);
          break;
        }
        case ACTIONS.ADD_CURRENCY: {
          this.handleAddCurrency(id, payload);
          break;
        }
        case ACTIONS.REMOVE_CURRENCY: {
          this.handleRemoveCurrency(id, payload);
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

  private handleAddCurrencies = async (id: number) => {
    try {
      const foundUser = await this.usersRepository.findOneById(id);

      if (!foundUser) {
        throw new Error("User wasn't found");
      }

      const { currencies } = foundUser;

      const globalCurrencies = Object.values(CURRENCIES);

      const potentialCurrencies = difference(globalCurrencies, currencies);

      if (!potentialCurrencies.length) {
        this.bot.sendMessage(id, 'У тебя уже максимальное количество валют 😉');
        return;
      }

      const options: TelegramBot.SendMessageOptions = {
        reply_markup: {
          inline_keyboard: potentialCurrencies.map((currency) => [
            {
              text: currency,
              callback_data: JSON.stringify({
                action: ACTIONS.ADD_CURRENCY,
                payload: currency,
              }),
            },
          ]),
        },
      };

      this.bot.sendMessage(id, 'Какую валюту необходимо добавить?', options);
    } catch (e) {
      console.error(e);
    }
  };

  private handleAddCurrency = async (_id: number, currency: CURRENCIES) => {
    try {
      await this.usersRepository.addCurrency(_id, currency);

      const options: TelegramBot.SendMessageOptions = {
        parse_mode: 'Markdown',
      };

      this.bot.sendMessage(_id, `Готово! Добавили: *${getCurrencyWithFlag(currency)}*`, options);
    } catch (e) {
      console.error(e);
    }
  };

  private handleRemoveCurrencies = async (_id: number) => {
    try {
      const foundUser = await this.usersRepository.findOneById(_id);

      if (!foundUser) {
        throw new Error("User wasn't found");
      }

      const { currencies } = foundUser;

      if (!currencies.length) {
        this.bot.sendMessage(_id, 'Нет активных валют 🤭');
        return;
      }

      const options: TelegramBot.SendMessageOptions = {
        reply_markup: {
          inline_keyboard: currencies.map((currency) => [
            {
              text: currency,
              callback_data: JSON.stringify({
                action: ACTIONS.REMOVE_CURRENCY,
                payload: currency,
              }),
            },
          ]),
        },
      };

      this.bot.sendMessage(_id, 'Какую валюту необходимо удалить?', options);
    } catch (e) {
      console.error(e);
    }
  };

  private handleRemoveCurrency = async (_id: number, currency: CURRENCIES) => {
    try {
      await this.usersRepository.removeCurrency(_id, currency);

      const options: TelegramBot.SendMessageOptions = {
        parse_mode: 'Markdown',
      };

      this.bot.sendMessage(_id, `Готово! Удалили *${getCurrencyWithFlag(currency)}*`, options);
    } catch (e) {
      console.error(e);
    }
  };
}
