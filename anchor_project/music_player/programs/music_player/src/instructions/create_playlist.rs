use anchor_lang::prelude::*;
use crate::state::playlist::Playlist;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(playlist_id: u64)]
pub struct CreatePlaylist<'info> {
    #[account(
        init,
        payer = signer,
        space = Playlist::LEN,
        seeds = [
            b"playlist",
            signer.key().as_ref(),
            &playlist_id.to_le_bytes()
        ],
        bump
    )]
    pub playlist: Account<'info, Playlist>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreatePlaylist>, playlist_id: u64, name: String, description: String) -> Result<()> {
    require!(
      name.len() <= Playlist::MAX_NAME_LEN &&
      description.len() <= Playlist::MAX_DESC_LEN,
      ErrorCode::InvalidInputData
    );

    let playlist = &mut ctx.accounts.playlist;
    let clock = Clock::get()?;

    playlist.id = playlist_id;
    playlist.owner = ctx.accounts.signer.key();
    playlist.name = name;
    playlist.description = description;
    playlist.tracks = Vec::new();
    playlist.created_at = clock.unix_timestamp;
    playlist.updated_at = clock.unix_timestamp;

    Ok(())
}
