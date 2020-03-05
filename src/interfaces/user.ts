import { Currencies } from './common';

interface IUser {
  _id: number;
  currencies: Currencies[];
  firstName?: string;
  lastName?: string;
  username?: string;
}

export default IUser;
