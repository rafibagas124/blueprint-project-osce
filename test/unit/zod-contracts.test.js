const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  StudentRosterSchema,
  SubmissionSchema,
  WsJoinMessageSchema,
  WsScoreMessageSchema,
  WsDoorMessageSchema,
  parseWsMessage
} = require("../../src/schemas/messages");

describe("Unit Test: Zod Message Contracts", () => {
  it("1. StudentRosterSchema memvalidasi data siswa valid dan menolak field tak dikenal", () => {
    const valid = {
      nim: "2024-08001",
      nama: "apt. Budi Santoso",
      gender: "L",
      corridor: "KOR-A",
      group: "GRP-01",
      seat: 1
    };
    const parsed = StudentRosterSchema.parse(valid);
    assert.equal(parsed.nim, "2024-08001");

    // Tolak field tak dikenal
    assert.throws(
      () => {
        StudentRosterSchema.parse({ ...valid, hackedField: true });
      },
      /unrecognized_keys/
    );

    // Tolak gender di luar L/P
    assert.throws(
      () => {
        StudentRosterSchema.parse({ ...valid, gender: "X" });
      }
    );

    // Tolak seat di luar 1-10
    assert.throws(
      () => {
        StudentRosterSchema.parse({ ...valid, seat: 11 });
      }
    );
  });

  it("2. SubmissionSchema menolak stationNo 10 dan field asing", () => {
    const valid = {
      submissionId: "sub_1",
      examGroupId: "GRP-01",
      nim: "2024-08001",
      nama: "apt. Budi Santoso",
      gender: "L",
      corridorCode: "KOR-A",
      stationNo: 1,
      selectedOption: 0,
      isCorrect: true,
      score: 100,
      finalScore: 100,
      status: "SUBMITTED",
      submittedAt: new Date().toISOString()
    };
    const parsed = SubmissionSchema.parse(valid);
    assert.equal(parsed.stationNo, 1);

    // Stasiun 10 ditolak Zod
    assert.throws(() => {
      SubmissionSchema.parse({ ...valid, stationNo: 10 });
    });

    // Field asing ditolak
    assert.throws(() => {
      SubmissionSchema.parse({ ...valid, extraHacks: 123 });
    });
  });

  it("3. parseWsMessage mem-parsing pesan WS join, state, score dengan validasi tipe ketat", () => {
    const joinMsg = JSON.stringify({
      type: "join",
      clientId: "client_123",
      token: "mock-jwt-token",
      name: "Budi",
      nim: "2024-08001",
      gender: "L",
      role: "student"
    });
    const parsedJoin = parseWsMessage(joinMsg);
    assert.equal(parsedJoin.type, "join");
    assert.equal(parsedJoin.nim, "2024-08001");

    // Pesan dengan tipe tidak dikenal ditolak
    assert.throws(
      () => parseWsMessage(JSON.stringify({ type: "inject_sql_or_bad_type" })),
      /Unknown message type/
    );

    // Pesan score valid
    const scoreMsg = JSON.stringify({
      type: "score",
      stationIdx: 1,
      selected: 2,
      isCorrect: true,
      score: 95
    });
    const parsedScore = parseWsMessage(scoreMsg);
    assert.equal(parsedScore.score, 95);

    // Pesan door valid
    const doorMsg = JSON.stringify({ type: "door", phase: "work" });
    const parsedDoor = parseWsMessage(doorMsg);
    assert.equal(parsedDoor.phase, "work");

    // Pesan door dengan fase tidak valid ditolak
    assert.throws(() => {
      parseWsMessage(JSON.stringify({ type: "door", phase: "open_sesame" }));
    });
  });
});

