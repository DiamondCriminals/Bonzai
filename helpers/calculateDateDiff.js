const calculateDateDiff = (fromDate, toDate) => {
  const timeDiff = toDate.getTime() - fromDate.getTime();

  return timeDiff / (1000 * 3600 * 24);
};

module.exports = calculateDateDiff;
