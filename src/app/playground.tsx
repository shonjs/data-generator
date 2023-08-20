"use client";

import {
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Box,
  Button,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { faker } from "@faker-js/faker";
import { ColumnInfo } from "@/types";
import { generate, saveToFile } from "../ts/lib";
import { defaultMapping } from "@/ts/postgres-types-mapping";

export default function Playground({
  dbInfo,
}: {
  dbInfo: Record<string, Array<ColumnInfo>>;
}) {
  const [table, setTable] = useState(Object.keys(dbInfo)[0]);
  const [columns, setColumns] = useState<Array<ColumnInfo>>([]);

  const setDefaultMappings = (columns: Array<ColumnInfo>) => {
    return columns.map((column) => {
      if (!column.fakeMainType && !column.fakeSubType) {
        [column.fakeMainType, column.fakeSubType, column.sample] =
          defaultMapping(column.type);
      }
      return column;
    });
  };

  const changeFakeType = (e, columnName: string) => {
    const newColumns = columns?.map((column) => {
      if (column.name === columnName) {
        return { ...column, fakeMainType: e.target.value };
      } else {
        return column;
      }
    });
    setColumns(newColumns);
  };

  const changeFakeSubType = (e, columnName) => {
    const newColumns = columns?.map((column) => {
      if (column.name === columnName) {
        return {
          ...column,
          fakeSubType: e.target.value,
          sample: faker[column.fakeMainType][e.target.value](),
        };
      } else {
        return column;
      }
    });
    setColumns(newColumns);
  };

  useEffect(() => {
    setColumns(dbInfo[table]);
  }, [table, dbInfo]);

  const fileSelected = (e) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsText(file);
    reader.onload = (e) => {
      const columnMappings = reader.result
        ? JSON.parse(reader.result.toString())
        : {};
      setColumns(columnMappings[table]);
    };
  };

  const saveScript = (e, data) => {
    const script = generate(data);
    if (script) {
      console.log("script", script);
    }
  };

  const tablesList = Object.keys(dbInfo)?.map((table, index) => (
    <option value={table} key={index}>
      {table}
    </option>
  ));

  const mainOptions = Object.getOwnPropertyNames(faker)
    .filter((property) => typeof faker[property] === "object")
    .map((fakerKey, index) => (
      <option value={fakerKey.toString()} key={fakerKey}>
        {fakerKey.toString()}
      </option>
    ));

  const subOptions = (fakerKey) => {
    if (!fakerKey) {
      return <></>;
    }
    return Object.getOwnPropertyNames(faker[fakerKey])
      .filter((property) => typeof faker[fakerKey][property] === "function")
      .map((fakerSubKey, index) => {
        return (
          <option value={fakerSubKey.toString()} key={fakerSubKey}>
            {fakerSubKey.toString()}
          </option>
        );
      });
  };
  const columnRows = columns?.map((column, index) => (
    <Tr key={index}>
      <Td>{column.name}</Td>
      <Td>{column.type}</Td>
      <Td>
        <Select
          value={column.fakeMainType}
          onChange={(e) => changeFakeType(e, column.name)}
        >
          {mainOptions}
        </Select>
      </Td>
      <Td>
        <Select
          value={column.fakeSubType}
          onChange={(e) => changeFakeSubType(e, column.name)}
        >
          {subOptions(column.fakeMainType)}
        </Select>
      </Td>
      <Td>{column.sample}</Td>
    </Tr>
  ));

  return (
    <Box>
      <Select onChange={(e) => setTable(e.target.value)}>{tablesList}</Select>
      <Button onClick={() => setColumns(setDefaultMappings(columns))}>
        Set Defaults
      </Button>

      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Generator Type</Th>
              <Th>Subtype</Th>
              <Th>Example</Th>
            </Tr>
          </Thead>
          <Tbody>{columnRows}</Tbody>
        </Table>
      </TableContainer>

      <Button onClick={(e) => saveScript(e, { [table]: columns })}>
        Generate Script
      </Button>
      <Button
        onClick={() =>
          saveToFile(
            JSON.stringify({ [table]: columns }),
            "columnMapping",
            "application/json",
          )
        }
      >
        Save
      </Button>
      <input type="file" onChange={fileSelected}></input>
    </Box>
  );
}
