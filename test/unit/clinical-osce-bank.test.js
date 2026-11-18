"use strict";

const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { server, signJwt } = require("../../server");
const { OSCE_CLINICAL_STATIONS } = require("../../src/data/osce-clinical-seed");

let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(() => {
  server.close();
  server.unref?.();
});

describe("Clinical OSCE case bank access", () => {
  it("contains all 8 stations with complete case sections", () => {
    assert.deepEqual(OSCE_CLINICAL_STATIONS.map((station) => station.cases.length), [6, 6, 8, 26, 9, 9, 7, 10]);
    for (const station of OSCE_CLINICAL_STATIONS) {
      for (const clinicalCase of station.cases) {
        for (const field of ["patientScenario", "tasks", "anamnesis", "findings", "investigations", "diagnosis", "differentials", "treatment", "procedure", "kie", "prescriptionFormat", "rubric"]) {
          assert.ok(field in clinicalCase, `Station ${station.number}, kasus ${clinicalCase.number} harus memiliki ${field}`);
        }
        assert.deepEqual(clinicalCase.rubric.scale.map((item) => item.score), [0, 1, 2]);
      }
    }
  });

  it("serves the static Figma preview but keeps the server-side case bank private", async () => {
    const preview = await fetch(`${baseUrl}/osce-preview.html`);
    assert.equal(preview.status, 200);
    const previewHtml = await preview.text();
    assert.match(previewHtml, /Multi-screen Figma Preview/);
    assert.equal((previewHtml.match(/class="artboard"/g) || []).length, 4);
    for (const screen of ["Landing Dashboard 8 Station OSCE", "Workspace Peserta", "Workspace Penguji Terbuka", "Showcase Kartu Kasus Station 2 sampai 8"]) {
      assert.ok(previewHtml.includes(screen), `Preview harus mencakup ${screen}`);
    }
    assert.match(previewHtml, /width: 1440px/);
    assert.match(previewHtml, /margin: 0 auto 80px/);

    const bank = await fetch(`${baseUrl}/src/data/osce-clinical-seed.js`);
    assert.equal(bank.status, 404);
  });

  it("requires an authenticated account", async () => {
    const response = await fetch(`${baseUrl}/api/clinical-osce`);
    assert.equal(response.status, 401);
  });

  it("returns candidate-safe station data and only requested exam results", async () => {
    const token = signJwt({ sub: "student-01", role: "student" });
    const response = await fetch(`${baseUrl}/api/clinical-osce`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.stations.length, 8);
    assert.equal(body.stations[0].durationMinutes, 15);
    assert.equal(body.stations[0].cases.length, 6);
    assert.equal(body.stations[0].cases[0].candidateScenario.includes("65 tahun"), true);
    assert.equal("title" in body.stations[0].cases[0], false);
    assert.equal("treatment" in body.stations[0].cases[0], false);
    assert.equal(body.stations[3].caseCount, 26);

    const examResponse = await fetch(`${baseUrl}/api/clinical-osce/1/2/physical`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.equal(examResponse.status, 200);
    const examBody = await examResponse.json();
    assert.match(examBody.findings, /JVP 5\+3/);
    assert.equal("diagnosis" in examBody, false);
  });

  it("returns examiner material only to assessor roles", async () => {
    const token = signJwt({ sub: "assessor-01", role: "assessor" });
    const response = await fetch(`${baseUrl}/api/clinical-osce`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.role, "assessor");
    assert.equal(body.stations[0].cases[0].title, "Cardiac Arrest");
    assert.match(body.stations[0].cases[0].treatment, /epinefrin 1 mg/i);
  });
});
