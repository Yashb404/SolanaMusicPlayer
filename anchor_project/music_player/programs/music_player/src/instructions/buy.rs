use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};

use crate::errors::ErrorCode;
use crate::state::Listing;

#[derive(Accounts)]
pub struct Buy<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(address = listing.mint)]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [b"listing", mint.key().as_ref()],
        bump,
    )]
    pub listing: Account<'info, Listing>,

    /// Receives SOL. Must match listing.seller.
    #[account(mut, address = listing.seller)]
    pub seller: SystemAccount<'info>,

    #[account(
        mut,
        address = listing.escrow_token_account,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = mint,
        associated_token::authority = buyer,
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Buy>, amount: u64) -> Result<()> {
    require!(amount > 0, ErrorCode::InvalidInputData);

    let listing = &mut ctx.accounts.listing;
    require!(listing.active, ErrorCode::ListingInactive);
    require!(listing.remaining_amount >= amount, ErrorCode::InsufficientListingSupply);

    let total_price = listing
        .price_lamports
        .checked_mul(amount)
        .ok_or(ErrorCode::InvalidInputData)?;

    // 1) Transfer SOL from buyer to seller
    invoke(
        &system_instruction::transfer(
            &ctx.accounts.buyer.key(),
            &ctx.accounts.seller.key(),
            total_price,
        ),
        &[
            ctx.accounts.buyer.to_account_info(),
            ctx.accounts.seller.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    // 2) Transfer tokens from escrow to buyer ATA (signed by listing PDA)
    let signer_seeds: &[&[u8]] = &[
        b"listing",
        ctx.accounts.mint.key().as_ref(),
        &[ctx.bumps.listing],
    ];

    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.buyer_token_account.to_account_info(),
                authority: ctx.accounts.listing.to_account_info(),
            },
            &[signer_seeds],
        ),
        amount,
    )?;

    listing.remaining_amount = listing
        .remaining_amount
        .checked_sub(amount)
        .ok_or(ErrorCode::InvalidInputData)?;

    if listing.remaining_amount == 0 {
        listing.active = false;
    }

    Ok(())
}
