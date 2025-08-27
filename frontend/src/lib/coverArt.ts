// TODO: add retry/backoff if Spotify rate-limits
export async function fetchCoverArt(artist: string, album?: string): Promise<string | undefined> {
  try {
    const mod: any = (await import('album-art')).default || (await import('album-art'));
    const url: string = await mod(artist, album ? { album } : undefined);
    return url || undefined;
  } catch {
    return undefined;
  }
}
