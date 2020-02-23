enum Currencies {
  'EUR' = 'EUR',
  'USD' = 'USD',
}

enum Spread {
  'bid' = 'bid',
  'ask' = 'ask',
}

interface Currency {
  ask: Spread.ask;
  bid: Spread.bid;
}

export { Currencies, Spread, Currency };
