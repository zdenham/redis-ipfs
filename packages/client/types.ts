// Client package types

export type RipDBClientOptions = {
  ripServerUrl: string;
  enableEncryption?: boolean;
};

export type SetOptions = {
  encrypt?: boolean;
  overrideEncryptionAuthSig?: AuthSig;
};

export type GetOptions = {
  overrideEncryptionAuthSig?: AuthSig;
};

export type EncryptedData = {
  ownerAddress: string;
  encryptedSymmetricKey: string;
  encryptedData: string;
};

export type AuthSig = {
  address: string;
  signature: string;
};

export type LitNodeClient = {
  connect: (opts?: any) => Promise<void>;
  saveEncryptionKey: (opts: any) => Promise<any>;
  getEncryptionKey: (opts: any) => Promise<any>;
};

export type RipServerFetchOptions = {
  path: string;
  method: 'GET' | 'POST';
  body?: Object;
};

export type Wrapper = {
  cid: string;
  setAtTimestamp?: number;
  duration?: number;
};

export type RipWrapped<T> = Wrapper & {
  data: T;
};

export type MaybeEncryptedData<T> = RipWrapped<EncryptedData> | RipWrapped<T>;
