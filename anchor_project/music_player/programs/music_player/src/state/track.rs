use anchor_lang::prelude::*;

#[account]
pub struct Track {
    pub id: u64,                  
    pub owner: Pubkey,
    pub title: String,
    pub uri: String,
    pub created_at: i64,
}

impl Track {
    pub const MAX_TITLE_LEN: usize = 64;
    pub const MAX_URI_LEN: usize = 200;

    pub const LEN: usize = 8       // discriminator
        + 8                        // id
        + 32                       // owner
        + 4 + Self::MAX_TITLE_LEN
        + 4 + Self::MAX_URI_LEN
        + 8;                       // created_at
}
