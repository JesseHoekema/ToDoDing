import { Database } from "@db/sqlite";
import { addSigListener } from "./sigHandler.ts";

export const db = new Database("todo.db");

const closeListener = () => {
  console.log("Closing DB");
  db.close();
};

addSigListener(closeListener);

db.sql`
  CREATE TABLE IF NOT EXISTS todo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT KEY,
    description TEXT KEY,
    status TEXT KEY,
    postDate TEXT KEY,
    dueDate TEXT KEY,
    url TEXT KEY
  );
`;
