const { BadRequestError } = require("../expressError");

/** Generate a SQL partial update query and corresponding values.
 *
 * This function takes an object with fields to update and an object
 * mapping JavaScript-style field names to SQL-style column names.
 * It returns an object containing a SQL `SET` clause string and an
 * array of values to be updated.
 *
 * Example:
 *  dataToUpdate input: { firstName: 'Aliya', age: 32 };
 *  jsToSql input: { firstName: 'first_name' };
 *   output:
 *   {
 *   setCols: '"first_name"=$1, "age"=$2',
 *   values: ['Aliya', 32]
 *   }
 **/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
