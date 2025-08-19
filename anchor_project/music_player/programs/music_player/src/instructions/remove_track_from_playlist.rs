use anchor_lang::prelude::*;
use crate::state::playlist::Playlist;
use crate::state::track::Track;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct DeleteTrackFromPlaylist<'info> {
    #[account(mut, has_one = owner)]
    pub playlist: Account<'info, Playlist>,

    pub track: Account<'info, Track>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

pub fn handler(ctx: Context<DeleteTrackFromPlaylist>) -> Result<()> {
    let playlist = &mut ctx.accounts.playlist;
    let track_pubkey = ctx.accounts.track.key();

    // Convert Vec<u64> of track IDs to Pubkey vector for comparison
    if let Some(pos) = playlist.tracks.iter().position(|id| {
        Pubkey::new_from_array(id.to_le_bytes()) == track_pubkey
    }) {
        playlist.tracks.remove(pos);
        playlist.updated_at = Clock::get()?.unix_timestamp;
        Ok(())
    } else {
        Err(error!(ErrorCode::TrackNotFound))
    }
}

