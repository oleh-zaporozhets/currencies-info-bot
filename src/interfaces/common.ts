enum CURRENCIES {
  'EUR' = 'EUR',
  'USD' = 'USD',
  'RUB' = 'RUB',
  'PLN' = 'PLN',
  'GBP' = 'GBP',
  'ILS' = 'ILS',
}

enum SPREAD {
  'BID' = 'bid',
  'ASK' = 'ask',
}

interface ICurrency {
  [SPREAD.BID]: string;
  [SPREAD.ASK]: string;
}

export { CURRENCIES, SPREAD, ICurrency };
