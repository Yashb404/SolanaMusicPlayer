use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

use crate::errors::ErrorCode;
use crate::state::{Track, TrackMint};

#[derive(Accounts)]
pub struct CreateMintForTrack<'info> {
    #[account(
        constraint = track.owner == signer.key() @ ErrorCode::Unauthorized
    )]
    pub track: Account<'info, Track>,

    #[account(
        init,
        payer = signer,
        space = TrackMint::LEN,
        seeds = [b"track-mint", track.key().as_ref()],
        bump
    )]
    pub track_mint: Account<'info, TrackMint>,

    #[account(
        init,
        payer = signer,
        mint::decimals = 0,
        mint::authority = signer,
        mint::freeze_authority = signer,
    )]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<CreateMintForTrack>) -> Result<()> {
    let track_mint = &mut ctx.accounts.track_mint;

    track_mint.track = ctx.accounts.track.key();
    track_mint.mint = ctx.accounts.mint.key();
    track_mint.owner = ctx.accounts.signer.key();

    Ok(())
}
