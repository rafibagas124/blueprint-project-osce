// =========================================================================
// REUSABLE STORE CONTRACT TEST SUITE
// Wajib dijalankan terhadap MemoryStore, FileStore, dan kelak MongoStore
// tanpa mengubah satu baris pun kode uji ini.
// =========================================================================
const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const {
  DuplicateSubmissionError,
  StationRestError,
  CorridorCapacityError,
  SeatConflictError
} = require("../../src/store/store-interface");

function runStoreContractTests(storeName, createStoreFn) {
  describe(`Contract Test: ${storeName}`, () => {
    let store;

    beforeEach(async () => {
      store = await createStoreFn();
      await store.clear();
    });

    it("1. Menyimpan dan menemukan data mahasiswa berdasarkan NIM", async () => {
      const student = {
        nim: "2024-08001",
        nama: "apt. Budi Santoso",
        gender: "L",
        corridor: "KOR-A",
        group: "GRP-01",
        seat: 1
      };

      await store.saveStudent(student);
      const found = await store.findStudentByNim("2024-08001");

      assert.ok(found);
      assert.equal(found.nim, "2024-08001");
      assert.equal(found.nama, "apt. Budi Santoso");
      assert.equal(found.corridor, "KOR-A");
    });

    it("2. Menyimpan daftar mahasiswa secara bulk", async () => {
      const students = [
        { nim: "DEV-01", nama: "Apoteker Satu", gender: "L", corridor: "KOR-A", group: "G1", seat: 1 },
        { nim: "DEV-02", nama: "Apoteker Dua", gender: "P", corridor: "KOR-A", group: "G1", seat: 2 }
      ];

      const count = await store.saveStudents(students);
      assert.equal(count, 2);

      const found1 = await store.findStudentByNim("DEV-01");
      const found2 = await store.findStudentByNim("DEV-02");
      assert.ok(found1);
      assert.ok(found2);
    });

    it("3. Menyimpan submission tugas stasiun valid (Station 1-9)", async () => {
      const sub = {
        examGroupId: "GRP-01",
        nim: "2024-08001",
        nama: "apt. Budi Santoso",
        gender: "L",
        corridorCode: "KOR-A",
        stationNo: 1,
        selectedOption: 0,
        isCorrect: true,
        score: 100,
        finalScore: 100
      };

      const saved = await store.saveSubmission(sub);
      assert.ok(saved.submissionId);
      assert.equal(saved.status, "SUBMITTED");
      assert.equal(saved.score, 100);

      const found = await store.findSubmission("GRP-01", "2024-08001", 1);
      assert.ok(found);
      assert.equal(found.submissionId, saved.submissionId);
    });

    it("4. Menolak mutlak submission untuk Stasiun 10 (Stasiun Istirahat)", async () => {
      const subS10 = {
        examGroupId: "GRP-01",
        nim: "2024-08001",
        nama: "apt. Budi Santoso",
        gender: "L",
        corridorCode: "KOR-A",
        stationNo: 10,
        selectedOption: 0,
        isCorrect: true,
        score: 0,
        finalScore: 0
      };

      await assert.rejects(
        async () => {
          await store.saveSubmission(subS10);
        },
        (err) => {
          assert.ok(err instanceof StationRestError);
          assert.equal(err.code, "STATION_REST_NO_SUBMISSION");
          return true;
        }
      );
    });

    it("5. Menegakkan unique constraint (examGroupId, nim, stationNo) — tolak duplikat", async () => {
      const sub = {
        examGroupId: "GRP-01",
        nim: "2024-08001",
        nama: "apt. Budi Santoso",
        gender: "L",
        corridorCode: "KOR-A",
        stationNo: 2,
        selectedOption: 1,
        isCorrect: false,
        score: 0,
        finalScore: 0
      };

      await store.saveSubmission(sub);

      // Coba submit ulang untuk stasiun yang sama di grup yang sama
      await assert.rejects(
        async () => {
          await store.saveSubmission(sub);
        },
        (err) => {
          assert.ok(err instanceof DuplicateSubmissionError);
          assert.equal(err.code, "DUPLICATE_SUBMISSION");
          return true;
        }
      );
    });

    it("6. Menegakkan batas maksimal 10 mahasiswa per koridor per examGroup", async () => {
      const examGroupId = "GRP-TEST-LIMIT";
      const corridorCode = "KOR-A";

      // Daftarkan 10 mahasiswa berbeda pada stasiun 1
      for (let i = 1; i <= 10; i++) {
        await store.saveSubmission({
          examGroupId,
          nim: `NIM-LIMIT-${String(i).padStart(2, "0")}`,
          nama: `Mahasiswa ${i}`,
          gender: "L",
          corridorCode,
          stationNo: 1,
          selectedOption: 0,
          isCorrect: true,
          score: 100,
          finalScore: 100
        });
      }

      // Mahasiswa ke-11 pada koridor dan grup yang sama wajib ditolak
      await assert.rejects(
        async () => {
          await store.saveSubmission({
            examGroupId,
            nim: "NIM-LIMIT-11",
            nama: "Mahasiswa 11 Melebihi Batas",
            gender: "L",
            corridorCode,
            stationNo: 1,
            selectedOption: 0,
            isCorrect: true,
            score: 100,
            finalScore: 100
          });
        },
        (err) => {
          assert.ok(err instanceof CorridorCapacityError);
          assert.equal(err.code, "CORRIDOR_CAPACITY_EXCEEDED");
          return true;
        }
      );
    });

    it("7. Memfilter daftar submission dengan filter query", async () => {
      await store.saveSubmission({
        examGroupId: "G1",
        nim: "NIM-A1",
        nama: "A1",
        gender: "L",
        corridorCode: "KOR-A",
        stationNo: 1,
        selectedOption: 0,
        isCorrect: true,
        score: 100,
        finalScore: 100,
        status: "SUBMITTED"
      });

      await store.saveSubmission({
        examGroupId: "G1",
        nim: "NIM-B1",
        nama: "B1",
        gender: "P",
        corridorCode: "KOR-B",
        stationNo: 1,
        selectedOption: 0,
        isCorrect: false,
        score: 0,
        finalScore: 0,
        status: "NEEDS_REVIEW"
      });

      const listKorA = await store.listSubmissions({ corridorCode: "KOR-A" });
      assert.equal(listKorA.length, 1);
      assert.equal(listKorA[0].nim, "NIM-A1");

      const listReview = await store.listSubmissions({ status: "NEEDS_REVIEW" });
      assert.equal(listReview.length, 1);
      assert.equal(listReview[0].nim, "NIM-B1");
    });

    it("8. Mengupdate submission untuk override nilai asesor", async () => {
      const saved = await store.saveSubmission({
        examGroupId: "G1",
        nim: "NIM-OVERRIDE",
        nama: "Apoteker Uji",
        gender: "L",
        corridorCode: "KOR-A",
        stationNo: 3,
        selectedOption: 0,
        isCorrect: false,
        score: 0,
        finalScore: 0,
        status: "SUBMITTED"
      });

      const updated = await store.updateSubmission(saved.submissionId, {
        assessorScore: 85,
        finalScore: 85,
        status: "FINAL",
        reviewedBy: "Asesor-Dr-Farhan",
        reviewNotes: "Jawaban rasional klinis diterima sebagian."
      });

      assert.equal(updated.assessorScore, 85);
      assert.equal(updated.finalScore, 85);
      assert.equal(updated.status, "FINAL");
      assert.equal(updated.reviewedBy, "Asesor-Dr-Farhan");

      const reloaded = await store.findSubmission("G1", "NIM-OVERRIDE", 3);
      assert.equal(reloaded.finalScore, 85);
    });

    it("9. Menyimpan dan menampilkan penugasan asesor fleksibel (1-20 asesor)", async () => {
      await store.saveAssessorAssignment({
        assessorId: "ASR-01",
        examGroupId: "GRP-01",
        corridorCode: "KOR-A",
        stationNo: 1
      });

      await store.saveAssessorAssignment({
        assessorId: "ASR-01",
        examGroupId: "GRP-01",
        corridorCode: "KOR-A",
        stationNo: 2
      });

      const list = await store.listAssessorAssignments({ assessorId: "ASR-01" });
      assert.equal(list.length, 2);
      assert.equal(list[0].stationNo, 1);
      assert.equal(list[1].stationNo, 2);
    });

    it("10. Menguji ketahanan lonjakan konkurensi (batch writes tanpa race condition)", async () => {
      const tasks = [];
      for (let i = 1; i <= 9; i++) {
        tasks.push(
          store.saveSubmission({
            examGroupId: "GRP-SURGE",
            nim: "NIM-SURGE-1",
            nama: "Peserta Lonjakan",
            gender: "L",
            corridorCode: "KOR-A",
            stationNo: i,
            selectedOption: 0,
            isCorrect: true,
            score: 100,
            finalScore: 100
          })
        );
      }

      const results = await Promise.all(tasks);
      assert.equal(results.length, 9);

      const all = await store.listSubmissions({ examGroupId: "GRP-SURGE", nim: "NIM-SURGE-1" });
      assert.equal(all.length, 9);
    });

    it("11. Menyimpan dan menemukan akun asesor (username, passwordHash, nama, role)", async () => {
      await store.saveAssessor({
        username: "asesor_dr_budi",
        passwordHash: "$2a$10$hashedstringexample",
        nama: "dr. Budi, Sp.FRS",
        role: "assessor"
      });

      const found = await store.findAssessorByUsername("asesor_dr_budi");
      assert.ok(found);
      assert.equal(found.username, "asesor_dr_budi");
      assert.equal(found.nama, "dr. Budi, Sp.FRS");
      assert.equal(found.role, "assessor");

      // Case-insensitive lookup check
      const foundUpper = await store.findAssessorByUsername("ASESOR_DR_BUDI");
      assert.ok(foundUpper);
      assert.equal(foundUpper.username, "asesor_dr_budi");
    });

    it("12. Menolak mahasiswa ke-11 pada koridor yang sama dalam satu grup saat registrasi roster", async () => {
      const group = "GRP-ROSTER-LIMIT";
      const corridor = "KOR-A";

      for (let s = 1; s <= 10; s++) {
        await store.saveStudent({
          nim: `ROSTER-${s}`,
          nama: `Mhs ${s}`,
          gender: s % 2 === 0 ? "P" : "L",
          corridor,
          group,
          seat: s
        });
      }

      await assert.rejects(
        async () => {
          await store.saveStudent({
            nim: "ROSTER-11",
            nama: "Mhs 11",
            gender: "L",
            corridor,
            group,
            seat: 1 // seat sudah penuh atau mahasiswa ke-11
          });
        },
        (err) => {
          assert.ok(err instanceof CorridorCapacityError || err instanceof SeatConflictError);
          return true;
        }
      );
    });

    it("13. Menolak nomor kursi (seat) ganda pada grup dan koridor yang sama", async () => {
      const group = "GRP-SEAT-TEST";
      const corridor = "KOR-B";

      await store.saveStudent({
        nim: "NIM-SEAT-1",
        nama: "Mhs Seat 1",
        gender: "L",
        corridor,
        group,
        seat: 3
      });

      await assert.rejects(
        async () => {
          await store.saveStudent({
            nim: "NIM-SEAT-2",
            nama: "Mhs Seat 2",
            gender: "P",
            corridor,
            group,
            seat: 3 // Seat 3 ganda
          });
        },
        (err) => {
          assert.ok(err instanceof SeatConflictError);
          return true;
        }
      );
    });
  });
}

module.exports = { runStoreContractTests };

