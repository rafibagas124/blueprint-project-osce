"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { describe, it } = require("node:test");

process.env.VERCEL = "1";
process.env.NODE_ENV = "production";
process.env.JWT_SECRET = "";

const apiHandler = require("../../api/[...path]");
const { server: backendServer, store, wss } = require("../../server");

const projectRoot = path.resolve(__dirname, "../..");

describe("Vercel deployment", () => {
  it("starts without a JWT secret, listener, WebSocket server, or disk store", () => {
    const result = spawnSync(process.execPath, [path.join(projectRoot, "server.js")], {
      cwd: projectRoot,
      encoding: "utf8",
      timeout: 5000,
      env: {
        ...process.env,
        VERCEL: "1",
        NODE_ENV: "production",
        JWT_SECRET: ""
      }
    });

    assert.equal(result.status, 0, result.stderr);
    assert.equal(backendServer.listening, false);
    assert.equal(wss, null);
    assert.equal(store.constructor.name, "MemoryStore");
  });

  it("serves API routes through the serverless handler", async (t) => {
    const functionServer = http.createServer(apiHandler);
    await new Promise((resolve) => functionServer.listen(0, "127.0.0.1", resolve));
    t.after(() => new Promise((resolve) => functionServer.close(resolve)));

    const response = await fetch(`http://127.0.0.1:${functionServer.address().port}/health`);
    assert.equal(response.status, 200);
    const health = await response.json();
    assert.equal(health.ok, true);
    assert.equal(health.storeDriver, "memory");
  });

  it("routes the root to the blueprint and keeps server-only src files private", () => {
    const config = JSON.parse(fs.readFileSync(path.join(projectRoot, "vercel.json"), "utf8"));
    const apiRoute = config.routes.find((route) => route.dest === "/api/[...path].js");
    const privateSourceRoute = config.routes.find((route) => route.status === 404);
    const rootRoute = config.routes.find((route) => route.src === "^/$");
    const staticBuilds = config.builds.filter((build) => build.use === "@vercel/static");
    const staticPaths = new Set(staticBuilds.map((build) => build.src));

    assert.ok(new RegExp(apiRoute.src).test("/api/health"));
    assert.ok(new RegExp(privateSourceRoute.src).test("/src/data/osce-clinical-seed.js"));
    assert.equal(rootRoute.dest, "/blueprint.html");
    assert.ok(config.routes.some((route) => route.handle === "filesystem"));
    for (const staticPath of [
      "blueprint.html",
      "osce-preview.html",
      "css/**",
      "js/**",
      "assets/**"
    ]) {
      assert.ok(staticPaths.has(staticPath), `Vercel harus membangun aset statis ${staticPath}`);
    }
    assert.ok(staticBuilds.every((build) => !build.src.startsWith("src/")));
  });
});
