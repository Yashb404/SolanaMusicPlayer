/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/music_player.json`.
 */
export type MusicPlayer = {
  "address": "B4RYieJzdH81NwbNoVkRgfZuYBBNbNPKjhPWZ1NxkDie",
  "metadata": {
    "name": "musicPlayer",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addTrackToPlaylist",
      "discriminator": [
        40,
        122,
        120,
        88,
        218,
        58,
        138,
        92
      ],
      "accounts": [
        {
          "name": "playlist",
          "writable": true
        },
        {
          "name": "track"
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "playlist"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "createPlaylist",
      "discriminator": [
        12,
        221,
        173,
        119,
        26,
        182,
        58,
        49
      ],
      "accounts": [
        {
          "name": "playlist",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  108,
                  105,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "arg",
                "path": "playlistId"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "playlistId",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeUser",
      "discriminator": [
        111,
        17,
        185,
        250,
        60,
        122,
        38,
        254
      ],
      "accounts": [
        {
          "name": "userProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  45,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        },
        {
          "name": "email",
          "type": "string"
        }
      ]
    },
    {
      "name": "removeTrackFromPlaylist",
      "discriminator": [
        246,
        227,
        91,
        80,
        71,
        221,
        68,
        3
      ],
      "accounts": [
        {
          "name": "playlist",
          "writable": true
        },
        {
          "name": "track"
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "playlist"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "uploadTrack",
      "discriminator": [
        166,
        134,
        174,
        253,
        216,
        183,
        206,
        193
      ],
      "accounts": [
        {
          "name": "track",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  99,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "arg",
                "path": "trackId"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "trackId",
          "type": "u64"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "artist",
          "type": "string"
        },
        {
          "name": "genre",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "playlist",
      "discriminator": [
        132,
        146,
        3,
        250,
        182,
        54,
        96,
        213
      ]
    },
    {
      "name": "track",
      "discriminator": [
        148,
        45,
        9,
        235,
        14,
        15,
        36,
        159
      ]
    },
    {
      "name": "userProfile",
      "discriminator": [
        32,
        37,
        119,
        205,
        179,
        180,
        13,
        194
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "Unauthorized action"
    },
    {
      "code": 6001,
      "name": "playlistNotFound",
      "msg": "Playlist not found"
    },
    {
      "code": 6002,
      "name": "trackNotFound",
      "msg": "Track not found"
    },
    {
      "code": 6003,
      "name": "userProfileNotFound",
      "msg": "User profile not found"
    },
    {
      "code": 6004,
      "name": "invalidInputData",
      "msg": "Invalid input data"
    },
    {
      "code": 6005,
      "name": "insufficientFunds",
      "msg": "Insufficient funds for transaction"
    },
    {
      "code": 6006,
      "name": "operationNotSupported",
      "msg": "Operation not supported"
    },
    {
      "code": 6007,
      "name": "usernameTooLong",
      "msg": "Username exceeds maximum allowed length"
    },
    {
      "code": 6008,
      "name": "emailTooLong",
      "msg": "Email exceeds maximum allowed length"
    },
    {
      "code": 6009,
      "name": "trackTitleTooLong",
      "msg": "Track title exceeds maximum allowed length"
    },
    {
      "code": 6010,
      "name": "artistTooLong",
      "msg": "Artist name exceeds maximum allowed length"
    },
    {
      "code": 6011,
      "name": "genreTooLong",
      "msg": "Genre exceeds maximum allowed length"
    }
  ],
  "types": [
    {
      "name": "playlist",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "tracks",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "track",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "artist",
            "type": "string"
          },
          {
            "name": "genre",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "userProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "username",
            "type": "string"
          },
          {
            "name": "email",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
