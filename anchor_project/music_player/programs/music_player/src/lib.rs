use anchor_lang::prelude::*;

pub mod state;        // user_profile.rs, track.rs, playlist.rs
pub mod instructions; // initialize_user.rs, upload_track.rs, etc.
pub mod errors;       // error definitions

pub use instructions::*;  // so InitializeUser, UploadTrack, etc. are visible
use instructions::*;

declare_id!("B4RYieJzdH81NwbNoVkRgfZuYBBNbNPKjhPWZ1NxkDie");

#[program]
pub mod music_player {
    use super::*;

    pub fn initialize_user(
        ctx: Context<InitializeUser>,
        username: String,
        email: String,
    ) -> Result<()> {
        instructions::initialize_user::handler(ctx, username, email)
    }

    

    pub fn upload_track(
    ctx: Context<UploadTrack>,
    track_id: u64,
    title: String,
    artist: String,
    genre: String,
    uri: String,
) -> Result<()> {
    instructions::upload_track::handler(ctx, track_id, title, artist, genre, uri)
}

    pub fn create_playlist(
        ctx: Context<CreatePlaylist>,
        playlist_id: u64,
        name: String,
        description: String,
    ) -> Result<()> {
        instructions::create_playlist::handler(ctx, playlist_id, name, description)
    }    

    pub fn add_track_to_playlist(
    ctx: Context<AddTrackToPlaylist>,
   
) -> Result<()> {
    instructions::add_track_to_playlist::handler(ctx)
}
    
}
