import { Connection, PublicKey, clusterApiUrl, Commitment } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN, Idl } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';

// Import your IDL
import idl from '../idl/music_player.json';
// Import the generated types from target/types
import type { MusicPlayer } from '@/music_player';

// Network configuration
const RPC_ENDPOINT = clusterApiUrl('devnet');

export interface MusicPlayerProgram extends Program<MusicPlayer> {
  // Add any specific types if needed
}

export const useMusicPlayerProgram = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet || !connection) return null;
    
    const anchorWallet = {
      publicKey: wallet.publicKey!,
      signTransaction: wallet.signTransaction!,
      // check for optional method
      signAllTransactions: wallet.signAllTransactions ?? undefined,
    };

    return new AnchorProvider(
      connection,
      anchorWallet as any,
      { commitment: 'processed' as Commitment }
    );
  }, [wallet, connection]);

  const program = useMemo(() => {
    if (!provider) return null;
    
    // ✅ FIXED: Use the generated MusicPlayer type for full type safety
    return new Program<MusicPlayer>(idl as MusicPlayer, provider) as MusicPlayerProgram;
  }, [provider]);

  return { program, provider };
};

// Helper function to derive PDAs
export const derivePDA = (seeds: (string | Buffer | PublicKey)[]) => {
  // ✅ FIXED: Get programId from the IDL instead of hardcoded constant
  const programId = new PublicKey(idl.address);
  
  const seedBuffers = seeds.map(seed => {
    if (typeof seed === 'string') return Buffer.from(seed);
    if (seed instanceof PublicKey) return seed.toBuffer();
    return seed;
  });
  
  return PublicKey.findProgramAddressSync(seedBuffers, programId);
};

// Helper function to create track PDA
export const createTrackPDA = (owner: PublicKey, trackId: BN) => {
  // ✅ FIXED: Get programId from the IDL
  const programId = new PublicKey(idl.address);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from("track"), owner.toBuffer(), trackId.toBuffer('le', 8)],
    programId
  );
};

// Helper function to create playlist PDA
export const createPlaylistPDA = (owner: PublicKey, playlistId: BN) => {
  // ✅ FIXED: Get programId from the IDL
  const programId = new PublicKey(idl.address);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from("playlist"), owner.toBuffer(), playlistId.toBuffer('le', 8)],
    programId
  );
};

// Helper function to create user profile PDA
export const createUserProfilePDA = (owner: PublicKey) => {
  // ✅ FIXED: Get programId from the IDL
  const programId = new PublicKey(idl.address);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from("user-profile"), owner.toBuffer()],
    programId
  );
};