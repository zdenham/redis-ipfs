import type { RipWrapped } from './storageClient';
// @ts-ignore - TODO - declare types
import LitJsSdk from 'lit-js-sdk';

/**
 * This client is meant to be isomorphic.
 * it can be used on your front end web app
 * or on a node server if you so choose!
 *
 * NOTE: for encryption to work in a server
 * You will need to pass user's auth signatures
 * to "overrideEncryptionAuthSig"
 */

export type RipDBClientOptions = {
  ripServerUrl: string;
};

export type SetOptions = {
  encrypted?: boolean;
  overrideEncryptionAuthSig?: AuthSig;
};

export type GetOptions = {
  overrideEncryptionAuthSig?: AuthSig;
};

type EncryptedData = {
  ownerAddress: string;
  encryptedSymmetricKey: string;
  encryptedData: string;
};

type AuthSig = {
  address: string;
  signature: string;
};

type LitNodeClient = {
  connect: (opts?: any) => Promise<void>;
  saveEncryptionKey: (opts: any) => Promise<any>;
  getEncryptionKey: (opts: any) => Promise<any>;
};

type RipServerFetchOptions = {
  path: string;
  method: 'GET' | 'POST';
  body?: Object;
};

type MaybeEncryptedData<T> = RipWrapped<EncryptedData> | RipWrapped<T>;

export class RipDBClient {
  private ripServerUrl: string;
  private encryptionAuthSig: AuthSig | undefined;
  private litNodeClient: LitNodeClient;

  constructor({ ripServerUrl }: RipDBClientOptions) {
    this.ripServerUrl = ripServerUrl;

    this.litNodeClient = new LitJsSdk.LitNodeClient({
      debug: false,
      alertWhenUnauthorized: typeof window !== 'undefined',
    }) as unknown as LitNodeClient;

    this._init();
  }

  private async _init() {
    await this.litNodeClient.connect({ debug: false });
  }

  public async set<T>(key: string, value: T, opts?: SetOptions): Promise<void> {
    const dataToSet = opts?.encrypted
      ? await this._encryptData(value, opts)
      : value;

    await this._ripServerFetch({
      path: `set/${key}`,
      method: `POST`,
      body: dataToSet,
    });
  }

  public async get<T extends Object>(
    key: string,
    opts?: GetOptions
  ): Promise<RipWrapped<T>> {
    const rawData = await this._ripServerFetch<MaybeEncryptedData<T>>({
      path: `get/${key}`,
      method: 'GET',
    });

    if (this._isEncryptedData<T>(rawData)) {
      const decryptedData = await this._decryptData<T>(rawData.data, opts);
      return {
        ...rawData,
        data: decryptedData,
      };
    }

    return rawData;
  }

  // TODO - add auth to this endpoint
  // and make it available in the client
  // only an "owner" address should be able
  // to purge the cache for nw
  public async purge(key: string, authSig: AuthSig) {
    console.log('PURGE NOT IMPLEMENTED: ', key, authSig);

    // Keep commented
    // await this._ripServerFetch({
    //   path: `purge/${key}`,
    //   method: 'POST',
    // });
  }

  public async signMessageForEncryption() {
    if (typeof window === 'undefined') {
      throw new Error('Encryption messages can only be signed in the browser');
    }
    this.encryptionAuthSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: 'ethereum',
    });
    return this.encryptionAuthSig;
  }

  public getEncryptionAuthSignature() {
    return this.encryptionAuthSig;
  }

  private async _ripServerFetch<T>({
    path,
    method,
    body,
  }: RipServerFetchOptions): Promise<T> {
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    };

    const res = await fetch(`${this.ripServerUrl}/${path}`, opts);

    return await res.json();
  }

  private async _encryptData<T extends Object>(
    dataToEncrypt: T,
    opts: SetOptions
  ): Promise<EncryptedData> {
    const stringified = JSON.stringify(dataToEncrypt);
    const resp = await LitJsSdk.encryptString(stringified);
    if (!resp) {
      throw new Error('Failed to encrypt');
    }
    const { encryptedString, symmetricKey } = resp;
    const authSig =
      opts.overrideEncryptionAuthSig ||
      this.encryptionAuthSig ||
      (await this.signMessageForEncryption());

    if (!authSig) {
      throw new Error('Auth sig is not defined');
    }

    // gate it to the connected user
    const accessControlConditions = [
      {
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: '',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '=',
          value: authSig.address,
        },
      },
    ];
    const encryptedSymmetricKey = await this.litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain: 'ethereum',
    });
    const encryptedData = await this._getDataUrl(encryptedString);
    return {
      ownerAddress: authSig.address,
      encryptedSymmetricKey: LitJsSdk.uint8arrayToString(
        encryptedSymmetricKey,
        'base16'
      ),
      encryptedData,
    };
  }

  private async _decryptData<T extends Object>(
    dataToDecrypt: EncryptedData,
    opts?: GetOptions
  ): Promise<T> {
    const { encryptedData, encryptedSymmetricKey, ownerAddress } =
      dataToDecrypt;

    const accessControlConditions = [
      {
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: '',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '=',
          value: ownerAddress,
        },
      },
    ];

    const authSig =
      opts?.overrideEncryptionAuthSig ||
      this.encryptionAuthSig ||
      (await this.signMessageForEncryption());

    const symmetricKey = await this.litNodeClient.getEncryptionKey({
      accessControlConditions,
      toDecrypt: encryptedSymmetricKey,
      chain: 'ethereum',
      authSig,
    });

    const blob = await (await fetch(encryptedData)).blob();
    const decryptedString = await LitJsSdk.decryptString(blob, symmetricKey);

    if (!decryptedString) {
      throw new Error('Failed to decrypt');
    }

    return JSON.parse(decryptedString);
  }

  private _isEncryptedData<T>(
    maybeEncryptedData: MaybeEncryptedData<T>
  ): maybeEncryptedData is RipWrapped<EncryptedData> {
    return !!(maybeEncryptedData.data as EncryptedData).encryptedSymmetricKey;
  }

  private _getDataUrl(blob: Blob) {
    return new Promise<string>((resolve) => {
      const fr = new FileReader();

      fr.addEventListener(
        'load',
        function () {
          // convert image file to base64 string
          resolve(fr.result?.toString() || '');
        },
        false
      );

      fr.readAsDataURL(blob);
    });
  }
}
