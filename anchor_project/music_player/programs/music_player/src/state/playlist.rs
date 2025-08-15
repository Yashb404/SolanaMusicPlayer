use anchor_lang::prelude::*;

#[account]
pub struct Playlist {
    pub id: u64,
    pub owner: Pubkey,
    pub name: String,
    pub description: String,
    pub tracks: Vec<u64>,
    pub created_at: i64,
    pub updated_at: i64,
}

impl Playlist {
    pub const MAX_NAME_LEN: usize = 64;
    pub const MAX_DESC_LEN: usize = 128;
    pub const MAX_TRACKS: usize = 50;

    pub const LEN: usize = 8
        + 8
        + 32
        + 4 + Self::MAX_NAME_LEN
        + 4 + Self::MAX_DESC_LEN
        + 4 + (Self::MAX_TRACKS * 32)
        + 8
        + 8;
}
