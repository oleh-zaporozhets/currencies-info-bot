import { IFinanceResponse } from '@/interfaces/api/finance';
import HttpClient from './http-client';

export default class extends HttpClient {
  public constructor() {
    super(process.env.FINANCE_BASE_URL);
  }

  public getCurrenciesExchangeRate = () => (
    this.instance.get<IFinanceResponse>('/ru/public/currency-cash.json'));
}
