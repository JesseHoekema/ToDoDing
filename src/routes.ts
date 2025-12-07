import { db } from "./db.ts";
import { partialToDoGuard, type Route, type ToDo, toDoGuard } from "./types.ts";
import { getRandomEmoji } from "./utils.ts";

export const returnStatus = (status: number) =>
  new Response(null, { status: status });

export const todoIdRoute: Route = {
  url: new URLPattern({ pathname: "/todo/:id" }),
  GET: (req) => {
    const match = todoIdRoute.url.exec(req.url);
    if (!match) return returnStatus(404);

    const id = match.pathname.groups.id;

    const todo = db.sql`SELECT * FROM todo WHERE id = ${id}`[0] as
      | ToDo
      | undefined;

    if (!todo) return returnStatus(404);

    const responseBody = JSON.stringify({
      ...todo,
      emoji: getRandomEmoji(),
    });

    return new Response(responseBody, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });
  },
  PUT: (req, putBody) => {
    if (!partialToDoGuard(putBody)) return returnStatus(405);
    const newData = putBody as Record<string, string | number>;

    const match = todoIdRoute.url.exec(req.url);
    if (!match) return returnStatus(404);

    const id = match.pathname.groups.id;
    if (!id) return returnStatus(405);

    const check = db.sql`
      SELECT COUNT(*) FROM todo WHERE id = ${id};
    `[0]["COUNT(*)"] as 0 | 1;
    if (!check) return returnStatus(405);

    for (const [key, value] of Object.entries(newData)) {
      const query = `UPDATE todo SET ${key} = ? WHERE id = ?`;
      db.prepare(query).get(value, id);
    }

    return returnStatus(200);
  },
  DELETE: (req) => {
    const match = todoIdRoute.url.exec(req.url);
    if (!match) return returnStatus(404);

    const id = match.pathname.groups.id;
    if (!id) return returnStatus(405);

    db.sql`DELETE FROM todo WHERE id = ${id}`;
    return returnStatus(200);
  },
};

export const todoDefaultRoute: Route = {
  url: new URLPattern({ pathname: "/todo" }),
  GET: (_req) => {
    const todo = db.sql`SELECT * FROM todo` as ToDo[] | undefined;

    const responseBody = JSON.stringify({
      ...todo,
      emoji: getRandomEmoji(),
    });

    return new Response(responseBody, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });
  },
  POST: (_req, postBody) => {
    if (!toDoGuard(postBody)) return returnStatus(405);
    const todo = postBody as ToDo;
    db.sql`
      INSERT INTO todo (title, description, status, postDate) VALUES (${todo.title}, ${todo.description}, ${todo.status}, ${todo.postDate})
    `;

    return returnStatus(200);
  },
};

export const homeRoute: Route = {
  url: new URLPattern({ pathname: "/" }),
  GET: (_req) => {
    const responseBody = JSON.stringify({
      todo_url: todoDefaultRoute.url.pathname,
      emoji: getRandomEmoji(),
    });

    return new Response(responseBody, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });
  },
};
