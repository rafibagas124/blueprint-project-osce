// =========================================================================
// ZOD SCHEMAS & MESSAGE CONTRACTS (STRICT VALIDATION, TOLAK UNKNOWN FIELDS)
// =========================================================================
const { z } = require("zod");

// ------------------------------------------------------------- Entitas ---
const GenderSchema = z.enum(["L", "P", "male", "female"]);
const CorridorCodeSchema = z.enum(["KOR-A", "KOR-B"]);

const StudentRosterSchema = z.object({
  nim: z.string().min(3).max(30).trim(),
  nama: z.string().min(2).max(100).trim(),
  gender: z.enum(["L", "P"]),
  corridor: CorridorCodeSchema,
  group: z.string().min(1).max(30).trim(),
  seat: z.number().int().min(1).max(10)
}).strict();

const SubmissionSchema = z.object({
  submissionId: z.string().min(1),
  examGroupId: z.string().min(1),
  nim: z.string().min(1),
  nama: z.string().min(1),
  gender: z.enum(["L", "P"]),
  corridorCode: CorridorCodeSchema,
  stationNo: z.number().int().min(1).max(9), // S10 ditolak server
  selectedOption: z.number().int().min(0).max(10),
  isCorrect: z.boolean(),
  score: z.number().min(0).max(100),
  assessorScore: z.number().min(0).max(100).optional().nullable(),
  finalScore: z.number().min(0).max(100),
  status: z.enum(["SUBMITTED", "NEEDS_REVIEW", "FINAL"]).default("SUBMITTED"),
  submittedAt: z.string().datetime().or(z.string().min(1)),
  updatedAt: z.string().datetime().or(z.string().min(1)).optional(),
  reviewedBy: z.string().optional().nullable(),
  reviewNotes: z.string().max(500).optional().nullable(),
  rubricVersion: z.number().int().default(1)
}).strict();

const AssessorAssignmentSchema = z.object({
  assessorId: z.string().min(1),
  examGroupId: z.string().min(1),
  corridorCode: CorridorCodeSchema.optional().nullable(),
  stationNo: z.number().int().min(1).max(10).optional().nullable()
}).strict();

// --------------------------------------------------- WebSocket Messages ---
const WsJoinMessageSchema = z.object({
  type: z.literal("join"),
  clientId: z.string().min(1).max(64),
  name: z.string().min(1).max(100),
  nim: z.string().min(1).max(30),
  gender: GenderSchema.default("L"),
  role: z.enum(["student", "assessor"]).default("student"),
  pin: z.string().max(64).optional(),
  token: z.string().max(512).optional(),
  corridorCode: z.string().max(24).optional(),
  wing: z.union([z.literal(0), z.literal(1)]).optional(),
  room: z.union([z.string(), z.number()]).optional()
}).strict();

const WsStateMessageSchema = z.object({
  type: z.literal("state"),
  x: z.number(),
  z: z.number(),
  yaw: z.number(),
  isSeated: z.boolean().default(false),
  isMoving: z.boolean().default(false),
  sceneView: z.string().max(32).default("corridor"),
  stationIdx: z.number().int().min(0).max(9)
}).strict();

const WsScoreMessageSchema = z.object({
  type: z.enum(["score", "submit_decision"]),
  stationIdx: z.number().int().min(0).max(9),
  selected: z.number().int().min(0).max(10),
  isCorrect: z.boolean(),
  score: z.number().min(0).max(100),
  globalRating: z.string().max(32).optional(),
  eventCount: z.number().int().min(0).optional(),
  name: z.string().max(100).optional(),
  nim: z.string().max(30).optional(),
  examGroupId: z.string().max(30).optional()
}).strict();

const WsAssessorScoreMessageSchema = z.object({
  type: z.literal("assessor_score"),
  nim: z.string().min(1).max(30),
  stationIdx: z.number().int().min(0).max(9),
  score: z.number().min(0).max(100),
  examGroupId: z.string().max(30).optional()
}).strict();

const WsDoorMessageSchema = z.object({
  type: z.literal("door"),
  phase: z.enum(["prep", "work"])
}).strict();

const WsUpdateQuizMessageSchema = z.object({
  type: z.literal("update_station_quiz"),
  stationIdx: z.number().int().min(0).max(9),
  wing: z.union([z.literal(0), z.literal(1)]).optional().default(0),
  updatedData: z.record(z.any())
}).strict();

const WsGetScoresMessageSchema = z.object({
  type: z.literal("get_scores")
}).strict();

// Router validator untuk WS raw payload
function parseWsMessage(rawString) {
  let json;
  try {
    json = JSON.parse(rawString);
  } catch (err) {
    throw new Error("Invalid JSON string payload");
  }

  if (!json || typeof json !== "object" || typeof json.type !== "string") {
    throw new Error("Message must be an object with string 'type'");
  }

  switch (json.type) {
    case "join":
      return WsJoinMessageSchema.parse(json);
    case "state":
      return WsStateMessageSchema.parse(json);
    case "score":
    case "submit_decision":
      return WsScoreMessageSchema.parse(json);
    case "assessor_score":
      return WsAssessorScoreMessageSchema.parse(json);
    case "door":
      return WsDoorMessageSchema.parse(json);
    case "update_station_quiz":
      return WsUpdateQuizMessageSchema.parse(json);
    case "get_scores":
      return WsGetScoresMessageSchema.parse(json);
    default:
      throw new Error(`Unknown message type: ${json.type}`);
  }
}

module.exports = {
  GenderSchema,
  CorridorCodeSchema,
  StudentRosterSchema,
  SubmissionSchema,
  AssessorAssignmentSchema,
  WsJoinMessageSchema,
  WsStateMessageSchema,
  WsScoreMessageSchema,
  WsAssessorScoreMessageSchema,
  WsDoorMessageSchema,
  WsUpdateQuizMessageSchema,
  WsGetScoresMessageSchema,
  parseWsMessage
};
