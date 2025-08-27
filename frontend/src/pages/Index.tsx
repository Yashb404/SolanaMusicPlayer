import { useEffect, useMemo, useState } from "react";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { MusicPlayerLayout } from "@/components/layout/MusicPlayerLayout";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, EyeOff } from "lucide-react";
import { useMusicPlayerProgram } from "@/lib/solana-program";
import { usePlayer } from "@/components/music/PlayerContext";
import { fetchCoverArt } from "@/lib/coverArt";

type Track = { id: string; title: string; artist: string; coverArt: string; audioFile: string; };
type Playlist = { id: string; name: string; tracks: string[]; };

const Index = () => {
  const { connected } = useWallet();
  const { program, provider } = useMusicPlayerProgram();
  const { play } = usePlayer();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Hide/restore per wallet (UI-only)
  const [hiddenTrackIds, setHiddenTrackIds] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const storageKey = provider?.wallet?.publicKey ? `hiddenTracks:${provider.wallet.publicKey.toBase58()}` : null;

  // below hidden state
  const coverKey = provider?.wallet?.publicKey ? `coverArt:${provider.wallet.publicKey.toBase58()}` : null;
  const saveCover = (id: string, uri?: string) => {
    if (!coverKey || !uri) return;
    try {
      const map = JSON.parse(localStorage.getItem(coverKey) || "{}");
      map[id] = uri;
      localStorage.setItem(coverKey, JSON.stringify(map));
    } catch {}
  };
  const getCover = (id: string): string | undefined => {
    if (!coverKey) return undefined;
    try {
      const map = JSON.parse(localStorage.getItem(coverKey) || "{}");
      return map[id];
    } catch {
      return undefined;
    }
  };

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      setHiddenTrackIds(new Set(ids));
    } catch {
      setHiddenTrackIds(new Set());
    }
  }, [storageKey]);

  const saveHidden = (next: Set<string>) => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify([...next]));
  };
  const hideTrack = (id: string) => {
    setHiddenTrackIds(prev => { const next = new Set(prev); next.add(id); saveHidden(next); return next; });
  };
  const restoreTrack = (id: string) => {
    setHiddenTrackIds(prev => { const next = new Set(prev); next.delete(id); saveHidden(next); return next; });
  };
  const isHidden = (id: string) => hiddenTrackIds.has(id);
  const visibleTracks = showHidden ? tracks : tracks.filter(t => !hiddenTrackIds.has(t.id));

  // Map on-chain account to UI
  const mapTrackAccount = (t: any): Track => {
    const idStr = t.id.toString();
    const cached = getCover(idStr);
    return {
      id: idStr,
      title: t.title,
      artist: t.artist,
      coverArt: cached || "ipfs://placeholder", // TODO: fallback only if not cached
      audioFile: t.uri,
    };
  };

  // Fetch tracks
  useEffect(() => {
    const run = async () => {
      if (!connected || !program || !provider?.wallet?.publicKey) return;
      setIsLoading(true);
      try {
        const owner = provider.wallet.publicKey.toBase58();
        const accounts = await program.account.track.all([{ memcmp: { offset: 16, bytes: owner } }]);
        setTracks(accounts.map(a => mapTrackAccount(a.account)));
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [connected, program, provider]);

  // after you setTracks(...) in the tracks fetch effect, add a follow-up best-effort fill pass
  useEffect(() => {
    // fill covers for tracks without a non-placeholder cover
    (async () => {
      const missing = tracks.filter(t => !t.coverArt || t.coverArt === "ipfs://placeholder");
      if (missing.length === 0) return;
      const updates: Record<string,string> = {};
      for (const t of missing) {
        try {
          const url = await fetchCoverArt(t.artist, t.title);
          if (url) {
            updates[t.id] = url;
            saveCover(t.id, url);
          }
        } catch {}
      }
      if (Object.keys(updates).length) {
        setTracks(prev => prev.map(t => updates[t.id] ? { ...t, coverArt: updates[t.id] } : t));
      }
    })();
  }, [tracks]); // TODO: throttle/debounce to avoid repeated fetches on rapid state changes

  // Fetch playlists
  useEffect(() => {
    const run = async () => {
      if (!connected || !program || !provider?.wallet?.publicKey) return;
      setIsLoading(true);
      try {
        const owner = provider.wallet.publicKey.toBase58();
        const accounts = await program.account.playlist.all([{ memcmp: { offset: 16, bytes: owner } }]);
        setPlaylists(accounts.map((a: any) => ({
          id: a.account.id.toString(),
          name: a.account.name as string,
          tracks: (a.account.tracks || []).map((t: any) => t.toString()),
        })));
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [connected, program, provider]);

  // Add track to playlist (on-chain)
  const addTrackToPlaylist = async (playlistIdStr: string, trackIdStr: string) => {
    if (!program || !provider || !connected) return;
    setIsLoading(true);
    try {
      const playlistId = new BN(playlistIdStr);
      const trackId = new BN(trackIdStr);
      const [playlistPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("playlist"), provider.wallet.publicKey.toBuffer(), playlistId.toArrayLike(Buffer, "le", 8)],
        program.programId
      );
      const [trackPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("track"), provider.wallet.publicKey.toBuffer(), trackId.toArrayLike(Buffer, "le", 8)],
        program.programId
      );
      await program.methods
        .addTrackToPlaylist()
        .accounts({ playlist: playlistPda, track: trackPda })
        .rpc({ skipPreflight: true, commitment: "confirmed" });
    } finally {
      setIsLoading(false);
    }
  };

  const playTrack = (t: Track) => { void play(t); };

  return (
    <MusicPlayerLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Library</h1>
            <p className="text-muted-foreground mt-2">Your music collection</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} />
            Show hidden
          </label>
        </div>

        {visibleTracks.length === 0 ? (
          <p className="text-muted-foreground">{isLoading ? "Loading..." : "No tracks yet."}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleTracks.map((track) => {
              const hidden = isHidden(track.id);
              return (
                <div key={track.id} className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${hidden ? "opacity-60" : ""}`}>
                  <div className="space-y-3">
                    <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
                      <img
                        src={
                          tracks.find(x => x.id === track.id)?.coverArt?.startsWith("ipfs://")
                            ? `https://ipfs.io/ipfs/${track.coverArt.slice(7)}`
                            : tracks.find(x => x.id === track.id)?.coverArt || ""
                        }
                        alt={track.title}
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                      {/* play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition">
                        <Button size="sm" onClick={() => playTrack(track)}>
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                          Play
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{track.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" onClick={() => (hidden ? restoreTrack(track.id) : hideTrack(track.id))} title={hidden ? "Restore" : "Hide"}>
                          {hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="outline">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Add to playlist</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {playlists.length === 0 ? (
                              <DropdownMenuItem disabled>No playlists</DropdownMenuItem>
                            ) : (
                              playlists.map(p => (
                                <DropdownMenuItem key={p.id} onClick={() => addTrackToPlaylist(p.id, track.id)}>
                                  {p.name}
                                </DropdownMenuItem>
                              ))
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MusicPlayerLayout>
  );
};

export default Index;
