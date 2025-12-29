const DB_NAME = "HabitMoverDB";
const DB_VERSION = 1;
const STORE_NAME = "habits";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("IndexedDB error");
  });
}

export async function saveHabit(habit) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put(habit);
}

export async function getHabits() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  return tx.objectStore(STORE_NAME).getAll();
}
