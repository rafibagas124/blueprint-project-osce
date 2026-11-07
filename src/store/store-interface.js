// =========================================================================
// STORE INTERFACE (ANTARMUKA DASAR PENYIMPANAN SISTEM OSCE)
// Memastikan semua driver (FileStore, MemoryStore, MongoStore) memiliki
// kontrak metode dan penegakan constraint yang identik.
// =========================================================================

class DuplicateSubmissionError extends Error {
  constructor(message = "Submission sudah ada untuk examGroup, NIM, dan stasiun ini.") {
    super(message);
    this.name = "DuplicateSubmissionError";
    this.code = "DUPLICATE_SUBMISSION";
  }
}

class StationRestError extends Error {
  constructor(message = "Stasiun 10 adalah stasiun istirahat dan tidak dinilai.") {
    super(message);
    this.name = "StationRestError";
    this.code = "STATION_REST_NO_SUBMISSION";
  }
}

class CorridorCapacityError extends Error {
  constructor(message = "Batas maksimal 10 mahasiswa per koridor per examGroup tercapai.") {
    super(message);
    this.name = "CorridorCapacityError";
    this.code = "CORRIDOR_CAPACITY_EXCEEDED";
  }
}

class SeatConflictError extends Error {
  constructor(message = "Nomor kursi (seat) sudah ditempati mahasiswa lain di koridor dan grup ini.") {
    super(message);
    this.name = "SeatConflictError";
    this.code = "SEAT_CONFLICT";
  }
}

class RosterValidationError extends Error {
  constructor(message = "Validasi data roster gagal.") {
    super(message);
    this.name = "RosterValidationError";
    this.code = "ROSTER_VALIDATION_ERROR";
  }
}

class BaseStore {
  // --- Students / Roster ---
  async findStudentByNim(nim) {
    throw new Error("Method findStudentByNim() must be implemented");
  }

  async saveStudent(student) {
    throw new Error("Method saveStudent() must be implemented");
  }

  async saveStudents(students) {
    throw new Error("Method saveStudents() must be implemented");
  }

  async listStudents(filter = {}) {
    throw new Error("Method listStudents() must be implemented");
  }

  // --- Assessors / Users ---
  async saveAssessor(assessor) {
    throw new Error("Method saveAssessor() must be implemented");
  }

  async findAssessorByUsername(username) {
    throw new Error("Method findAssessorByUsername() must be implemented");
  }

  async listAssessors(filter = {}) {
    throw new Error("Method listAssessors() must be implemented");
  }

  // --- Submissions ---
  async saveSubmission(submission) {
    throw new Error("Method saveSubmission() must be implemented");
  }

  async findSubmission(examGroupId, nim, stationNo) {
    throw new Error("Method findSubmission() must be implemented");
  }

  async listSubmissions(filter = {}) {
    throw new Error("Method listSubmissions() must be implemented");
  }

  async updateSubmission(submissionId, updateData) {
    throw new Error("Method updateSubmission() must be implemented");
  }

  // --- Assessor Assignments ---
  async saveAssessorAssignment(assignment) {
    throw new Error("Method saveAssessorAssignment() must be implemented");
  }

  async listAssessorAssignments(filter = {}) {
    throw new Error("Method listAssessorAssignments() must be implemented");
  }

  // --- Utility ---
  async clear() {
    throw new Error("Method clear() must be implemented");
  }
}

module.exports = {
  BaseStore,
  DuplicateSubmissionError,
  StationRestError,
  CorridorCapacityError,
  SeatConflictError,
  RosterValidationError
};

