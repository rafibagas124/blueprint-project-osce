const { describe } = require("node:test");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { FileStore } = require("../../src/store/file-store");
const { runStoreContractTests } = require("../contract/store.contract");

const testDir = path.join(os.tmpdir(), "osce_file_store_test_" + Date.now());

runStoreContractTests("FileStore", async () => {
  return new FileStore({ baseDir: testDir });
});
