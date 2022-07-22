import { createClient, RedisClientType } from 'redis';

// NOTE: RIP = Redis IPFS

// TODO - replace this with a different ipfs client
import { NFTStorage } from 'nft.storage';

export type RedisIPFSOptions = {
  redisUrl: string;
  redisUsername?: string;
  redisPassword?: string;
  ipfsApiKey: string;
  ipfsGatewayBaseUrl?: string;
};

export type RIPWrapped<T> = {
  cid: string;
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

  private async uploadBlobToIPFSAsync<T>(dataToUpload: T) {
    const dataStr = JSON.stringify(dataToUpload);
    const blob = new Blob([dataStr], { type: 'application/json' });
    await this.ipfsClient.storeBlob(blob);
  }

  public async set<T>(key: string, value: T) {}

  public async get<T>(key: string): Promise<T> {
    return null as unknown as T;
  }

  public async purge(key: string) {}
}
