enum Actions {
  'ADD_CURRENCIES' = 'ADD_CURRENCIES',
  'REMOVE_CURRENCIES' = 'REMOVE_CURRENCIES',
  'ADD_CURRENCY' = 'ADD_CURRENCY',
  'REMOVE_CURRENCY' = 'REMOVE_CURRENCY',
}

interface IAction {
  action: Actions;
  payload?: any;
}

export { Actions, IAction };
