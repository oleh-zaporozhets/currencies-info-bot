import { IFinanceResponse } from '@/interfaces/api-finance';
import AxiosClient from './axios-client';

class FinanceApi extends AxiosClient {
  public constructor() {
    super('http://resources.finance.ua/');
  }

  public getCurrenciesExchangeRate = () => this._instance.get<IFinanceResponse>('/ru/public/currency-cash.json');
}

export default FinanceApi;
