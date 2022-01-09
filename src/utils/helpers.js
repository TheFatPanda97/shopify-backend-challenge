import _ from 'underscore';

export const isPositiveFloat = (rawNum) => {
  const num = Number(rawNum);

  if (_.isNumber(num) && num >= 0) {
    return true;
  }

  return false;
};

export const isPositiveInteger = (rawNum) => {
  const num = Number(rawNum);

  if (Number.isInteger(num) && num >= 0) {
    return true;
  }

  return false;
};
