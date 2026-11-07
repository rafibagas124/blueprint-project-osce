// =========================================================================
// FILE STORE (APPEND-ONLY LOG / PARTITIONED FILE STORAGE - KHUSUS DEV)
// PERINGATAN: Driver ini untuk lingkungan pengembangan.
// Dilarang menulis ulang seluruh data per submit agar tahan lonjakan 2.000 req/10s.
// =========================================================================
const fs = require("fs");
const path = require("path");
const {
  BaseStore,
  DuplicateSubmissionError,
  StationRestError,
  CorridorCapacityError
} = require("./store-interface");

class FileStore extends BaseStore {
  constructor(options = {}) {
    super();
    this.baseDir = options.baseDir || path.join(process.cwd(), "data", "file_store");
    this.studentsDir = path.join(this.baseDir, "students");
    this.submissionsDir = path.join(this.baseDir, "submissions");
    this.assignmentsDir = path.join(this.baseDir, "assignments");

    // In-memory indexing untuk O(1) constraints dan pencarian instan
    this.students = new Map(); // nim -> student
    this.submissions = new Map(); // submissionId -> submission
    this.submissionKeyIndex = new Map(); // `${examGroupId}:${nim}:${stationNo}` -> submissionId
    this.groupCorridorNims = new Map(); // `${examGroupId}:${corridorCode}` -> Set<nim>
    this.assessorAssignments = [];

    this._ensureDirectories();
    this._loadExistingData();
  }

  _ensureDirectories() {
    [this.baseDir, this.studentsDir, this.submissionsDir, this.assignmentsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  _loadExistingData() {
    // 1. Muat students (jika ada)
    try {
      if (fs.existsSync(this.studentsDir)) {
        const files = fs.readdirSync(this.studentsDir);
        for (const f of files) {
          if (f.endsWith(".json")) {
            const raw = fs.readFileSync(path.join(this.studentsDir, f), "utf8");
            const s = JSON.parse(raw);
            this.students.set(String(s.nim).trim(), s);
          }
        }
      }
    } catch (e) {
      console.warn("[FileStore] Gagal membaca students lama:", e.message);
    }

    // 2. Muat submissions (jika ada)
    try {
      if (fs.existsSync(this.submissionsDir)) {
        const files = fs.readdirSync(this.submissionsDir);
        for (const f of files) {
          if (f.endsWith(".json")) {
            const raw = fs.readFileSync(path.join(this.submissionsDir, f), "utf8");
            const s = JSON.parse(raw);
            this.submissions.set(s.submissionId, s);
            const key = `${s.examGroupId}:${s.nim}:${s.stationNo}`;
            this.submissionKeyIndex.set(key, s.submissionId);

            const groupKey = `${s.examGroupId}:${s.corridorCode}`;
            if (!this.groupCorridorNims.has(groupKey)) {
              this.groupCorridorNims.set(groupKey, new Set());
            }
            this.groupCorridorNims.get(groupKey).add(s.nim);
          }
        }
      }
    } catch (e) {
      console.warn("[FileStore] Gagal membaca submissions lama:", e.message);
    }

    // 3. Muat assignments
    try {
      const assignFile = path.join(this.assignmentsDir, "assignments.json");
      if (fs.existsSync(assignFile)) {
        this.assessorAssignments = JSON.parse(fs.readFileSync(assignFile, "utf8"));
      }
    } catch (e) {}
  }

  async findStudentByNim(nim) {
    if (!nim) return null;
    return this.students.get(String(nim).trim()) || null;
  }

  async saveStudent(student) {
    if (!student || !student.nim) throw new Error("Student NIM wajib ada.");
    const cleanNim = String(student.nim).trim();
    const data = { ...student, nim: cleanNim };
    this.students.set(cleanNim, data);

    // Tulis file per student (atomik, tidak menulis ulang seluruh roster)
    const filePath = path.join(this.studentsDir, `${cleanNim}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(data), "utf8");
    return data;
  }

  async saveStudents(students) {
    if (!Array.isArray(students)) throw new Error("Argument students harus array.");
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

    // 1. Station 10 adalah istirahat dan tidak dinilai (server menolak)
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

    // Update in-memory index
    this.submissions.set(submissionId, record);
    this.submissionKeyIndex.set(uniqueKey, submissionId);

    // Tulis berkas mandiri per submission: O(1) IO, tahan lonjakan 2.000 submit
    const filePath = path.join(this.submissionsDir, `${submissionId}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(record), "utf8");

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
    const filePath = path.join(this.submissionsDir, `${submissionId}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(updated), "utf8");
    return updated;
  }

  async saveAssessorAssignment(assignment) {
    if (!assignment || !assignment.assessorId || !assignment.examGroupId) {
      throw new Error("Assessor assignment wajib memiliki assessorId dan examGroupId.");
    }
    this.assessorAssignments.push({ ...assignment });
    const assignFile = path.join(this.assignmentsDir, "assignments.json");
    await fs.promises.writeFile(assignFile, JSON.stringify(this.assessorAssignments, null, 2), "utf8");
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

    // Bersihkan file pada direktori
    const cleanDir = (d) => {
      if (fs.existsSync(d)) {
        for (const file of fs.readdirSync(d)) {
          fs.unlinkSync(path.join(d, file));
        }
      }
    };
    cleanDir(this.studentsDir);
    cleanDir(this.submissionsDir);
    cleanDir(this.assignmentsDir);
  }
}

module.exports = { FileStore };
