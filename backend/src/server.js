import express from "express";
import multer from "multer";

import { config } from "./config.js";
import { makeIpfsClient, addBuffer, addJson } from "./ipfs.js";
import { encryptAes256Gcm, sha256Hex } from "./crypto.js";
import { buildMetadataV1 } from "./metadata.js";
import { loadKeyStore, saveKeyStore, putKey } from "./keyStore.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

/**
 * MVP upload:
 * - Accepts audio file + title
 * - Encrypts audio (AES-256-GCM)
 * - Uploads encrypted bytes to IPFS
 * - Generates public metadata.json (NO plaintext audio CID)
 * - Uploads metadata.json to IPFS
 * - Returns metadata CID + encrypted audio CID
 */
app.post("/upload", upload.single("audio"), async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    const description = String(req.body.description || "").trim() || undefined;
    const artistWallet = String(req.body.artist_wallet || "").trim() || undefined;
    const mime = String(req.body.mime || "audio/mpeg").trim();

    if (!title) return res.status(400).json({ ok: false, error: "title is required" });
    if (!req.file?.buffer) return res.status(400).json({ ok: false, error: "audio file is required" });

    const ipfs = makeIpfsClient(config.ipfsApiUrl);

    // Encrypt full audio
    const plaintext = req.file.buffer;
    const plaintextSha256Hex = sha256Hex(plaintext);
    const { key, iv, encrypted } = encryptAes256Gcm(plaintext);
    const encryptedSha256Hex = sha256Hex(encrypted);

    const encryptedAudioCid = await addBuffer(ipfs, encrypted, "audio.enc");

    const ivB64 = iv.toString("base64");

    const metadata = buildMetadataV1({
      title,
      description,
      artistWallet,
      encryptedAudioCid,
      mime,
      ivB64,
      encryptedSha256Hex,
      plaintextSha256Hex,
      // previewCid: undefined (future)
      // imageCid: undefined (future)
    });

    const metadataCid = await addJson(ipfs, metadata, "metadata.json");

    // Store key material locally for MVP (Phase 3 will gate this by token ownership)
    const store = loadKeyStore(config.keyStorePath);
    putKey(store, encryptedAudioCid, {
      keyB64: key.toString("base64"),
      ivB64
    });
    saveKeyStore(config.keyStorePath, store);

    return res.json({
      ok: true,
      metadata_cid: metadataCid,
      encrypted_audio_cid: encryptedAudioCid,
      integrity: { plaintext_sha256_hex: plaintextSha256Hex, encrypted_sha256_hex: encryptedSha256Hex }
    });
  } catch (e) {
    console.error("/upload error", e);
    return res.status(500).json({ ok: false, error: "upload failed" });
  }
});

app.listen(config.port, () => {
  console.log(`[backend] listening on http://localhost:${config.port}`);
  console.log(`[backend] IPFS API: ${config.ipfsApiUrl}`);
});
