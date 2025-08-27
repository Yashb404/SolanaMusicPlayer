import { useState,useEffect } from "react";
import { Music, Plus } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { fetchCoverArt } from "@/lib/coverArt";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MusicSidebar } from "./MusicSidebar";
import { CreatePlaylistModal } from "../modals/CreatePlaylistModal";
import { UploadTrackModal } from "../modals/UploadTrackModal";
import { useMusicPlayerProgram } from "../../lib/solana-program";
import { usePlayer } from "../music/PlayerContext";


interface Playlist {
  id: string;
  name: string;
  tracks: string[]; // Track IDs as strings
}

interface Track {
  id: string;
  title: string;
  artist: string;
  coverArt: string;
  audioFile: string;
}

interface MusicPlayerLayoutProps {
  children: React.ReactNode;
}

export function MusicPlayerLayout({ children }: MusicPlayerLayoutProps) {
  const { connected } = useWallet();
  const { program, provider } = useMusicPlayerProgram();
  
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]); // ✅ Add missing tracks state
  const [isLoading, setIsLoading] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [showUploadTrack, setShowUploadTrack] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  // UI-only hide/restore for tracks (persisted per wallet)
  const [hiddenTrackIds, setHiddenTrackIds] = useState<Set<string>>(new Set());

  const storageKey = provider?.wallet?.publicKey
    ? `hiddenTracks:${provider.wallet.publicKey.toBase58()}`
    : null;

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      setHiddenTrackIds(new Set(ids));
    } catch {
      // FIXME: could surface a toast if needed
      setHiddenTrackIds(new Set());
    }
  }, [storageKey]);

  const saveHidden = (next: Set<string>) => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify([...next]));
  };

  const hideTrack = (id: string) => {
    setHiddenTrackIds(prev => {
      const next = new Set(prev);
      next.add(id);
      saveHidden(next);
      return next;
    });
  };

  const restoreTrack = (id: string) => {
    setHiddenTrackIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      saveHidden(next);
      return next;
    });
  };

  const isHidden = (id: string) => hiddenTrackIds.has(id);
  const visibleTracks = showHidden ? tracks : tracks.filter(t => !hiddenTrackIds.has(t.id));


  const { play } = usePlayer();

  // ✅ REAL SOLANA CALL: Create playlist on-chain
  const createPlaylist = async (name: string) => {
    if (!program || !provider || !connected) {
      console.error('Program not initialized or wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      const playlistId = new BN(Date.now());
      
      // Derive PDA for the new playlist
      const [playlistPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("playlist"), provider.wallet.publicKey.toBuffer(), playlistId.toArrayLike(Buffer, 'le', 8)],
        program.programId
      );

      // Call the Solana program
      await program.methods
        .createPlaylist(playlistId, name, "New playlist")
        .accounts({
          
          signer: provider.wallet.publicKey,
        })
        .rpc({ skipPreflight: true, commitment: "confirmed" });

      // ✅ FIXED: Use capitalized account name as per your IDL
      const playlistAccount = await program.account.playlist.fetch(playlistPda);
      
      // Update local state with on-chain data
      const newPlaylist: Playlist = {
        id: playlistAccount.id.toString(),
        name: playlistAccount.name,
        tracks: (playlistAccount.tracks || []).map((t: any) => t.toString()),
      };
      setPlaylists(prev => [newPlaylist, ...prev]);
      console.log("✅ Playlist created on-chain:", playlistAccount);
      
    } catch (error) {
      console.error("❌ Failed to create playlist:", error);
      // TODO: Add proper error handling/toast notifications
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ REAL SOLANA CALL: Upload track on-chain with IPFS
  const onUploadTrack = async (trackData: {
    title: string;
    artist: string;
    genre: string;
    ipfsCid: string;
    coverArt?: string;
  }) => {
    if (!program || !provider || !connected) {
      console.error('Program not initialized or wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      const trackId = new BN(Date.now());
      
      // Derive PDA for the new track
      const [trackPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("track"), provider.wallet.publicKey.toBuffer(), trackId.toArrayLike(Buffer, 'le', 8)],
        program.programId
      );

      // Use the IPFS CID directly - no need to upload files here
      const audioUri = `ipfs://${trackData.ipfsCid}`;
      
      // Call the Solana program
      const sig = await program.methods
        .uploadTrack(trackId, trackData.title, trackData.artist, trackData.genre, audioUri)
        .accounts({
          // ✅ inferred PDAs; only signer needed
          signer: provider.wallet.publicKey,
        })
        .rpc({ skipPreflight: true, commitment: "confirmed" });

      console.log("Tx:", sig, "Explorer:", `https://explorer.solana.com/tx/${sig}?cluster=devnet`);

      // ✅ Fetch the just-created account from chain for canonical data
      const trackAccount = await program.account.track.fetch(trackPda);
      // Minimal: auto-fetch cover art if not provided
      let coverUri = trackData.coverArt ? `ipfs://${trackData.coverArt}` : "ipfs://placeholder";
      if (!trackData.coverArt) {
        const fetched = await fetchCoverArt(trackData.artist, trackData.title); // best-effort
        if (fetched) coverUri = fetched; // use https URL from Spotify via album-art
      }
      const newTrack = mapTrackAccount(trackAccount);
      newTrack.coverArt = coverUri; // set fetched (or user-provided) cover art for UI
      setTracks(prev => [newTrack, ...prev]);
      
    } catch (error) {
      console.error("❌ Failed to upload track:", error);
      try {
        // Attempt to print simulation logs if available (Anchor SendTransactionError)
        const anyErr: any = error;
        if (anyErr && typeof anyErr.getLogs === 'function' && provider?.connection) {
          const logs = await anyErr.getLogs(provider.connection);
          console.error("🔍 Transaction logs:", logs);
        }
      } catch (e) {
        console.error("Failed to fetch logs:", e);
      }
      // TODO: Surface user-friendly toast with actionable hint (e.g., airdrop SOL on devnet)
    } finally {
      setIsLoading(false);
    }
  };

  const addTrackToPlaylist = async (playlistIdStr: string, trackIdStr: string) => {
    if (!program || !provider || !connected) return;

    try {
      setIsLoading(true);
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
        .accounts({
          playlist: playlistPda,
          track: trackPda,
        })
        .rpc({ skipPreflight: true, commitment: "confirmed" });

      // re-fetch updated playlist to refresh count
      const updated = await program.account.playlist.fetch(playlistPda);
      setPlaylists(prev =>
        prev.map(p => (p.id === playlistIdStr ? {
          id: updated.id.toString(),
          name: updated.name,
          tracks: (updated.tracks || []).map((t: any) => t.toString()),
        } : p))
      );
    } catch (e) {
      console.error("Failed to add track to playlist:", e);
    } finally {
      setIsLoading(false);
    }
  };

    // TODO: move to a shared utils file if reused elsewhere
    const mapTrackAccount = (t: any) => ({
      id: t.id.toString(),
      title: t.title,
      artist: t.artist,
      genre: t.genre,
      audioFile: t.uri,
      coverArt: "ipfs://placeholder", // TODO: wire real coverArt when available
      owner: t.owner.toBase58(),
      createdAt: Number(t.createdAt),
    });
    
  
    // Fetch my tracks from chain
    useEffect(() => {
      const run = async () => {
        if (!connected || !program || !provider?.wallet?.publicKey) return;
  
        try {
          setIsLoading(true);
          const owner = provider.wallet.publicKey.toBase58();
          // owner offset = 8 (discriminator) + 8 (id) = 16
          const accounts = await program.account.track.all([
            { memcmp: { offset: 16, bytes: owner } },
          ]);
  
          const mapped = accounts.map(a => mapTrackAccount(a.account));
          setTracks(mapped);
        } catch (e) {
          console.error("Failed to fetch tracks:", e);
        } finally {
          setIsLoading(false);
        }
      };
  
      run();
      // re-fetch when wallet or program changes
    }, [connected, program, provider]);

    // Fetch my playlists from chain
    useEffect(() => {
      const run = async () => {
        if (!connected || !program || !provider?.wallet?.publicKey) return;
        try {
          setIsLoading(true);
          const owner = provider.wallet.publicKey.toBase58();
          // owner offset for Playlist = 8(discriminator)+8(id)=16
          const accounts = await program.account.playlist.all([
            { memcmp: { offset: 16, bytes: owner } },
          ]);
          const mapped = accounts.map((a: any) => ({
            id: a.account.id.toString(),
            name: a.account.name as string,
            tracks: (a.account.tracks || []).map((t: any) => t.toString()),
          } as Playlist));
          setPlaylists(mapped);
        } catch (e) {
          console.error('Failed to fetch playlists:', e);
        } finally {
          setIsLoading(false);
        }
      };
      run();
    }, [connected, program, provider]);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background flex">
        <MusicSidebar 
          playlists={playlists}
          onCreatePlaylist={() => setShowCreatePlaylist(true)}
        />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-background sticky top-0 z-50">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <Music className="w-6 h-6" />
                  <h1 className="text-xl font-semibold">Music Player</h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowUploadTrack(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!connected} // Disable upload if wallet not connected
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Track
                </Button>

                <WalletMultiButton />
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </div>

        {/* Modals */}
        <CreatePlaylistModal
          isOpen={showCreatePlaylist}
          onClose={() => setShowCreatePlaylist(false)}
          onCreatePlaylist={createPlaylist}
        />
        
        <UploadTrackModal
          isOpen={showUploadTrack}
          onClose={() => setShowUploadTrack(false)}
          onUploadTrack={onUploadTrack}
        />
   
      </div>
    </SidebarProvider>
  );
}