import { parseTrackMetadata, TrackMetadataV1 } from "../types/trackMetadata";

export function isProbablyIpfsCid(value: string): boolean {
  // Very lightweight check (no heavy dependency); good enough for UI validation.
  // Accepts CIDv0 (Qm...) and CIDv1 base32 (bafy...).
  return /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[a-z2-7]{30,})$/.test(value);
}

export function validateTrackMetadata(json: unknown): {
  ok: true;
  value: TrackMetadataV1;
} | {
  ok: false;
  error: string;
} {
  try {
    const value = parseTrackMetadata(json);

    if (!isProbablyIpfsCid(value.full.encrypted_audio_cid)) {
      return { ok: false, error: "full.encrypted_audio_cid does not look like a CID" };
    }
    if (value.preview && !isProbablyIpfsCid(value.preview.cid)) {
      return { ok: false, error: "preview.cid does not look like a CID" };
    }
    if (value.image_cid && !isProbablyIpfsCid(value.image_cid)) {
      return { ok: false, error: "image_cid does not look like a CID" };
    }

    return { ok: true, value };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Invalid track metadata" };
  }
}
