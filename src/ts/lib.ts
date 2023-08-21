import { ColumnInfo } from "@/types";
import { faker as f } from "@faker-js/faker";
import mappingInfo from "./postgres-types-mapping.json";

const fakerLib = f;

export const generate = (
  dbInfo: Record<string, Array<ColumnInfo>>,
  options?: any,
) => {
  const numberOfRecords = options?.numberOfRecords || 2;
  const tables: Array<string> = Object.keys(dbInfo);
  if (!tables.length || !numberOfRecords) {
    return;
  }

  const insertScript = tables.reduce((script, table) => {
    return (script += getInsertScriptForTable(
      table,
      dbInfo[table],
      numberOfRecords,
    ));
  }, "");
  return insertScript;
};

export const saveToFile = (
  data,
  fileName = "download",
  type = "application/text",
) => {
  const downloadable = new Blob([data], { type: type });
  const url = window.URL.createObjectURL(downloadable);
  const tempLink = document.createElement("a");
  tempLink.href = url;
  tempLink.setAttribute("download", fileName);
  tempLink.click();
};
export const getDefaultMapping = (columnType) => {
  let { fakeType, fakeSubType, defaultValue } = mappingInfo[columnType]
    ? mappingInfo[columnType]
    : mappingInfo["default"];
  if (fakeType && fakeSubType) {
    defaultValue = fakerLib[fakeType][fakeSubType]().toString();
  }
  return [fakeType, fakeSubType, defaultValue];
};

export const getMainTypes = () => {
  return Object.getOwnPropertyNames(fakerLib).filter(
    (property) => typeof fakerLib[property] === "object",
  );
};

export const getSubType = (mainType) => {
  return Object.getOwnPropertyNames(fakerLib[mainType]).filter(
    (property) => typeof fakerLib[mainType][property] === "function",
  );
};

export const getData = (mainType, subType) => {
  if (mainType && subType) {
    return fakerLib[mainType][subType]();
  }
  return "";
};

const getInsertScriptForTable = (table, columns, noOfRecords) => {
  let columnsToInsert = getColumnNamesScript(table, columns);

  let dataForInsert: string = "";
  for (let i = 0; i < noOfRecords; ++i) {
    dataForInsert += getColumnsDataScript(columns);
  }
  return columnsToInsert + dataForInsert;
};

const getColumnNamesScript = (table, columns) => {
  let columnsToInsert = `\nINSERT INTO ${table} (`;
  columns.forEach((column) => {
    columnsToInsert += column.name;
    columnsToInsert += ", ";
  });
  columnsToInsert =
    columnsToInsert.substring(0, columnsToInsert.length - 1) + ") VALUES ";

  return columnsToInsert;
};

const getColumnsDataScript = (columns: Array<ColumnInfo>) => {
  let dataForInsert = "\n(";
  columns.forEach((column) => {
    let fakeData = "";
    if (column.fakeMainType && column.fakeSubType) {
      fakeData = fakerLib[column.fakeMainType][column.fakeSubType]().toString();
    } else {
      console.log("sample");
      console.log(column);
      fakeData = column.sample;
    }
    const isQuotesRequired = mappingInfo[column.type]?.isQuotesRequired;
    fakeData = isQuotesRequired ? "'" + fakeData + "'" : fakeData;
    dataForInsert += fakeData;
    dataForInsert += ", ";
  });
  dataForInsert = dataForInsert.substring(0, dataForInsert.length - 1) + ")";

  return dataForInsert;
};
