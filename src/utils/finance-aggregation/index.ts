import FinanceApi from '@/api/finance';
import { Currencies, Spread } from '@/interfaces/common';
import { IOrganization } from '@/interfaces/api-finance';
import getArrayOfCurrencies from '@/utils/get-array-of-currencies';
import getSpread from '@/utils/get-spread';
import getAverage from '@/utils/get-average';
import getCurrencyWithFlag from '@/utils/get-currency-with-flag';

class FinanceAggregation {
  private _data: IOrganization[] | null = null;
  private _fetchedTime: number = Date.now();

  public constructor(private _financeApi: FinanceApi) {}

  public getAggregation = async (currencies: Array<Currencies>) => {
    const organizations = await this._getData();

    return currencies.map((lookingCurrency) => {
      const currency = organizations
        .map(getArrayOfCurrencies(lookingCurrency))
        .filter((it) => it);

      const currencyAskAverage = currency
        .map(getSpread(Spread.ask))
        .reduce(getAverage);

      const currencyBidAverage = currency
        .map(getSpread(Spread.bid))
        .reduce(getAverage);

      const currencyWeightedAverage = [
        currencyAskAverage,
        currencyBidAverage,
      ].reduce(getAverage);

      return `*${getCurrencyWithFlag(lookingCurrency)}:*\nкупить: *${currencyBidAverage} UAH*\nпродать: *${currencyAskAverage} UAH*\nсреднее: *${currencyWeightedAverage} UAH*`;
    });
  };

  private _getData = async () => {
    if (!this._data || !this._isFresh()) {
      const {
        organizations,
      } = await this._financeApi.getCurrenciesExchangeRate();

      this._data = organizations;
      this._fetchedTime = Date.now();
    }

    return this._data;
  };

  private _isFresh = () => Date.now() - this._fetchedTime >= 2 * 60 * 1000;
}

export default FinanceAggregation;
