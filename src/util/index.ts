const formatNumber = (number: number) => `0${number}`.slice(-2);

const getRemaining = (time: number) => {
  const hours = Math.floor(time / 3600);
  const leftTime = time - 3600 * hours;

  const mins = Math.floor(leftTime / 60);
  const secs = leftTime - mins * 60;
  return {
    hours: formatNumber(hours),
    mins: formatNumber(mins),
    secs: formatNumber(secs),
  };
};

const numberWithCommas = (number: string | number) => {
  const commaAddedNumber = number.toString().split('.');
  commaAddedNumber[0] = commaAddedNumber[0].replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ',',
  );
  return commaAddedNumber.join('.');
};

export {formatNumber, getRemaining, numberWithCommas};
