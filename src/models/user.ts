import { CURRENCIES } from '@/interfaces/common';

export default class {
  public constructor(
    public readonly currencies: CURRENCIES[],
    public readonly _id: number,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly username?: string,
    public readonly createdAt?: number,
  ) {}
}
