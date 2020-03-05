enum Currencies {
  'EUR' = 'EUR',
  'USD' = 'USD',
}

enum Spread {
  'bid' = 'bid',
  'ask' = 'ask',
}

interface Currency {
  [Spread.bid]: string;
  [Spread.ask]: string;
}

export { Currencies, Spread, Currency };
