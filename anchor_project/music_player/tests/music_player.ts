import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MusicPlayer } from "../target/types/music_player";
import { PublicKey } from "@solana/web3.js";
import { assert } from "chai";

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
});
