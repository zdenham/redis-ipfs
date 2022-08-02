// import type { RedisClientType } from 'redis';
// import retry from 'async-retry';
// import { NFTStorage } from 'nft.storage';
// import type { CID } from 'nft.storage/src/lib/interface';
// import { createClient } from 'redis';
// import fetch from 'cross-fetch';

// This is the storage client to be used in a rip server instance
// TODO - replace nft.storage with a different ipfs client

// type BlobType = typeof Blob;

export class RipDBStorageClient {
  get() {
    console.log('GET!');
  }
  set() {
    console.log('SET!');
  }
}
