use anchor_lang::prelude::*;

#[account]
pub struct Track {
    pub owner: Pubkey,          // Track uploader
    pub title: String,
    pub artist: String,
    pub genre: String,
    pub uri: String,            // IPFS/Arweave hash
    pub created_at: i64,
}

impl Track {
    pub const MAX_TITLE_LEN: usize = 64;
    pub const MAX_ARTIST_LEN: usize = 64;
    pub const MAX_GENRE_LEN: usize = 32;
    pub const MAX_URI_LEN: usize = 200;

    pub const LEN: usize = 8                     // discriminator
        + 32                                     // owner
        + 4 + Self::MAX_TITLE_LEN                // title field
        + 4 + Self::MAX_ARTIST_LEN               // artist
        + 4 + Self::MAX_GENRE_LEN                // genre
        + 4 + Self::MAX_URI_LEN                  // uri
        + 8;                                     // created_at timestamp
}
