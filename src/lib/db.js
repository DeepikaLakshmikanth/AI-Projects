import { openDB } from 'idb';

const DB_NAME = 'WorkPilotDB';
const DB_VERSION = 1;
export const JOBS_STORE = 'jobs';
export const REMINDERS_STORE = 'reminders';

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(JOBS_STORE)) {
        const store = db.createObjectStore(JOBS_STORE, { keyPath: 'id' });
        store.createIndex('status', 'status');
        store.createIndex('dateApplied', 'dateApplied');
      }
      if (!db.objectStoreNames.contains(REMINDERS_STORE)) {
        const remindStore = db.createObjectStore(REMINDERS_STORE, { keyPath: 'id' });
        remindStore.createIndex('jobId', 'jobId');
        remindStore.createIndex('dueDate', 'dueDate');
      }
    },
  });
};

export const getJobs = async () => {
  const db = await initDB();
  return db.getAll(JOBS_STORE);
};

export const addJob = async (job) => {
  const db = await initDB();
  return db.put(JOBS_STORE, job);
};

export const updateJob = async (job) => {
  const db = await initDB();
  return db.put(JOBS_STORE, job);
};

export const deleteJob = async (id) => {
  const db = await initDB();
  return db.delete(JOBS_STORE, id);
};

export const getReminders = async () => {
  const db = await initDB();
  return db.getAll(REMINDERS_STORE);
};

export const addReminder = async (reminder) => {
  const db = await initDB();
  return db.put(REMINDERS_STORE, reminder);
};

export const deleteReminder = async (id) => {
  const db = await initDB();
  return db.delete(REMINDERS_STORE, id);
};

export const importData = async (jsonData) => {
  const db = await initDB();
  const tx = db.transaction([JOBS_STORE, REMINDERS_STORE], 'readwrite');
  
  if (jsonData.jobs) {
    await tx.objectStore(JOBS_STORE).clear();
    for (const job of jsonData.jobs) {
      tx.objectStore(JOBS_STORE).put(job);
    }
  }
  if (jsonData.reminders) {
    await tx.objectStore(REMINDERS_STORE).clear();
    for (const rem of jsonData.reminders) {
      tx.objectStore(REMINDERS_STORE).put(rem);
    }
  }
  await tx.done;
};
