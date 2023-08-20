import { ColumnInfo } from "@/types";
import { faker } from "@faker-js/faker";

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

const getColumnsDataScript = (columns) => {
  let dataForInsert = "\n(";
  columns.forEach((column) => {
    let fakeData = "";
    if (column.fakerMainType && column.fakerSubType) {
      fakeData = faker[column.fakerMainType][column.fakerSubType]().toString();
    }
    dataForInsert += fakeData;
    dataForInsert += ", ";
  });
  dataForInsert = dataForInsert.substring(0, dataForInsert.length - 1) + ")";

  return dataForInsert;
};
