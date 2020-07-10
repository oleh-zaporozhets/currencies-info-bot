import { Collection, Db } from 'mongodb';

export default abstract class<T> {
  protected readonly collection: Collection<T>;

  public constructor(collectionName: string, db: Db) {
    this.collection = db.collection<T>(collectionName);
  }
}
