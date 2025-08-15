import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MusicPlayer } from "../target/types/music_player";
import { PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import BN from "bn.js";

describe("music_player", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MusicPlayer as Program<MusicPlayer>;
  const user = provider.wallet;

  it("Initializes a user profile", async () => {
    const [userProfilePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user-profile"), user.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .initializeUser("yash", "yash@example.com")
      .accounts({
        signer: user.publicKey,
      })
      .rpc();

    const account = await program.account.userProfile.fetch(userProfilePda);

    assert.equal(account.user.toBase58(), user.publicKey.toBase58());
    assert.equal(account.username, "yash");
    assert.equal(account.email, "yash@example.com");
    console.log("✅ User profile created:", account);
  });

it("Uploads a track with track_id", async () => {
  const user = provider.wallet;
  const trackId = new BN(1);                      // ✅ u64 -> BN in Anchor TS

  // ✅ derive PDA with LE 8-byte encoding (matches to_le_bytes on-chain)
  const trackIdLe = Buffer.from(trackId.toArrayLike(Buffer, "le", 8));

  const [trackPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("track"), user.publicKey.toBuffer(), trackIdLe],
    program.programId
  );

  await program.methods
    .uploadTrack(trackId, "MyTitle", "Artist", "Genre", "myTrackUri") // ✅ include trackId first
    .accounts({
      signer: user.publicKey,
    })
    .rpc();

  const trackAccount = await program.account.track.fetch(trackPda);
  assert.equal(trackAccount.owner.toBase58(), user.publicKey.toBase58());
  assert.equal(trackAccount.title, "MyTitle");
  assert.equal(trackAccount.uri, "myTrackUri");

  console.log("Track account data:", {
  owner: trackAccount.owner.toBase58(),
  title: trackAccount.title,
  artist: trackAccount.artist,
  uri: trackAccount.uri,
  createdAt: trackAccount.createdAt.toNumber(),
});
});


});
