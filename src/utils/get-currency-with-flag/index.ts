import { Currencies } from '@/interfaces/common';

function getCurrencyWithFlag(currency: Currencies) {
  switch (currency) {
    case Currencies.USD: {
      return `${currency} 🇺🇸`;
    }
    case Currencies.EUR: {
      return `${currency} 🇪🇺`;
    }
    case Currencies.GBP: {
      return `${currency} 🇬🇧`;
    }
    case Currencies.PLN: {
      return `${currency} 🇵🇱`;
    }
    case Currencies.RUB: {
      return `${currency} 🇷🇺`;
    }
    default: {
      const _: never = currency;
      throw new Error(`Unknown currency for flag case ${_}`);
    }
  }
}

export default getCurrencyWithFlag;
