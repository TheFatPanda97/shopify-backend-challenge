import _ from 'underscore';

/**
 * @param {number|string} rawNum
 * @returns {boolean}
 * if rawNum is a positive number or a string that can be parsed to a positive number.
 * Note: 0 is positive in this case.
 */
export const isPositiveFloat = (rawNum) => {
  if (rawNum === '') {
    return false;
  }

  const num = Number(rawNum);

  if (_.isNumber(num) && num >= 0) {
    return true;
  }

  return false;
};

/**
 * @param {number|string} rawNum
 * @returns {boolean}
 * if rawNum is a positive integer or a string that can be parsed to a positive integer
 * Note: 0 is positive in this case.
 */
export const isPositiveInteger = (rawNum) => {
  if (rawNum === '') {
    return false;
  }

  const num = Number(rawNum);

  if (Number.isInteger(num) && num >= 0) {
    return true;
  }

  return false;
};
