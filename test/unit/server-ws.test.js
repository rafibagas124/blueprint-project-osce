const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { WebSocket } = require("ws");
const { server, wss, store } = require("../../server");

describe("Integration Test: Express & ws Server", () => {
  let testPort;
  let baseUrl;
  let wsUrl;

  before(async () => {
    await store.clear();
    await new Promise((resolve) => {
      // Dengarkan pada port acak bebas (port 0)
      server.listen(0, "127.0.0.1", () => {
        testPort = server.address().port;
        baseUrl = `http://127.0.0.1:${testPort}`;
        wsUrl = `ws://127.0.0.1:${testPort}/ws`;
        resolve();
      });
    });
  });

  after(async () => {
    wss.close();
    await new Promise((resolve) => server.close(resolve));
    await store.clear();
  });

  it("1. GET /api/health mengembalikan status 200 dan JSON informasi sistem", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.ok(body.capacityPerRoom);
  });

  it("2. WebSocket menghubungkan client via library ws dan menerima respon joined", async () => {
    const ws = new WebSocket(wsUrl);

    const received = await new Promise((resolve, reject) => {
      ws.on("open", () => {
        ws.send(
          JSON.stringify({
            type: "join",
            clientId: "test_ws_client_1",
            name: "apt. Dewi Sartika",
            nim: "2024-08099",
            gender: "P",
            role: "student",
            corridorCode: "KOR-A",
            wing: 0
          })
        );
      });

      ws.on("message", (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "joined") {
          resolve(msg);
        }
      });

      ws.on("error", reject);
    });

    assert.equal(received.type, "joined");
    assert.equal(received.wing, 0);
    assert.ok(received.jwtToken);
    ws.close();
  });

  it("3. WebSocket menolak pesan dengan field tak dikenal atau format rusak via Zod", async () => {
    const ws = new WebSocket(wsUrl);

    const errorMsg = await new Promise((resolve, reject) => {
      ws.on("open", () => {
        // Kirim payload tidak valid (unrecognized_keys)
        ws.send(
          JSON.stringify({
            type: "join",
            clientId: "test_hacker",
            name: "Hacker",
            nim: "123",
            role: "student",
            illegalFieldInjected: "malicious"
          })
        );
      });

      ws.on("message", (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "error") {
          resolve(msg);
        }
      });

      ws.on("error", reject);
    });

    assert.equal(errorMsg.type, "error");
    assert.equal(errorMsg.code, "validation_error");
    ws.close();
  });
});
