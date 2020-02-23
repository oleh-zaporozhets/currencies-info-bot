import { Spread, Currency } from '@/interfaces/common';

function getSpread(spread: Spread) {
  return (currency: Currency) => currency[spread];
}

export default getSpread;
