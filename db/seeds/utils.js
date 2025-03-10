const db = require("../../db/connection");
const format = require("pg-format");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.createLookupObject = (array, key1, key2) => {
  const lookupObject = {};
  if (array.length === 0) return lookupObject;
  array.forEach((obj) => {
    if (!Object.keys(lookupObject).includes(obj[key1])) {
      lookupObject[obj[key1]] = obj[key2];
    }
  });
  return lookupObject;
};

exports.swapKeys = (data, lookupObj, oldKey, newKey) => {
  const newData = [];
  if (data.length === 0) return newData;
  data.forEach((obj) => {
    const newObj = { ...obj };
    newObj[newKey] = lookupObj[newObj[oldKey]];
    delete newObj[oldKey];
    newData.push(newObj);
  });
  return newData;
};

exports.checkExists = (table, column, value) => {
  const queryStr = format(`SELECT * FROM %I WHERE %I = $1`, table, column);
  return db.query(queryStr, [value]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Resource not found" });
    }
  });
};
