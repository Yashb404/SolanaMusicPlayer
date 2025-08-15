use anchor_lang::prelude::*;

pub mod state;        // user_profile.rs, track.rs, playlist.rs
pub mod instructions; // initialize_user.rs, upload_track.rs, etc.
pub mod errors;       // error definitions

use instructions::*;  // so InitializeUser, UploadTrack, etc. are visible

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

    // TODO: add these later:
    // pub fn upload_track(...) -> Result<()> { ... }
    // pub fn create_playlist(...) -> Result<()> { ... }
    // pub fn add_track_to_playlist(...) -> Result<()> { ... }
}
