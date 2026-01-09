use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};

use crate::errors::ErrorCode;
use crate::state::{Listing, TrackMint};

#[derive(Accounts)]
pub struct CreateOrUpdateListing<'info> {
    #[account(
        constraint = track_mint.owner == seller.key() @ ErrorCode::Unauthorized
    )]
    pub track_mint: Account<'info, TrackMint>,

    #[account(address = track_mint.mint)]
    pub mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = seller,
        space = Listing::LEN,
        seeds = [b"listing", mint.key().as_ref()],
        bump
    )]
    pub listing: Account<'info, Listing>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = seller,
    )]
    pub seller_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = seller,
        associated_token::mint = mint,
        associated_token::authority = listing,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<CreateOrUpdateListing>,
    price_lamports: u64,
    deposit_amount: u64,
) -> Result<()> {
    require!(price_lamports > 0, ErrorCode::InvalidInputData);

    let listing = &mut ctx.accounts.listing;

    // If listing was previously initialized, enforce same seller.
    if listing.seller != Pubkey::default() {
        require!(listing.seller == ctx.accounts.seller.key(), ErrorCode::Unauthorized);
        require!(listing.mint == ctx.accounts.mint.key(), ErrorCode::InvalidInputData);
    } else {
        listing.mint = ctx.accounts.mint.key();
        listing.seller = ctx.accounts.seller.key();
        listing.remaining_amount = 0;
    }

    listing.price_lamports = price_lamports;
    listing.escrow_token_account = ctx.accounts.escrow_token_account.key();
    listing.active = true;

    if deposit_amount > 0 {
        transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.seller_token_account.to_account_info(),
                    to: ctx.accounts.escrow_token_account.to_account_info(),
                    authority: ctx.accounts.seller.to_account_info(),
                },
            ),
            deposit_amount,
        )?;
        listing.remaining_amount = listing
            .remaining_amount
            .checked_add(deposit_amount)
            .ok_or(ErrorCode::InvalidInputData)?;
    }

    Ok(())
}
