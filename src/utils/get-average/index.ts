import getSum from '../get-sum';

function getAverage(array: Array<number | string>) {
  const { length } = array;
  let sum = array.reduce(getSum);

  if (typeof sum === 'string') {
    sum = Number(sum);
  }

  return Math.round((sum / length) * 100) / 100;
}

export default getAverage;
