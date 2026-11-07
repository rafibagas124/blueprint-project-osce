const { describe } = require("node:test");
const { MemoryStore } = require("../../src/store/memory-store");
const { runStoreContractTests } = require("../contract/store.contract");

runStoreContractTests("MemoryStore", async () => {
  return new MemoryStore();
});
