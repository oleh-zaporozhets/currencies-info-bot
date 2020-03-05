import { Currencies } from '@/interfaces/common';
import { IOrganization } from '@/interfaces/api-finance';

function getArrayOfCurrencies(currency: Currencies) {
  return (organization: IOrganization) => organization.currencies[currency];
}

export default getArrayOfCurrencies;
