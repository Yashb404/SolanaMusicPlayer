use anchor_lang::prelude::*;

#[account]
pub struct TrackMint {
    pub track: Pubkey,
    pub mint: Pubkey,
    pub owner: Pubkey,
    
}

impl TrackMint {
    pub const LEN: usize = 8  // discriminator
        + 32                 // track
        + 32                 // mint
        + 32;                // owner
}
