import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("./dist", import.meta.url));
const port = Number(process.env.PORT || 8080);
// No shared secret: per-decision, this dashboard has no auth yet and is only
// reachable inside the deployment's own docker network (see
// src/api/endpoints/daily_status/service.py's module docstring on bride-rest-api-orm).
const brideApiUrl = (process.env.BRIDE_API_INTERNAL_URL || "http://localhost:8000").replace(/\/$/, "");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/health") {
    return sendJson(res, 200, { ok: true });
  }

  if (url.pathname === "/api/daily-status/offices") {
    return proxy(`${brideApiUrl}/daily-status/offices`, res);
  }

  if (url.pathname === "/api/daily-status/user") {
    return proxy(`${brideApiUrl}/daily-status/user?${url.searchParams.toString()}`, res);
  }

  if (url.pathname === "/api/daily-status") {
    return proxy(`${brideApiUrl}/daily-status?${url.searchParams.toString()}`, res);
  }

  return serveStatic(url.pathname, res);
});

async function proxy(target, res) {
  try {
    const upstream = await fetch(target, { headers: { accept: "application/json" } });
    const text = await upstream.text();
    res.writeHead(upstream.status, {
      "content-type": upstream.headers.get("content-type") || "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    res.end(text);
  } catch (error) {
    sendJson(res, 502, { error: "bride_api_upstream_unavailable", message: String(error?.message || error) });
  }
}

async function serveStatic(pathname, res) {
  const safePath = normalize(pathname).replace(/^(\.\.(?:\/|\\))+/, "");
  let filePath = join(root, safePath === "/" ? "index.html" : safePath);
  if (!existsSync(filePath)) filePath = join(root, "index.html");
  try {
    const stat = await readFile(filePath);
    res.writeHead(200, {
      "content-type": contentTypes[extname(filePath)] || "application/octet-stream",
      "cache-control": filePath.endsWith("index.html") ? "no-store" : "public, max-age=31536000, immutable",
    });
    res.end(stat);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("not found");
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(payload));
}

server.listen(port, "0.0.0.0", () => {
  console.log(`[attendance-dashboard] listening on :${port}, proxying ${brideApiUrl}`);
});
