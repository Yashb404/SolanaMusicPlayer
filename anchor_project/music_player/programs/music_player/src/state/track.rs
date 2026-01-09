use anchor_lang::prelude::*;

#[account]
pub struct Track {
    pub id: u64,                  
    pub owner: Pubkey,
    pub title: String,
    pub metadata_cid: String,
    pub created_at: i64,
}

impl Track {
    pub const MAX_TITLE_LEN: usize = 64;
    // Store CID only (not a gateway URL) to keep on-chain data small.
    pub const MAX_METADATA_CID_LEN: usize = 128;

    pub const LEN: usize = 8       // discriminator
        + 8                        // id
        + 32                       // owner
        + 4 + Self::MAX_TITLE_LEN
        + 4 + Self::MAX_METADATA_CID_LEN
        + 8;                       // created_at
}
