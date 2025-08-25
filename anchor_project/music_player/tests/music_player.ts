import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MusicPlayer } from "../target/types/music_player";
import { PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import BN from "bn.js";


describe("music_player", () => {
 
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
  const trackId = new BN(1);                      

  const trackIdLe = Buffer.from(trackId.toArrayLike(Buffer, "le", 8));

  const [trackPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("track"), user.publicKey.toBuffer(), trackIdLe],
    program.programId
  );

  await program.methods
    .uploadTrack(trackId, "MyTitle", "Artist", "Genre", "myTrackUri") 
    .accounts({
      signer: user.publicKey,
    })
    .rpc();

  const trackAccount = await program.account.track.fetch(trackPda);
  assert.equal(trackAccount.owner.toBase58(), user.publicKey.toBase58());
  assert.equal(trackAccount.title, "MyTitle");
  assert.equal(trackAccount.uri, "myTrackUri");
  assert.equal(trackAccount.genre,"Genre");
  assert.equal(trackAccount.artist,"Artist");

});

it("Creates a playlist", async () => {
  const user = provider.wallet;
  const playlistId = new BN(1);

  const playlistIdLe = Buffer.from(playlistId.toArrayLike(Buffer, "le", 8));

  const [playlistPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("playlist"), user.publicKey.toBuffer(), playlistIdLe],
    program.programId
  );
await program.methods
  .createPlaylist(playlistId, "My Playlist", "My favorite tracks")
  .accounts({
    signer: user.publicKey,
  })
  .rpc();

  const playlistAccount = await program.account.playlist.fetch(playlistPda);

  assert.equal(playlistAccount.name, "My Playlist");
  assert.equal(playlistAccount.description, "My favorite tracks");
  assert.deepEqual(playlistAccount.tracks, []);

  
});


it("adds track to playlist", async () => {
        const userPublicKey = user.publicKey;

        
        const trackId = new BN(3);
        const playlistId = new BN(2);
        
        const [trackPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("track"), userPublicKey.toBuffer(), trackId.toBuffer('le', 8)],
            program.programId
        );

        const [playlistPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("playlist"), userPublicKey.toBuffer(), playlistId.toBuffer('le', 8)],
            program.programId
        );

        await program.methods
            .uploadTrack(trackId, "MyTitle", "Artist", "Genre", "track_hash")
            .accounts({
                signer: userPublicKey,
            })
            .rpc();

        
        await program.methods
            .createPlaylist(playlistId, "playlist_name", "my first playlist")
            .accounts({
                signer: userPublicKey,
            })
            .rpc();

     
        await program.methods
            .addTrackToPlaylist()
            .accounts({
                playlist: playlistPda,
                track: trackPda,
            })
            .rpc();
       
        const playlist = await program.account.playlist.fetch(playlistPda);
        assert.equal(playlist.tracks.length, 1, "track should be added to playlist");
        assert.equal(playlist.tracks[0].toNumber(), trackId.toNumber(), "track ID should match");
        assert.equal(playlist.owner.toBase58(), userPublicKey.toBase58(), "playlist owner should match");
    });


    it("removes track from playlist", async () => {
      const userPublicKey = user.publicKey;
      
      const trackId = new BN(4);
      const playlistId = new BN(3);
      
      // Derive PDAs
      const [trackPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("track"), userPublicKey.toBuffer(), trackId.toBuffer('le', 8)],
          program.programId
      );
  
      const [playlistPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("playlist"), userPublicKey.toBuffer(), playlistId.toBuffer('le', 8)],
          program.programId
      );
  
      // First upload the track
      await program.methods
          .uploadTrack(trackId, "TrackToRemove", "Artist", "Genre", "track_hash")
          .accounts({
              signer: userPublicKey,
          })
          .rpc();
  
      // Create the playlist
      await program.methods
          .createPlaylist(playlistId, "Test Playlist", "For testing removal")
          .accounts({
              signer: userPublicKey,
          })
          .rpc();
  
      // Add track to playlist first
      await program.methods
          .addTrackToPlaylist()
          .accounts({
              playlist: playlistPda,
              track: trackPda,
          })
          .rpc();
  
      // Verify track was added
      let playlist = await program.account.playlist.fetch(playlistPda);
      assert.equal(playlist.tracks.length, 1, "track should be added to playlist");
      assert.equal(playlist.tracks[0].toNumber(), trackId.toNumber(), "track ID should match");
  
      // Now remove the track from playlist
      await program.methods
          .removeTrackFromPlaylist()
          .accounts({
              playlist: playlistPda,
              track: trackPda,
              
          })
          .rpc();
  
      // Verify track was removed
      playlist = await program.account.playlist.fetch(playlistPda);
      assert.equal(playlist.tracks.length, 0, "track should be removed from playlist");
      assert.isFalse(playlist.tracks.includes(trackId), "track ID should not be in playlist");
      
      // Verify playlist owner still matches
      assert.equal(playlist.owner.toBase58(), userPublicKey.toBase58(), "playlist owner should still match");
  });

});
