import { CURRENCIES } from './common';

enum ACTIONS {
  'TOGGLE_CURRENCY' = 'TOGGLE_CURRENCY',
}

interface IToggleAction {
  action: ACTIONS.TOGGLE_CURRENCY;
  payload: CURRENCIES;
}

type Actions = IToggleAction;

export { ACTIONS, Actions };
