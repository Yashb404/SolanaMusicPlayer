use anchor_lang::prelude::*;

#[account]
pub struct Listing {
    pub mint: Pubkey,
    pub seller: Pubkey,
    pub price_lamports: u64,
    pub escrow_token_account: Pubkey,
    pub remaining_amount: u64,
    pub active: bool,
}

impl Listing {
    pub const LEN: usize = 8  // discriminator
        + 32                 // mint
        + 32                 // seller
        + 8                  // price_lamports
        + 32                 // escrow_token_account
        + 8                  // remaining_amount
        + 1;                 // active
}
