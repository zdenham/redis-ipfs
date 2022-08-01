import type { RedisClientType } from 'redis';
import retry from 'async-retry';
import { NFTStorage } from 'nft.storage';
import type { CID } from 'nft.storage/src/lib/interface';
import { createClient } from 'redis';
import fetch from 'cross-fetch';

// This is the storage client to be used in a rip server instance
// TODO - replace nft.storage with a different ipfs client

type BlobType = typeof Blob;

export type RipDBStorageClientOptions = {
  redisUrl: string;
  redisUsername?: string;
  redisPassword?: string;
  ipfsApiKey: string;
  ipfsGatewayBaseUrl?: string;
};

export type Wrapper = {
  cid: CID | 'pending';
  setAtTimestamp?: number;
};

export type RipWrapped<T> = Wrapper & {
  data: T;
};

export type SetBody =
  | {
      encryptedSymmetricKey: string;
      encryptedData: string;
      ownerAddress: string;
    }
  | {};

export class RipDBStorageClient {
  private redisClient: RedisClientType;
  private ipfsClient: NFTStorage;
  private gatewayUrl: string;

  constructor({
    redisUrl,
    redisUsername,
    redisPassword,
    ipfsApiKey,
    ipfsGatewayBaseUrl,
  }: RipDBStorageClientOptions) {
    this.redisClient = createClient({
      url: redisUrl,
      username: redisUsername,
      password: redisPassword,
    });
    this.ipfsClient = new NFTStorage({ token: ipfsApiKey });
    this.gatewayUrl = ipfsGatewayBaseUrl || 'https://ipfs.io/ipfs';
    this.redisClient.connect();
  }

  private wrapData<T>(dataToWrap: T, config: Wrapper): RipWrapped<T> {
    return {
      ...config,
      setAtTimestamp: Date.now(),
      data: dataToWrap,
    };
  }

  private async _getBlob(): Promise<BlobType> {
    if (typeof window === 'undefined') {
      const { Blob: NodeBlob } = await import('node:buffer');

      return NodeBlob as BlobType;
    }

    return window.Blob;
  }

  private async _backUpDataToIPFSAsync<T>(
    key: string,
    value: T,
    timeStamp = 0
  ) {
    const dataStr = JSON.stringify(value);
    const Blob = await this._getBlob();
    const blob = new Blob([dataStr], { type: 'application/json' });
    // @ts-ignore
    const cid = await this.ipfsClient.storeBlob(blob);
    // If the setAtTimestamps differ then The data has been
    // updated since the backup started--skip setting the CID
    const curr = await this.get<T>(key);
    if (!curr || curr.setAtTimestamp !== timeStamp) {
      return;
    }
    // include the ipfs backup CID in the redis payload
    const backedUpData = {
      ...curr,
      cid,
    };
    await this.redisClient.set(key, JSON.stringify(backedUpData));
  }

  // fetch from IPFS with exponential backoff
  private async fetchJsonFromIPFS<T>(
    cid: CID | 'pending',
    retries = 5
  ): Promise<T> {
    if (cid === 'pending') {
      throw new Error('Cannot fetch from IPFS, backup is pending');
    }
    const awaited = await retry(
      async (bail) => {
        // if anything throws, we retry
        const res = await fetch(`${this.gatewayUrl}/${cid}`);
        if (403 === res.status) {
          bail(new Error('Unauthorized'));
          return;
        }
        const data = await res.json();
        return data as T;
      },
      {
        retries,
        factor: 2, // exponential
        maxTimeout: 5 * 60 * 1000, // 5 minutes
      }
    );
    if (!awaited) {
      throw new Error('Failed to fetch from IPFS');
    }
    return awaited;
  }

  public async set<T extends SetBody>(
    key: string,
    value: T
  ): Promise<RipWrapped<T>> {
    const wrapped = this.wrapData(value, { cid: 'pending' });
    await this.redisClient.set(key, JSON.stringify(wrapped));
    // asyncronously upload the data to decentralized storage in the background
    this._backUpDataToIPFSAsync(key, value, wrapped.setAtTimestamp);
    return wrapped;
  }

  public async get<T>(key: string): Promise<RipWrapped<T> | null> {
    const redisVal = await this.redisClient.get(key);
    if (!redisVal) {
      return null;
    }
    const wrapped = JSON.parse(redisVal) as RipWrapped<T>;
    if (wrapped.data) {
      return wrapped;
    }
    // data not available in the cache, fetch backup from IPFS
    const cid = wrapped.cid;
    const json = await this.fetchJsonFromIPFS<T>(cid);
    const nextWrapped = {
      ...wrapped,
      data: json,
    };
    // update the cache to include the fetched data (asyncrounously)
    this.redisClient.set(key, JSON.stringify(nextWrapped));
    return nextWrapped;
  }

  // purge is an explicit function to reclaim some redis space
  // in favor of the IPFS back up. Use this when data is no longer
  // "hot" and fast refresh
  public async purge(key: string) {
    const wrappedStr = await this.redisClient.get(key);
    if (!wrappedStr) {
      return;
    }
    const wrapped = JSON.parse(wrappedStr) as RipWrapped<any>;
    if (wrapped.cid === 'pending') {
      throw new Error('Cannot purge redis before IPFS backup is complete');
    }
    const nextWrapped = {
      ...wrapped,
      data: null,
    };
    await this.redisClient.set(key, JSON.stringify(nextWrapped));
  }
}
