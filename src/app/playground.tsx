'use client'

import {
    Select, Table, TableContainer, Tbody, Td, Th, Thead, Tr, Box
} from "@chakra-ui/react";
import {
    useEffect,
    useState
} from "react";

type Column = {
    name: string
    type: string
};

export default function Playground({
    dbInfo
}) {
    const [table, setTable] = useState(Object.keys(dbInfo)[0]);
    const [columns, setColumns] = useState<Array<Column>>([]);

    const tablesList = Object.keys(dbInfo).map((table, index) => (
        <option value={table} key={index}>
            {table}
        </option>
    ));

    const columnRows = columns.map((column, index) => (
            <Tr key={index}>
                <Td>{column.name}</Td>
                <Td>{column.type}</Td>
            </Tr>
    ));

    
    useEffect(() => {
        console.log("table", table);
        setColumns(dbInfo[table]);
    }, [table, dbInfo]);

    return (
        <>
        <Box>
            <Select onChange={e => setTable(e.target.value)}>
                {tablesList}
            </Select>

            <TableContainer>
                    <Table variant='simple'>
                        <Thead>
                            <Tr>
                                <Th>
                                    Name
                                </Th>
                                <Th>
                                    Type
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {columnRows}
                        </Tbody>
                    </Table>
                </TableContainer>
            </Box>
            </>
    );
}