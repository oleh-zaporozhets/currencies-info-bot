import { Currencies, Currency } from './common';

interface IOrganization {
  id: string;
  oldId: number;
  orgType: number;
  branch: boolean;
  title: string;
  regionId: string;
  cityId: string;
  phone: string;
  address: string;
  link: string;
  currencies: {
    [key in Currencies]: Currency;
  };
}

interface IFinanceResponse {
  organizations: IOrganization[];
}

export { IFinanceResponse, Currencies, IOrganization };
