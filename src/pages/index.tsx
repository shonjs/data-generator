
import { GetServerSideProps } from 'next';
import Playground from '../app/playground'
import { Client } from 'pg';
import RootLayout from '../app/layout'
import { Providers } from '../app/providers';

export async function getServerSideProps() {
const schemaName = process.env.DB_SCHEMA_NAME;
  const client = new Client({
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });
  await client.connect();

  const query = `
  SELECT DISTINCT information_schema.columns.table_name, information_schema.columns.column_name AS name,
  data_type AS type
  FROM information_schema.columns
  WHERE information_schema.columns.table_schema = '${schemaName}'`
  const res = await client.query(query);

  const dbInfo = res.rows.reduce((accumulator, row) => {
    accumulator[row.table_name] = accumulator[row.table_name] || [];
    row.fakerType = "";
    row.fakerSubType = "";
    accumulator[row.table_name].push(row);
    return accumulator;
  }, {});

  return {
    props: { dbInfo }
  };
}
export default function Home({dbInfo}) {
  return (
    <Providers>
      <Playground dbInfo={dbInfo}></Playground>
      </Providers>
  )
}
