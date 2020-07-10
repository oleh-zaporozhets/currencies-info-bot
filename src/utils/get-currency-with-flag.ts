import { CURRENCIES } from '@/interfaces/common';
import neverReached from '@/utils/never-reached';

export default (currency: CURRENCIES) => {
  switch (currency) {
    case CURRENCIES.USD: {
      return `${currency} 🇺🇸`;
    }
    case CURRENCIES.EUR: {
      return `${currency} 🇪🇺`;
    }
    case CURRENCIES.GBP: {
      return `${currency} 🇬🇧`;
    }
    case CURRENCIES.PLN: {
      return `${currency} 🇵🇱`;
    }
    case CURRENCIES.RUB: {
      return `${currency} 🇷🇺`;
    }
    case CURRENCIES.ILS: {
      return `${currency} 🇮🇱`;
    }
    default: {
      neverReached(currency);
      throw new Error(`Unknown currency for flag case ${currency}`);
    }
  }
};
