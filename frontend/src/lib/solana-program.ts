import { Connection, PublicKey, clusterApiUrl, Commitment } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN, Idl } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';

// Import your IDL - fixed path to the correct location
import idl from '../../anchor_project/music_player/target/idl/music_player.json';
// Your program ID from Anchor.toml
const PROGRAM_ID = new PublicKey("B4RYieJzdH81NwbNoVkRgfZuYBBNbNPKjhPWZ1NxkDie");

// Network configuration
const NETWORK = clusterApiUrl('devnet');

export interface MusicPlayerProgram extends Program {
  // Add any specific types if needed
}

export const useMusicPlayerProgram = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();

  return useMemo(() => {
    try {
      if (!publicKey || !signTransaction || !signAllTransactions) {
        return null;
      }

      const commitment: Commitment = 'processed';
      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction, signAllTransactions },
        { commitment }
      );

      // Fixed: Program constructor parameters should be (idl, provider) for Anchor 0.31.1+
      const program = new Program(idl as Idl, provider) as MusicPlayerProgram;

      return { program, provider };
    } catch (error) {
      console.error('Error initializing Solana program:', error);
      return null;
    }
  }, [connection, publicKey, signTransaction, signAllTransactions]);
};

// Helper functions for common operations
export const derivePDA = (seeds: (string | Buffer | PublicKey)[]) => {
  // Convert all seeds to Buffer to fix type issues
  const bufferSeeds = seeds.map(seed => {
    if (typeof seed === 'string') {
      return Buffer.from(seed);
    } else if (seed instanceof PublicKey) {
      return seed.toBuffer();
    }
    return seed;
  });
  return PublicKey.findProgramAddressSync(bufferSeeds, PROGRAM_ID);
};

export const createTrackPDA = (owner: PublicKey, trackId: BN) => {
  return derivePDA([
    Buffer.from("track"),
    owner.toBuffer(),
    trackId.toBuffer('le', 8)
  ]);
};

export const createPlaylistPDA = (owner: PublicKey, playlistId: BN) => {
  return derivePDA([
    Buffer.from("playlist"),
    owner.toBuffer(),
    playlistId.toBuffer('le', 8)
  ]);
};

export const createUserProfilePDA = (owner: PublicKey) => {
  return derivePDA([
    Buffer.from("user-profile"),
    owner.toBuffer()
  ]);
};