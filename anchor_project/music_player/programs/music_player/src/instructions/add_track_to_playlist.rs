use anchor_lang::prelude::*;
use crate::state::playlist::Playlist;
use crate::state::track::Track;
use crate::errors::ErrorCode;

#[derive(Accounts)]

pub struct AddTrackToPlaylist<'info> {
    #[account(mut, has_one = owner)]
    pub playlist: Account<'info, Playlist>,

    pub track: Account<'info, Track>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

#[inline(never)]
pub fn handler(ctx: Context<AddTrackToPlaylist>) -> Result<()> {
    let playlist = &mut ctx.accounts.playlist;
    require!(playlist.tracks.len() < Playlist::MAX_TRACKS, ErrorCode::InvalidInputData);
    playlist.tracks.push(ctx.accounts.track.id);
    playlist.updated_at = Clock::get()?.unix_timestamp;
    Ok(())
}
