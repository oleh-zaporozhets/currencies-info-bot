function getAverage(
  previousValue: string | number,
  currentValue: string | number,
  currentIndex: number,
  array: string[],
) {
  const { length } = array;

  if (typeof previousValue === 'string') {
    previousValue = Number(previousValue);
  }

  if (typeof currentValue === 'string') {
    currentValue = Number(currentValue);
  }

  if (currentIndex === length - 1) {
    const finalSum = previousValue + currentValue;

    return String(Math.round((finalSum / length) * 100) / 100);
  }

  return String(previousValue + currentValue);
}

export default getAverage;
