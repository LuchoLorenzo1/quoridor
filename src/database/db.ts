import postgres from "postgres";

const sql = postgres(`postgres://${process.env.POSTGRES_HOST}`, {
  port: 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

export default sql;
