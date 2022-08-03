export type BlobType = typeof Blob;

export type RipDBServerClientOptions = {
  redisUrl: string;
  redisUsername?: string;
  redisPassword?: string;
  ipfsApiKey: string;
  ipfsGatewayBaseUrl?: string;
};

export type Wrapper = {
  cid: string;
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
