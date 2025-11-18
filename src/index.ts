import { Route, routeGuard } from "./types.ts";

const routes: Route[] = [];
const modules = await import("./routes.ts") as object;

for (const [name, module] of Object.entries(modules)) {
  if (!routeGuard(module)) {
    console.warn(`${name} is not a route`);
    continue;
  }

  routes.push(module as Route);
}

export const route404: Route = {
  url: new URLPattern({ pathname: "/" }),
  execute: () => {
    const responseBody = JSON.stringify({
      "message": "Not found",
      "status": 404,
    });

    return new Response(responseBody, {
      status: 404,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });
  },
};

async function handler(req: Request): Promise<Response> {
  for (const route of routes) {
    const match = route.url.exec(req.url);
    if (match) {
      console.log(
        "Method:",
        req.method,
        "Headers:",
        req.headers,
      );

      const url = new URL(req.url);
      console.log(
        "Path:",
        url.pathname,
        "Query parameters:",
        url.searchParams,
      );

      if (req.body) {
        const body = await req.text();
        console.log("Body:", body);
      }

      return await route.execute(req, match);
    }
  }

  return await route404.execute(req);
}

Deno.serve({ port: 7776 }, handler);
