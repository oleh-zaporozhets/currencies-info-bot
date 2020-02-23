import mongodb from 'mongodb';
import IUser from '@/interfaces/user';

class UsersRepository {
  public constructor(private readonly _collection: mongodb.Collection) {}

  public find = async (_id: number) => {
    const user = await this._collection.findOne<IUser>({
      _id,
    });

    return user;
  };

  public insert = async (user: IUser) => {
    await this._collection.insertOne(user);

    return user;
  };
}

export default UsersRepository;
