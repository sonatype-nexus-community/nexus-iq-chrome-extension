const epochToJsDate = (ts) => {
  // ts = epoch timestamp
  // returns date obj
  return new Date(ts * 1000);
};
const jsDateToEpoch = (d) => {
  // d = javascript date obj
  // returns epoch timestamp
  console.log(d);
  if (!(d instanceof Date)) {
    throw new TypeError("Bad date passed in");
  } else {
    return (d.getTime() - d.getMilliseconds()) / 1000;
  }
};

export { epochToJsDate, jsDateToEpoch };
