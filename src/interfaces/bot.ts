enum ACTIONS {
  'ADD_CURRENCIES' = 'ADD_CURRENCIES',
  'REMOVE_CURRENCIES' = 'REMOVE_CURRENCIES',
  'ADD_CURRENCY' = 'ADD_CURRENCY',
  'REMOVE_CURRENCY' = 'REMOVE_CURRENCY',
}

interface IAction {
  action: ACTIONS;
  payload?: any;
}

export { ACTIONS, IAction };
