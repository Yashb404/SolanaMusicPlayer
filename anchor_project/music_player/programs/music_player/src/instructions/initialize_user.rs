use anchor_lang::prelude::*;

use crate::state::*;
use crate::errors::MusicPlayerError;


pub fn Initialize_user(
    ctx: Context<InitializeUser>,
)->Result<()>{

}

#[derive(Accounts)]
#[instructions(topic:String)]
pub struct InitializeUser<'info>{

}
