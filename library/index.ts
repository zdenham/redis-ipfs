import { createClient, RedisClientType } from 'redis';

// NOTE: RIP = Redis IPFS

// TODO - replace this with a different ipfs client
import { NFTStorage } from 'nft.storage';
import { CID } from 'nft.storage/src/lib/interface';

export type RedisIPFSOptions = {
  redisUrl: string;
  redisUsername?: string;
  redisPassword?: string;
  ipfsApiKey: string;
  ipfsGatewayBaseUrl?: string;
};

type Wrapper = {
  cid: CID;
};

export type RIPWrapped<T> = Wrapper & {
  data: T;
};

export class RedisIpfsClient {
  private redisClient: RedisClientType;
  private ipfsClient: NFTStorage;
  private gatewayUrl: string;

  constructor({
    redisUrl,
    redisUsername,
    redisPassword,
    ipfsApiKey,
    ipfsGatewayBaseUrl,
  }: RedisIPFSOptions) {
    this.redisClient = createClient({
      url: redisUrl,
      username: redisUsername,
      password: redisPassword,
    });
    this.ipfsClient = new NFTStorage({ token: ipfsApiKey });
    this.gatewayUrl = ipfsGatewayBaseUrl || 'https://ipfs.io/ipfs/';
  }

  private wrapAndStringifyData<T>(dataToWrap: T, config: Wrapper): string {
    return JSON.stringify({
      ...config,
      data: dataToWrap,
    });
  }

  private async _uploadBlobToIPFSAsync<T>(blob: Blob) {
    const cid = await this.ipfsClient.storeBlob(blob);
  }

  public async set<T>(key: string, value: T) {
    const dataStr = JSON.stringify(value);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const { cid } = await NFTStorage.encodeBlob(blob);
    this._uploadBlobToIPFSAsync(blob);
    const wrapped = this.wrapAndStringifyData(value, { cid });
    await this.redisClient.set(key, wrapped);
  }

  public async get<T>(key: string): Promise<T> {
    return null as unknown as T;
  }

  public async purge(key: string) {}
}
