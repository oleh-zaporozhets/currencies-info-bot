import mongodb from 'mongodb';
import IUser from '@/interfaces/user';
import { Currencies } from '@/interfaces/common';

class UsersRepository {
  public constructor(private readonly _collection: mongodb.Collection) {}

  public find = async (_id: number) => {
    const user = await this._collection.findOne<IUser>({ _id });

    return user;
  };

  public insert = async (user: IUser) => {
    await this._collection.insertOne(user);

    return user;
  };

  public addCurrency = async (_id: number, currency: Currencies) => {
    await this._collection.updateOne(
      { _id },
      { $addToSet: { currencies: currency } },
    );
  };

  public removeCurrency = async (_id: number, currency: Currencies) => {
    await this._collection.updateOne(
      { _id },
      { $pull: { currencies: currency } },
    );
  };
}

export default UsersRepository;
