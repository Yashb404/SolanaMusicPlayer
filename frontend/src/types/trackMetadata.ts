import { z } from "zod";

// Strict public metadata contract.
// Important: do NOT include plaintext full-audio CID in this object.

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
        duration_seconds: z.number().int().min(1).max(60).optional(),
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
            tag_included: z.boolean().optional().default(true),
          })
          .strict(),
      })
      .strict(),

    integrity: z
      .object({
        encrypted_sha256_hex: z.string().regex(/^[0-9a-fA-F]{64}$/).optional(),
        plaintext_sha256_hex: z.string().regex(/^[0-9a-fA-F]{64}$/).optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    // Hard fail if someone accidentally adds a plaintext CID field.
    if ((value as any).audio_cid !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Plaintext audio CID is not allowed. Use full.encrypted_audio_cid instead.",
        path: ["audio_cid"],
      });
    }
  });

export type TrackMetadataV1 = z.infer<typeof TrackMetadataSchemaV1>;

export function parseTrackMetadata(json: unknown): TrackMetadataV1 {
  return TrackMetadataSchemaV1.parse(json);
}
