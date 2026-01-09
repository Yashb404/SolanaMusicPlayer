import crypto from "crypto";

export function sha256Hex(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export function encryptAes256Gcm(plaintext) {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Common approach: append tag to the end.
  const out = Buffer.concat([ciphertext, tag]);

  return {
    key,
    iv,
    encrypted: out
  };
}
