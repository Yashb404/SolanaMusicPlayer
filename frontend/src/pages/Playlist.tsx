import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { useMusicPlayerProgram } from "@/lib/solana-program";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/components/music/PlayerContext";

type UiTrack = {
  id: string;
  title: string;
  artist: string;
  audioFile: string;
  coverArt: string;
};

export default function Playlist() {
  const { id } = useParams();
  const { program, provider } = useMusicPlayerProgram();
  const { play } = usePlayer();

  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [tracks, setTracks] = useState<UiTrack[]>([]);
  const [loading, setLoading] = useState(false);

  // TODO: extract mapping util if reused elsewhere
  const mapTrackAccount = (t: any): UiTrack => ({
    id: t.id.toString(),
    title: t.title,
    artist: t.artist,
    audioFile: t.uri,
    coverArt: "ipfs://placeholder", // TODO: wire real cover art when stored
  });

  useEffect(() => {
    const run = async () => {
      if (!id || !program || !provider?.wallet?.publicKey) return;
      try {
        setLoading(true);

        // derive playlist PDA from owner + playlistId
        const playlistId = new BN(id);
        const [playlistPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("playlist"), provider.wallet.publicKey.toBuffer(), playlistId.toArrayLike(Buffer, "le", 8)],
          program.programId
        );

        const playlist = await program.account.playlist.fetch(playlistPda);
        setName(playlist.name as string);
        setDesc(playlist.description as string);

        const trackIds: BN[] = (playlist.tracks || []) as BN[];
        if (trackIds.length === 0) {
          setTracks([]);
          return;
        }

        // fetch each track account by its PDA
        const fetched: UiTrack[] = [];
        for (const tId of trackIds) {
          const [trackPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("track"), provider.wallet.publicKey.toBuffer(), tId.toArrayLike(Buffer, "le", 8)],
            program.programId
          );
          const tAcc = await program.account.track.fetch(trackPda);
          fetched.push(mapTrackAccount(tAcc));
        }
        setTracks(fetched);
      } catch (e) {
        console.error("Failed to load playlist:", e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, program, provider]);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bold">{name || "Playlist"}</h2>
        {desc ? <p className="text-sm text-muted-foreground mt-1">{desc}</p> : null}
      </div>

      {tracks.length === 0 ? (
        <p className="text-muted-foreground">No tracks in this playlist yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracks.map((t) => (
            <div key={t.id} className="p-4 border rounded-lg hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{t.title}</div>
                  <div className="text-sm text-muted-foreground truncate">{t.artist}</div>
                </div>
                <Button size="sm" onClick={() => play(t)}>▶️ Play</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}