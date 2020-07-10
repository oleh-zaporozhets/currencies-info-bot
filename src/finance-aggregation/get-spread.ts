import { SPREAD, ICurrency } from '@/interfaces/common';

export default (spread: SPREAD) => (currency: ICurrency) => currency[spread];
