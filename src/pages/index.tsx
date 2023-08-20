import { GetServerSideProps } from "next";
import Playground from "../app/playground";
import { Client, ClientConfig, QueryResult } from "pg";
import RootLayout from "../app/layout";
import { Providers } from "../app/providers";
import ErrorBoundary from "../app/error-boundary";
import Error from "next/error";
import { ColumnInfo } from "@/types";

export async function getServerSideProps() {
  const schemaName = process.env.DB_SCHEMA_NAME;
  const config: ClientConfig = {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
  const client = await openDBConnection(config);

  const query = `
  SELECT DISTINCT information_schema.columns.table_name, information_schema.columns.column_name AS name,
  data_type AS type
  FROM information_schema.columns
  WHERE information_schema.columns.table_schema = '${schemaName}'`;
  const res: QueryResult = await client.query(query);

  const dbInfo: Record<string, Array<ColumnInfo>> = res.rows.reduce(
    (accumulator, row) => {
      accumulator[row.table_name] = accumulator[row.table_name] || [];
      accumulator[row.table_name].push(row);
      return accumulator;
    },
    {},
  );

  return {
    props: { dbInfo },
  };
}

const openDBConnection = async (config: ClientConfig) => {
  const client = new Client(config);
  try {
    await client.connect();
  } catch (error) {
    throw new Error("Unable to fetch schema");
  }
  return client;
};
export function App({ dbInfo }) {
  return (
    <Providers>
      <Playground dbInfo={dbInfo}></Playground>
    </Providers>
  );
}

export default function Home({ dbInfo }) {
  return (
    <ErrorBoundary>
      <App dbInfo={dbInfo}></App>
    </ErrorBoundary>
  );
}
