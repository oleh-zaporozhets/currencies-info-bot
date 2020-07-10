import { IOrganization } from '@/interfaces/api/finance';
import { CURRENCIES } from '@/interfaces/common';

export default (currency: CURRENCIES) => (organization: IOrganization) => (
  organization.currencies[currency]);
