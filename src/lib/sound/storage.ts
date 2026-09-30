const DB_NAME = "lime-soundboard";
const STORE = "clips";

export type StoredClip = { name: string; data: ArrayBuffer };

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open clip storage."));
  });
}

export async function readClips(): Promise<Map<string, StoredClip>> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const request = store.getAll();
    const keys = store.getAllKeys();
    const out = new Map<string, StoredClip>();
    tx.oncomplete = () => {
      const rows = request.result as StoredClip[];
      const ids = keys.result as string[];
      ids.forEach((id, index) => {
        const row = rows[index];
        if (row?.data) out.set(String(id), row);
      });
      db.close();
      resolve(out);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("Could not read clips."));
    };
  });
}

export async function writeClip(id: string, clip: StoredClip) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(clip, id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("Could not save that clip."));
    };
  });
}

export async function deleteClip(id: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("Could not remove that clip."));
    };
  });
}

export async function decodeClip(data: ArrayBuffer): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, 1, 44100);
  return ctx.decodeAudioData(data.slice(0));
}
