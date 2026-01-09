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
    metadata_cid: String,
) -> Result<()> {
    require!(title.len() <= Track::MAX_TITLE_LEN, ErrorCode::TrackTitleTooLong);
    require!(
        metadata_cid.len() <= Track::MAX_METADATA_CID_LEN,
        ErrorCode::InvalidInputData
    );

    let track = &mut ctx.accounts.track;
    let clock = Clock::get()?;

    track.id = track_id;
    track.owner = ctx.accounts.signer.key();
    track.title = title;
    track.metadata_cid = metadata_cid;
    track.created_at = clock.unix_timestamp;

    Ok(())
}
