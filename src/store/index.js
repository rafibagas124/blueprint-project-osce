// =========================================================================
// STORE FACTORY (PILIHAN DRIVER PENYIMPANAN BERDASARKAN STORE_DRIVER)
// =========================================================================
const { FileStore } = require("./file-store");
const { MemoryStore } = require("./memory-store");
const {
  BaseStore,
  DuplicateSubmissionError,
  StationRestError,
  CorridorCapacityError,
  SeatConflictError,
  RosterValidationError
} = require("./store-interface");

let activeStoreInstance = null;

function getStore(driver = process.env.STORE_DRIVER || "file", options = {}) {
  if (activeStoreInstance && options.reuse !== false) {
    return activeStoreInstance;
  }

  const selectedDriver = String(driver).toLowerCase().trim();

  let store;
  if (selectedDriver === "memory") {
    store = new MemoryStore();
  } else if (selectedDriver === "file") {
    store = new FileStore(options);
  } else if (selectedDriver === "mongo") {
    throw new Error(
      "MongoStore belum disetujui untuk diimplementasikan. Gunakan STORE_DRIVER=file atau memory."
    );
  } else {
    throw new Error(`Driver penyimpanan tidak dikenal: ${driver}`);
  }

  if (options.reuse !== false) {
    activeStoreInstance = store;
  }
  return store;
}

module.exports = {
  getStore,
  BaseStore,
  FileStore,
  MemoryStore,
  DuplicateSubmissionError,
  StationRestError,
  CorridorCapacityError,
  SeatConflictError,
  RosterValidationError
};

