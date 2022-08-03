import fetch from 'isomorphic-unfetch';
import retry from 'async-retry';
import type {
  RipWrapped,
  AuthSig,
  LitNodeClient,
  RipDBClientOptions,
  SetOptions,
  GetOptions,
  MaybeEncryptedData,
  EncryptedData,
  RipServerFetchOptions,
} from './types';

/**
 * This client is meant to be isomorphic.
 * it can be used on your front end web app
 * or on a node server if you so choose!
 *
 * NOTE: for encryption to work in a server
 * You will need to pass user's auth signatures
 * to "overrideEncryptionAuthSig"
 */

export class RipDBClient {
  private ripServerUrl: string;
  private encryptionAuthSig: AuthSig | undefined;
  private litNodeClient: LitNodeClient | undefined;
  private litJsSdk: any;

  constructor({ ripServerUrl, enableEncryption }: RipDBClientOptions) {
    this.ripServerUrl = ripServerUrl;

    if (enableEncryption) {
      this._initEncryption();
    }
  }

  public async set<T>(
    key: string,
    value: T,
    opts?: SetOptions
  ): Promise<MaybeEncryptedData<T>> {
    const dataToSet = opts?.encrypt
      ? await this._encryptData(value, opts)
      : value;

    return await this._ripServerFetch<MaybeEncryptedData<T>>({
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

  public async purge(key: string, authSig: AuthSig) {
    await this._ripServerFetch({
      path: `purge/${key}`,
      method: 'POST',
    });
  }

  public async signMessageForEncryption() {
    if (typeof window === 'undefined') {
      throw new Error('Encryption messages can only be signed in the browser');
    }
    this.encryptionAuthSig = await this.litJsSdk.checkAndSignAuthMessage({
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

  private async _initEncryption() {
    this.litJsSdk = await this._getLitSdkWithRetry();
    this.litNodeClient = new this.litJsSdk.LitNodeClient({
      debug: true,
      alertWhenUnauthorized: typeof window !== 'undefined',
    }) as unknown as LitNodeClient;

    await this.litNodeClient.connect({ debug: true });
  }

  private async _getLitSdkWithRetry() {
    // polyfill hack for lit sdk to work in browser
    if (typeof window !== 'undefined') {
      window.global = globalThis;
    }

    const sdk = await retry(
      async () => {
        // @ts-ignore return the lit instance if it is defined on the client
        if (typeof window !== 'undefined' && window.LitJsSdk) {
          // @ts-ignore
          return window.LitJsSdk;
        }

        // @ts-ignore - TODO - declare types
        const { default: LitJsSdk } = await import('lit-js-sdk');
        return LitJsSdk;
      },
      {
        retries: 5,
        factor: 2, // exponential
        maxTimeout: 5 * 60 * 1000, // 5 minutes
      }
    );

    if (!sdk) {
      throw new Error(
        'Failed to initialize encryption - lit sdk may not be installed'
      );
    }

    return sdk;
  }

  private async _encryptData<T extends Object>(
    dataToEncrypt: T,
    opts: SetOptions
  ): Promise<EncryptedData> {
    if (!this.litJsSdk || !this.litNodeClient) {
      throw new Error('Encryption not initialized');
    }

    const stringified = JSON.stringify(dataToEncrypt);
    const resp = await this.litJsSdk.encryptString(stringified);
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
      encryptedSymmetricKey: this.litJsSdk.uint8arrayToString(
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
    if (!this.litJsSdk || !this.litNodeClient) {
      throw new Error('Encryption not initialized');
    }

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
    const decryptedString = await this.litJsSdk.decryptString(
      blob,
      symmetricKey
    );

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
