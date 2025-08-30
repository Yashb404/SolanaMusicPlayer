# Music Player dApp

## Project Description
A decentralized music player built on Solana that allows users to upload tracks, create playlists, and manage their music library on-chain. This dApp leverages Solana's high-performance blockchain to provide a secure, decentralized platform for music enthusiasts to store metadata, organize their music collections, and share playlists while maintaining full ownership of their data.

**Solana Program ID:** B4RYieJzdH81NwbNoVkRgfZuYBBNbNPKjhPWZ1NxkDie
**Deployment Link:** https://mulana.vercel.app/

## Project Overview

### Description
The Music Player dApp is a comprehensive decentralized application that transforms how users interact with their music collections. Built on Solana's blockchain, it provides a secure, transparent, and user-owned platform for music metadata storage and playlist management. Unlike traditional centralized music platforms, this dApp ensures users maintain complete control over their music data, playlists, and listening preferences.

The core functionality revolves around creating a decentralized music ecosystem where:
- Users can upload track metadata (title, artist, genre) with IPFS-based audio file references
- Playlists are stored on-chain as immutable, verifiable collections
- All operations are transparent and auditable through blockchain transactions
- User data ownership is guaranteed through cryptographic signatures
- No central authority can censor or modify user content

### Key Features
The dApp provides a rich set of features that demonstrate advanced Solana development concepts:

- **Decentralized Track Management**: Upload and store track metadata on-chain with IPFS integration for audio files
- **Smart Playlist Creation**: Create, manage, and share playlists with deterministic on-chain storage
- **User Profile System**: Initialize and maintain user profiles with username and email verification
- **Advanced Playlist Operations**: Add and remove tracks from playlists with proper authorization checks
- **Real-time Blockchain Integration**: All operations are immediately reflected on the Solana blockchain
- **Secure Ownership Model**: Cryptographic verification ensures only authorized users can modify their content
- **Persistent Data Storage**: Music collections persist across sessions and are globally accessible
- **Rate Limiting Protection**: Built-in protection against RPC endpoint abuse with intelligent retry mechanisms

### How to Use the dApp
The dApp provides an intuitive user experience that abstracts away blockchain complexity:

1. **Connect Wallet**
   - Click the "Connect Wallet" button in the top-right corner
   - Select your preferred Solana wallet (Phantom, Solflare, etc.)
   - Approve the connection to enable dApp functionality

2. **Upload Music Tracks**
   - Click "Upload Track" button in the header
   - Fill in track details: Title, Artist, Genre
   - Provide IPFS CID for the audio file
   - Optionally add cover art IPFS CID
   - Submit transaction to store track metadata on-chain

3. **Create Playlists**
   - Use the sidebar to create new playlists
   - Provide playlist name and description
   - Each playlist gets a unique on-chain identifier
   - Playlists are automatically associated with your wallet

4. **Manage Music Library**
   - View all uploaded tracks in "Your Library"
   - Add tracks to playlists using the three-dot menu
   - Remove tracks from playlists as needed
   - Hide/restore tracks for better organization

5. **Play Music**
   - Click the play button on any track
   - Use the persistent bottom player bar for continuous playback
   - Navigate between tracks and playlists seamlessly

## Program Architecture
The Solana program is built using the Anchor framework and implements a sophisticated architecture for decentralized music management.

### PDA Usage
Program Derived Addresses (PDAs) are extensively used to create deterministic, user-specific account addresses that cannot be controlled by external private keys.

**PDAs Used:**
- **User Profile PDA**: `[b"user-profile", user_public_key]` - Creates unique user profile accounts for each wallet
- **Track PDA**: `[b"track", owner_public_key, track_id]` - Generates unique track accounts for each uploaded track
- **Playlist PDA**: `[b"playlist", owner_public_key, playlist_id]` - Creates unique playlist accounts for each user's playlists


### Program Instructions
The program implements five core instructions that provide comprehensive music management functionality:

**Instructions Implemented:**
- **`initialize_user`**: Creates user profile accounts with username and email validation
  - Validates input lengths against program constants
  - Initializes timestamps for audit trails
  - Creates user-specific PDA accounts

- **`upload_track`**: Stores track metadata on-chain with comprehensive validation
  - Validates title, artist, genre, and URI lengths
  - Generates unique track IDs using timestamps
  - Stores IPFS references for audio files
  - Maintains creation timestamps and ownership

- **`create_playlist`**: Initializes new playlist accounts with metadata
  - Validates playlist name and description lengths
  - Creates empty track arrays for future additions
  - Establishes ownership and creation timestamps
  - Uses deterministic playlist IDs

- **`add_track_to_playlist`**: Adds tracks to existing playlists with authorization
  - Verifies playlist ownership through `has_one` constraint
  - Prevents playlist overflow with maximum track limits
  - Updates modification timestamps
  - Maintains playlist integrity

- **`remove_track_from_playlist`**: Removes tracks from playlists with proper validation
  - Verifies track existence before removal
  - Updates modification timestamps
  - Maintains playlist consistency
  - Provides clear error messages for missing tracks

### Account Structure
The program defines three main account structures that form the foundation of the music management system:

```rust
#[account]
pub struct UserProfile {
    pub user: Pubkey,           // Wallet public key of the user
    pub username: String,        // User's chosen username
    pub email: String,          // User's email address
    pub created_at: i64,        // Unix timestamp of account creation
    pub updated_at: i64,        // Unix timestamp of last update
}

#[account]
pub struct Track {
    pub id: u64,                // Unique track identifier
    pub owner: Pubkey,          // Wallet public key of track owner
    pub title: String,          // Track title
    pub artist: String,         // Track artist
    pub genre: String,          // Musical genre
    pub uri: String,            // IPFS URI for audio file
    pub created_at: i64,        // Unix timestamp of track creation
}

#[account]
pub struct Playlist {
    pub id: u64,                // Unique playlist identifier
    pub owner: Pubkey,          // Wallet public key of playlist owner
    pub name: String,           // Playlist name
    pub description: String,    // Playlist description
    pub tracks: Vec<u64>,       // Array of track IDs in the playlist
    pub created_at: i64,        // Unix timestamp of playlist creation
    pub updated_at: i64,        // Unix timestamp of last modification
}
```

## Testing

### Test Coverage
Comprehensive testing approach covering happy paths, unhappy paths, and edge cases to ensure robust functionality and security. The test suite validates all program instructions, error conditions, and boundary cases to guarantee reliable operation.

**Happy Path Tests:**
- **User Profile Initialization**: Tests successful user profile creation with valid username and email, verifies account data persistence and timestamp accuracy
- **Track Upload**: Tests complete track upload with all required metadata (title, artist, genre, URI), validates on-chain storage and data integrity
- **Playlist Creation**: Tests playlist creation with name and description, ensures proper account initialization and metadata storage
- **Track Management**: Tests adding and removing tracks from playlists successfully, validates playlist state changes and track associations

**Unhappy Path Tests:**
- **Validation Errors**: Tests username length limits and empty field handling, ensures proper error codes and user feedback
- **Authorization Errors**: Tests access restrictions for playlist operations, verifies security constraints and ownership validation
- **State Errors**: Tests operations on invalid states (e.g., removing from empty playlist), validates error handling for edge cases

**Edge Case Tests:**
- **Boundary Values**: Tests reasonable length strings and boundary conditions, ensures program stability under extreme inputs
- **Special Characters**: Tests handling of special characters, emojis, and numbers in text fields, validates robust text processing

### Running Tests
```bash
#install node modules
npm install

# Run all tests
anchor test

# Run with verbose output
anchor test --verbose

# Run specific test file
anchor test tests/music_player.ts
```

### Test Results
The comprehensive test suite demonstrates:
- ✅ Proper account creation and state management across all instruction types
- ✅ Correct PDA derivation and usage for deterministic addressing
- ✅ Proper error handling and validation with appropriate error codes
- ✅ Security constraints enforcement through ownership verification
- ✅ Edge case handling for robust program operation
- ✅ Rate limiting protection and graceful degradation
- ✅ Transaction simulation and error logging for debugging

## Technical Implementation Details

### Frontend Architecture
- **React 18** with TypeScript for type-safe development
- **Tailwind CSS** for modern, responsive UI design
- **Solana Wallet Adapter** for seamless wallet integration
- **Anchor Client** for program interaction and transaction management
- **Vite** for fast development and optimized builds

### Blockchain Integration
- **Solana Devnet** for development and testing
- **Anchor Framework 0.31.1** for program development
- **Program Derived Addresses** for deterministic account creation
- **Cross-Program Invocation** for system program interactions
- **Transaction optimization** with skipPreflight and confirmed commitment

### Data Storage Strategy
- **On-chain metadata** for track and playlist information
- **IPFS integration** for decentralized audio file storage
- **Local storage caching** for UI state and cover art
- **Real-time blockchain queries** for up-to-date information

### Security Features
- **Ownership verification** through cryptographic signatures
- **Input validation** with length limits and format checking
- **Authorization checks** for all modification operations
- **Rate limiting** to prevent abuse and ensure stability

## Deployment Information

### Program Deployment
- **Network**: Solana Devnet
- **Program ID**: B4RYieJzdH81NwbNoVkRgfZuYBBNbNPKjhPWZ1NxkDie
- **Deployment Method**: Anchor CLI deployment
- **Build Optimization**: Release mode with size optimization

### Frontend Deployment
- **Platform**: Vercel 
- **Build Tool**: Vite with optimized production builds
- **Environment**: Production-ready with error handling and monitoring

## Additional Notes for Evaluators

I cannot state how much this project helped me in actually understanding how solana development works , I had never tried something like this before the Solana school and I am grateful for that. Understanding how a solana backend and frontend is connected , proper testing protocols , PDA and seeds were things that were foreign to me before this bootcamp and now I am going with alot of knowledge about these topics. 
I will keep on working on this project and turn it into a actual viable product by changing some functionalities . It will head into a direction of a platform where you can buy music and keep it in your profile.
