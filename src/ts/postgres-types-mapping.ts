import { faker } from "@faker-js/faker";

export const defaultMapping = (columnType) => {
  let fakeType;
  let fakeSubType;
  let defaultValue;

  switch (columnType) {
    case "int4":
      fakeType = "number";
      fakeSubType = "int";
      break;
    case "int8":
      fakeType = "number";
      fakeSubType = "bigInt";
      break;
    case "bool":
      fakeType = "datatype";
      fakeSubType = "boolean";
      break;
    case "timestamptz":
      fakeType = "date";
      fakeSubType = "past";
      break;
    case "json":
      defaultValue = JSON.stringify({});
      break;
    case "text":
      fakeType = "lorem";
      fakeSubType = "paragraphs";
      break;
    default:
      fakeType = "word";
      fakeSubType = "noun";
  }
  if (fakeType && fakeSubType) {
    defaultValue = faker[fakeType][fakeSubType]();
  }
  return [fakeType, fakeSubType, defaultValue];
};
