// =========================================================================
// MEMORY STORE (IMPLEMENTASI IN-MEMORY UNTUK PENGUJIAN & CONTRACT TESTS)
// =========================================================================
const {
  BaseStore,
  DuplicateSubmissionError,
  StationRestError,
  CorridorCapacityError
} = require("./store-interface");

class MemoryStore extends BaseStore {
  constructor() {
    super();
    this.students = new Map(); // nim -> student
    this.submissions = new Map(); // submissionId -> submission
    this.submissionKeyIndex = new Map(); // `${examGroupId}:${nim}:${stationNo}` -> submissionId
    this.groupCorridorNims = new Map(); // `${examGroupId}:${corridorCode}` -> Set<nim>
    this.assessorAssignments = [];
  }

  async findStudentByNim(nim) {
    if (!nim) return null;
    return this.students.get(String(nim).trim()) || null;
  }

  async saveStudent(student) {
    if (!student || !student.nim) throw new Error("Student NIM wajib ada.");
    this.students.set(String(student.nim).trim(), { ...student });
    return this.students.get(String(student.nim).trim());
  }

  async saveStudents(students) {
    if (!Array.isArray(students)) throw new Error("Argument students harus berupa array.");
    for (const s of students) {
      await this.saveStudent(s);
    }
    return students.length;
  }

  async listStudents(filter = {}) {
    const list = Array.from(this.students.values());
    return list.filter((s) => {
      if (filter.corridor && s.corridor !== filter.corridor) return false;
      if (filter.group && s.group !== filter.group) return false;
      if (filter.gender && s.gender !== filter.gender) return false;
      return true;
    });
  }

  async saveSubmission(submission) {
    if (!submission) throw new Error("Data submission wajib ada.");
    const stationNo = Number(submission.stationNo);

    // 1. Station 10 adalah istirahat dan tidak dinilai
    if (stationNo === 10) {
      throw new StationRestError("Stasiun 10 adalah stasiun istirahat: submit ditolak server.");
    }

    const examGroupId = String(submission.examGroupId || "default").trim();
    const nim = String(submission.nim).trim();
    const corridorCode = String(submission.corridorCode).trim();
    const uniqueKey = `${examGroupId}:${nim}:${stationNo}`;

    // 2. Cek duplicate constraint (examGroupId, nim, stationNo)
    if (this.submissionKeyIndex.has(uniqueKey)) {
      throw new DuplicateSubmissionError(`Submission untuk ${nim} di stasiun ${stationNo} grup ${examGroupId} sudah ada.`);
    }

    // 3. Cek batas kapasitas 10 mahasiswa per koridor per examGroup
    const groupKey = `${examGroupId}:${corridorCode}`;
    let nimsInCorridor = this.groupCorridorNims.get(groupKey);
    if (!nimsInCorridor) {
      nimsInCorridor = new Set();
      this.groupCorridorNims.set(groupKey, nimsInCorridor);
    }
    if (!nimsInCorridor.has(nim) && nimsInCorridor.size >= 10) {
      throw new CorridorCapacityError(`Kapasitas maksimum 10 mahasiswa di ${corridorCode} grup ${examGroupId} telah tercapai.`);
    }
    nimsInCorridor.add(nim);

    const submissionId = submission.submissionId || `sub_${examGroupId}_${nim}_${stationNo}_${Date.now()}`;
    const record = {
      ...submission,
      submissionId,
      stationNo,
      status: submission.status || "SUBMITTED",
      submittedAt: submission.submittedAt || new Date().toISOString()
    };

    this.submissions.set(submissionId, record);
    this.submissionKeyIndex.set(uniqueKey, submissionId);
    return record;
  }

  async findSubmission(examGroupId, nim, stationNo) {
    const key = `${String(examGroupId).trim()}:${String(nim).trim()}:${Number(stationNo)}`;
    const id = this.submissionKeyIndex.get(key);
    if (!id) return null;
    return this.submissions.get(id) || null;
  }

  async listSubmissions(filter = {}) {
    let list = Array.from(this.submissions.values());
    if (filter.examGroupId) list = list.filter((s) => s.examGroupId === filter.examGroupId);
    if (filter.nim) list = list.filter((s) => s.nim === filter.nim);
    if (filter.corridorCode) list = list.filter((s) => s.corridorCode === filter.corridorCode);
    if (filter.stationNo !== undefined && filter.stationNo !== null) {
      list = list.filter((s) => Number(s.stationNo) === Number(filter.stationNo));
    }
    if (filter.status) list = list.filter((s) => s.status === filter.status);
    return list;
  }

  async updateSubmission(submissionId, updateData) {
    const existing = this.submissions.get(submissionId);
    if (!existing) throw new Error(`Submission ${submissionId} tidak ditemukan.`);
    const updated = {
      ...existing,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this.submissions.set(submissionId, updated);
    return updated;
  }

  async saveAssessorAssignment(assignment) {
    if (!assignment || !assignment.assessorId || !assignment.examGroupId) {
      throw new Error("Assessor assignment wajib memiliki assessorId dan examGroupId.");
    }
    this.assessorAssignments.push({ ...assignment });
    return assignment;
  }

  async listAssessorAssignments(filter = {}) {
    return this.assessorAssignments.filter((a) => {
      if (filter.assessorId && a.assessorId !== filter.assessorId) return false;
      if (filter.examGroupId && a.examGroupId !== filter.examGroupId) return false;
      if (filter.corridorCode && a.corridorCode !== filter.corridorCode) return false;
      if (filter.stationNo !== undefined && a.stationNo !== filter.stationNo) return false;
      return true;
    });
  }

  async clear() {
    this.students.clear();
    this.submissions.clear();
    this.submissionKeyIndex.clear();
    this.groupCorridorNims.clear();
    this.assessorAssignments = [];
  }
}

module.exports = { MemoryStore };
