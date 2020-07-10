import { Db } from 'mongodb';
import xor from 'lodash/xor';
import User from '@/models/user';
import { CURRENCIES } from '@/interfaces/common';
import Repository from './repository';

export default class extends Repository<User> {
  public constructor(db: Db) {
    super('users', db);
  }

  private findUserById = async (_id: number) => {
    const user = await this.collection.findOne({ _id });

    if (!user) {
      throw new Error(`User ${_id} was not found`);
    }

    return user;
  };

  public upsert = (user: Omit<User, 'currencies'>) => (
    this.collection.findOneAndUpdate(
      { _id: user._id },
      {
        $set: { ...user },
        $setOnInsert: { createdAt: Date.now(), currencies: [CURRENCIES.EUR, CURRENCIES.USD] },
      },
      { upsert: true, returnOriginal: false },
    ));

  public getCurrenciesForUserById = async (_id: number) => {
    const { currencies } = await this.findUserById(_id);

    return currencies;
  };

  public toggleCurrencyForUserById = async (_id: number, currency: CURRENCIES) => {
    const user = await this.findUserById(_id);

    const { currencies } = user;

    const updatedCurrencies = xor(currencies, [currency]);

    return this.collection.findOneAndUpdate(
      { _id },
      { $set: { currencies: updatedCurrencies } },
      { returnOriginal: false },
    );
  };
}
