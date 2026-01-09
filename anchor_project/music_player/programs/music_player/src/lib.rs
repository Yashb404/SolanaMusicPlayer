use anchor_lang::prelude::*;

pub mod state;        // user_profile.rs, track.rs, playlist.rs
pub mod instructions; // initialize_user.rs, upload_track.rs, etc.
pub mod errors;       // error definitions

pub use instructions::*;  // so InitializeUser, UploadTrack, etc. are visible

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
        metadata_cid: String,
    ) -> Result<()> {
        instructions::upload_track::handler(ctx, track_id, title, metadata_cid)
    }

    pub fn create_mint_for_track(ctx: Context<CreateMintForTrack>) -> Result<()> {
        instructions::create_mint_for_track::handler(ctx)
    }

    pub fn mint_more(ctx: Context<MintMore>, amount: u64) -> Result<()> {
        instructions::mint_more::handler(ctx, amount)
    }

    pub fn create_or_update_listing(
        ctx: Context<CreateOrUpdateListing>,
        price_lamports: u64,
        deposit_amount: u64,
    ) -> Result<()> {
        instructions::create_or_update_listing::handler(ctx, price_lamports, deposit_amount)
    }

    pub fn buy(ctx: Context<Buy>, amount: u64) -> Result<()> {
        instructions::buy::handler(ctx, amount)
    }
}
