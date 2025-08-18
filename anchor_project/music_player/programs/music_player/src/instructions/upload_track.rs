use anchor_lang::prelude::*;
use crate::state::track::Track;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(track_id: u64)]
pub struct UploadTrack<'info> {
    #[account(
        init,
        payer = signer,
        space = Track::LEN,
        seeds = [b"track", signer.key().as_ref(), &track_id.to_le_bytes()],
        bump
    )]
    pub track: Account<'info, Track>,

    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>, 
}


pub fn handler(
    ctx: Context<UploadTrack>,
    track_id: u64,
    title: String,
    artist: String,
    genre: String,
    uri: String,
) -> Result<()> {
    require!(title.len() <= Track::MAX_TITLE_LEN, ErrorCode::TrackTitleTooLong);
    require!(artist.len() <= Track::MAX_ARTIST_LEN, ErrorCode::ArtistTooLong);
    require!(genre.len() <= Track::MAX_GENRE_LEN, ErrorCode::GenreTooLong);
    require!(uri.len() <= Track::MAX_URI_LEN, ErrorCode::InvalidInputData);

    let track = &mut ctx.accounts.track;
    let clock = Clock::get()?;

    track.id = track_id;
    track.owner = ctx.accounts.signer.key();
    track.title = title;
    track.artist = artist;
    track.genre = genre;
    track.uri = uri;
    track.created_at = clock.unix_timestamp;

    Ok(())
}
