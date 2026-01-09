import { z } from "zod";

// Public metadata contract (schema v1).
// MUST NOT contain plaintext full-audio CID.

export const TrackMetadataSchemaV1 = z
  .object({
    schema: z.literal(1),
    title: z.string().min(1).max(64),
    description: z.string().max(1024).optional(),
    artist_wallet: z.string().optional(),
    created_at: z.number().int().nonnegative(),
    image_cid: z.string().max(128).optional(),

    preview: z
      .object({
        cid: z.string().min(1).max(128),
        mime: z.string().min(3).max(64),
        duration_seconds: z.number().int().min(1).max(60).optional()
      })
      .strict()
      .optional(),

    full: z
      .object({
        encrypted_audio_cid: z.string().min(1).max(128),
        mime: z.string().min(3).max(64),
        encryption: z
          .object({
            alg: z.literal("AES-256-GCM"),
            iv_b64: z.string().min(8).max(128),
            tag_included: z.boolean().optional().default(true)
          })
          .strict()
      })
      .strict(),

    integrity: z
      .object({
        encrypted_sha256_hex: z.string().regex(/^[0-9a-fA-F]{64}$/).optional(),
        plaintext_sha256_hex: z.string().regex(/^[0-9a-fA-F]{64}$/).optional()
      })
      .strict()
      .optional()
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.audio_cid !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Plaintext audio CID is not allowed. Use full.encrypted_audio_cid instead."
      });
    }
  });

export function buildMetadataV1({
  title,
  description,
  artistWallet,
  encryptedAudioCid,
  mime,
  ivB64,
  encryptedSha256Hex,
  plaintextSha256Hex,
  previewCid,
  previewMime,
  previewDurationSeconds,
  imageCid
}) {
  const metadata = {
    schema: 1,
    title,
    description,
    artist_wallet: artistWallet,
    created_at: Math.floor(Date.now() / 1000),
    image_cid: imageCid,
    preview: previewCid
      ? {
          cid: previewCid,
          mime: previewMime || "audio/mpeg",
          duration_seconds: previewDurationSeconds
        }
      : undefined,
    full: {
      encrypted_audio_cid: encryptedAudioCid,
      mime,
      encryption: {
        alg: "AES-256-GCM",
        iv_b64: ivB64,
        tag_included: true
      }
    },
    integrity: {
      encrypted_sha256_hex: encryptedSha256Hex,
      plaintext_sha256_hex: plaintextSha256Hex
    }
  };

  // Validate before returning.
  return TrackMetadataSchemaV1.parse(metadata);
}
