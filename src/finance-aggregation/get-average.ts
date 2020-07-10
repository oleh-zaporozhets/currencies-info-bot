export default (
  previousValue: string | number,
  currentValue: string | number,
  currentIndex: number,
  array: string[],
) => {
  const { length } = array;

  const previousValueInt = typeof previousValue === 'string' ? Number(previousValue) : previousValue;

  const currentValueInt = typeof currentValue === 'string' ? Number(currentValue) : currentValue;

  if (currentIndex === length - 1) {
    const finalSum = previousValueInt + currentValueInt;

    return String(Math.round((finalSum / length) * 100) / 100);
  }

  return String(previousValueInt + currentValueInt);
};
