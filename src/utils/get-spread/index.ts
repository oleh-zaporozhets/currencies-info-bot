import { Spread, ICurrency } from '@/interfaces/common';

function getSpread(spread: Spread) {
  return (currency: ICurrency) => currency[spread];
}

export default getSpread;
