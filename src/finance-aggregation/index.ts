import FinanceApi from '@/api/finance';
import { IOrganization } from '@/interfaces/api/finance';
import { CURRENCIES, SPREAD } from '@/interfaces/common';
import ResponseBuilder from '@/response-builder';
import getCurrencyWithFlag from '@/utils/get-currency-with-flag';
import getArrayOfCurrencies from './get-array-of-currencies';
import getAverage from './get-average';
import getSpread from './get-spread';

export default class {
  private data?: IOrganization[];

  private fetchedTime: number = Date.now();

  public constructor(
    private readonly financeApi: FinanceApi,
    private readonly responseBuilder: ResponseBuilder,
  ) {}

  public getAggregation = async (currencies: CURRENCIES[]) => {
    const organizations = await this.getData();

    return currencies.map((lookingCurrency) => {
      const foundCurrencies = organizations
        .map(getArrayOfCurrencies(lookingCurrency))
        .filter((currency) => currency);

      if (!foundCurrencies.length) return null;

      const currencyAskAverage = foundCurrencies.map(getSpread(SPREAD.ASK)).reduce(getAverage);

      const currencyBidAverage = foundCurrencies.map(getSpread(SPREAD.BID)).reduce(getAverage);

      const currencyAverage = [currencyAskAverage, currencyBidAverage].reduce(getAverage);

      this.responseBuilder.addBoldLine(`${getCurrencyWithFlag(lookingCurrency)}:`);
      this.responseBuilder.addLine(`купить: *${currencyBidAverage} UAH*`);
      this.responseBuilder.addLine(`продать: *${currencyAskAverage} UAH*`);
      this.responseBuilder.addLine(`среднее: *${currencyAverage} UAH*`);

      return this.responseBuilder.getResponse();
    });
  };

  private getData = async () => {
    if (!this.data || !this.isFresh()) {
      const { organizations } = await this.financeApi.getCurrenciesExchangeRate();

      this.data = organizations;
      this.fetchedTime = Date.now();
    }

    return this.data;
  };

  private isFresh = () => Date.now() - this.fetchedTime <= 5 * 60 * 1000;
}
