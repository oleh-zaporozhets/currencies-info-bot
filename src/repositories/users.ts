import { Db } from 'mongodb';
import User from '@/models/user';
import { CURRENCIES } from '@/interfaces/common';
import Repository from './repository';

export default class extends Repository<User> {
  public constructor(db: Db) {
    super('users', db);
  }

  public findOneById = async (_id: number) => this.collection.findOne({ _id });

  public upsert = (user: User) => (
    this.collection.findOneAndUpdate(
      { _id: user._id },
      { $set: { ...user }, $setOnInsert: { createdAt: Date.now() } },
      { upsert: true, returnOriginal: false },
    ));

  public insert = async (user: User) => this.collection.insertOne(user);

  public addCurrency = async (_id: number, currency: CURRENCIES) => (
    this.collection.updateOne({ _id }, { $addToSet: { currencies: currency } }));

  public removeCurrency = async (_id: number, currency: CURRENCIES) => (
    this.collection.updateOne({ _id }, { $pull: { currencies: currency } }));
}
