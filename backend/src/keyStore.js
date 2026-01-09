import fs from "fs";

export function loadKeyStore(path) {
  try {
    const raw = fs.readFileSync(path, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveKeyStore(path, store) {
  fs.writeFileSync(path, JSON.stringify(store, null, 2));
}

// Store keys by encrypted audio CID (MVP only)
export function putKey(store, encryptedAudioCid, { keyB64, ivB64 }) {
  store[encryptedAudioCid] = {
    key_b64: keyB64,
    iv_b64: ivB64,
    created_at: Math.floor(Date.now() / 1000)
  };
}
