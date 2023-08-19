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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { faker } from "@faker-js/faker";
import Save from "./save";

type Column = {
  name: string;
  type: string;
  fakerMainType: string;
  fakerSubType: string;
  sample: any;
};

export default function Playground({ dbInfo }) {
  const [table, setTable] = useState(Object.keys(dbInfo)[0]);
  const [columns, setColumns] = useState<Array<Column>>([]);

  const tablesList = Object.keys(dbInfo).map((table, index) => (
    <option value={table} key={index}>
      {table}
    </option>
  ));

  const fakerOptions = Object.getOwnPropertyNames(faker)
    .filter((property) => typeof faker[property] === "object")
    .map((fakerKey, index) => (
      <option value={fakerKey.toString()} key={fakerKey}>
        {fakerKey.toString()}
      </option>
    ));

  const fakerSubOptions = (fakerKey) => {
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

  const changeFakerType = (e, columnName) => {
    const newColumns = columns.map((column) => {
      if (column.name === columnName) {
        return { ...column, fakerMainType: e.target.value };
      } else {
        return column;
      }
    });
    setColumns(newColumns);
  };

  const changeFakerSubType = (e, columnName) => {
    const newColumns = columns.map((column) => {
      if (column.name === columnName) {
        return {
          ...column,
          fakerSubType: e.target.value,
          sample: faker[column.fakerMainType][e.target.value](),
        };
      } else {
        return column;
      }
    });
    setColumns(newColumns);
  };

  const columnRows = columns.map((column, index) => (
    <Tr key={index}>
      <Td>{column.name}</Td>
      <Td>{column.type}</Td>
      <Td>
        <Select onChange={(e) => changeFakerType(e, column.name)}>
          {fakerOptions}
        </Select>
      </Td>
      <Td>
        <Select onChange={(e) => changeFakerSubType(e, column.name)}>
          {fakerSubOptions(column.fakerMainType)}
        </Select>
      </Td>
      <Td>{column.sample}</Td>
    </Tr>
  ));

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

  return (
    <Box>
      <Select onChange={(e) => setTable(e.target.value)}>{tablesList}</Select>

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

      <Save
        data={JSON.stringify({ [table]: columns })}
        name="Save"
        fileName="columnMapping"
      ></Save>
      <input type="file" onChange={fileSelected}></input>
    </Box>
  );
}
