use anchor_lang::prelude::*;
use anchor_spl::token::{mint_to, Mint, MintTo, Token, TokenAccount};

use crate::errors::ErrorCode;
use crate::state::{Track, TrackMint};

#[derive(Accounts)]
pub struct MintMore<'info> {
    #[account(
        constraint = track.owner == signer.key() @ ErrorCode::Unauthorized
    )]
    pub track: Account<'info, Track>,

    #[account(
        constraint = track_mint.track == track.key() @ ErrorCode::InvalidInputData,
        constraint = track_mint.owner == signer.key() @ ErrorCode::Unauthorized,
        seeds = [b"track-mint", track.key().as_ref()],
        bump,
    )]
    pub track_mint: Account<'info, TrackMint>,

    #[account(
        mut,
        address = track_mint.mint
    )]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub to_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<MintMore>, amount: u64) -> Result<()> {
    require!(amount > 0, ErrorCode::InvalidInputData);

    mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.to_token_account.to_account_info(),
                authority: ctx.accounts.signer.to_account_info(),
            },
        ),
        amount,
    )?;

    Ok(())
}
