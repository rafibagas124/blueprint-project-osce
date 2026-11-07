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
  CorridorCapacityError,
  SeatConflictError,
  RosterValidationError
} = require("./store-interface");

class FileStore extends BaseStore {
  constructor(options = {}) {
    super();
    this.baseDir = options.baseDir || path.join(process.cwd(), "data", "file_store");
    this.studentsDir = path.join(this.baseDir, "students");
    this.assessorsDir = path.join(this.baseDir, "assessors");
    this.submissionsDir = path.join(this.baseDir, "submissions");
    this.assignmentsDir = path.join(this.baseDir, "assignments");

    // In-memory indexing untuk O(1) constraints dan pencarian instan
    this.students = new Map(); // nim -> student
    this.assessors = new Map(); // username -> assessor
    this.submissions = new Map(); // submissionId -> submission
    this.submissionKeyIndex = new Map(); // `${examGroupId}:${nim}:${stationNo}` -> submissionId
    this.groupCorridorNims = new Map(); // `${examGroupId}:${corridorCode}` -> Set<nim>
    this.assessorAssignments = [];

    this._ensureDirectories();
    this._loadExistingData();
  }

  _ensureDirectories() {
    [this.baseDir, this.studentsDir, this.assessorsDir, this.submissionsDir, this.assignmentsDir].forEach((dir) => {
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

    // 2. Muat assessors (jika ada)
    try {
      if (fs.existsSync(this.assessorsDir)) {
        const files = fs.readdirSync(this.assessorsDir);
        for (const f of files) {
          if (f.endsWith(".json")) {
            const raw = fs.readFileSync(path.join(this.assessorsDir, f), "utf8");
            const a = JSON.parse(raw);
            this.assessors.set(String(a.username).trim().toLowerCase(), a);
          }
        }
      }
    } catch (e) {
      console.warn("[FileStore] Gagal membaca assessors lama:", e.message);
    }

    // 3. Muat submissions (jika ada)
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

    // 4. Muat assignments
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

    // Validasi aturan roster jika field relasional lengkap
    if (student.gender && student.gender !== "L" && student.gender !== "P") {
      throw new RosterValidationError("Gender mahasiswa hanya boleh 'L' atau 'P'.");
    }
    if (student.corridor && student.corridor !== "KOR-A" && student.corridor !== "KOR-B") {
      throw new RosterValidationError("Koridor mahasiswa hanya boleh 'KOR-A' atau 'KOR-B'.");
    }
    if (student.seat !== undefined && student.seat !== null) {
      const seatNum = Number(student.seat);
      if (!Number.isInteger(seatNum) || seatNum < 1 || seatNum > 10) {
        throw new RosterValidationError("Nomor kursi (seat) mahasiswa wajib bilangan bulat 1-10.");
      }
    }

    // Constraint per (group, corridor) jika kedua atribut ada
    if (student.group && student.corridor) {
      const groupKey = `${student.group}:${student.corridor}`;
      const existingInGroupCorridor = Array.from(this.students.values()).filter(
        (s) => s.group === student.group && s.corridor === student.corridor
      );

      // 1. Batas maksimal 10 mahasiswa per koridor per group
      const alreadyExists = existingInGroupCorridor.some((s) => s.nim === cleanNim);
      if (!alreadyExists && existingInGroupCorridor.length >= 10) {
        throw new CorridorCapacityError(`Batas maksimal 10 mahasiswa di ${student.corridor} grup ${student.group} tercapai.`);
      }

      // 2. Unik seat 1-10 per (group, corridor)
      if (student.seat !== undefined && student.seat !== null) {
        const seatConflict = existingInGroupCorridor.find(
          (s) => s.nim !== cleanNim && Number(s.seat) === Number(student.seat)
        );
        if (seatConflict) {
          throw new SeatConflictError(`Seat ${student.seat} sudah ditempati oleh NIM ${seatConflict.nim} pada ${groupKey}.`);
        }
      }
    }

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

  // --- Assessors ---
  async saveAssessor(assessor) {
    if (!assessor || !assessor.username) throw new Error("Username asesor wajib ada.");
    const cleanUsername = String(assessor.username).trim().toLowerCase();
    const record = {
      username: cleanUsername,
      passwordHash: assessor.passwordHash,
      nama: assessor.nama || cleanUsername,
      role: assessor.role || "assessor"
    };
    this.assessors.set(cleanUsername, record);
    const filePath = path.join(this.assessorsDir, `${cleanUsername}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(record), "utf8");
    return { ...record };
  }

  async findAssessorByUsername(username) {
    if (!username) return null;
    return this.assessors.get(String(username).trim().toLowerCase()) || null;
  }

  async listAssessors(filter = {}) {
    const list = Array.from(this.assessors.values());
    return list.filter((a) => {
      if (filter.role && a.role !== filter.role) return false;
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
    this.assessors.clear();
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
    cleanDir(this.assessorsDir);
    cleanDir(this.submissionsDir);
    cleanDir(this.assignmentsDir);
  }
}

module.exports = { FileStore };

