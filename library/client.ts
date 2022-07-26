import type { RipWrapped } from './index';
import fetch from 'cross-fetch';
// @ts-ignore - TODO - declare types
import LitJsSdk from 'lit-js-sdk';

/**
 * This client is meant to be isomorphic
 * it can be used on your front end web app
 * or on a node server if you so choose!
 */

export type RipDBClientOptions = {
  ripServerUrl: string;
};

export type SetOptions = {
  encrypted?: boolean;
  overrideEncryptionAuthSig?: LitAuthSig;
};

export type GetOptions = {
  overrideEncryptionAuthSig?: LitAuthSig;
};

type EncryptedData = {
  ownerAddress: string;
  encryptedSymmetricKey: string;
  encryptedData: string;
};

type LitAuthSig = {
  address: string;
  signature: string;
};

type LitNodeClient = {
  connect: () => Promise<void>;
  saveEncryptionKey: (opts: any) => Promise<any>;
  getEncryptionKey: (opts: any) => Promise<any>;
};

type RipServerFetchOptions = {
  path: string;
  method: 'GET' | 'POST';
  body?: Object;
};

export class RipDBClient {
  private ripServerUrl: string;
  private encryptionAuthSig: LitAuthSig;
  private litNodeClient: LitNodeClient;

  constructor({ ripServerUrl }: RipDBClientOptions) {
    this.ripServerUrl = ripServerUrl;
  }

  private async _init() {
    this.litNodeClient = new LitJsSdk.LitNodeClient({
      alertWhenUnauthorized: typeof window !== 'undefined',
    });
    await this.litNodeClient.connect();
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

  public async signMessageForEncryption() {
    if (typeof window === 'undefined') {
      throw new Error('Encryption messages can only be signed in the browser');
    }

    this.encryptionAuthSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: 'ethereum',
    });

    return this.encryptionAuthSig;
  }

  public async set<T>(key: string, value: T, opts?: SetOptions): Promise<void> {
    const dataToSet = opts?.encrypted ? this._encryptData(value, opts) : value;

    await this._ripServerFetch({
      path: `/set/${key}`,
      method: `POST`,
      body: dataToSet,
    });
  }

  public async get<T>(key: string, opts?: GetOptions): Promise<RipWrapped<T>> {
    const rawData = await this._ripServerFetch<RipWrapped<EncryptedData | T>>({
      path: `/get/${key}`,
      method: 'GET',
    });

    // @ts-ignore
    const isEncrypted = rawData.data?.encryptedSymmetricKey;
    if (isEncrypted) {
      const decryptedData = await this._decryptData(rawData.data, opts);
    }
  }

  runGet = async () => {
    startLoadingButton('runGetButton');
    const key = document.getElementById('getKey').value;

    const resPromise = fetch(`${baseUrl}/get/${key}`);
    const res2Promise = fetch(`${baseUrl}/ipfs/get/${key}`);

    const res = await resPromise;
    const json = await res.json();

    document.getElementById('getBenchmark').children[0].innerText =
      json.duration.toString();

    document.getElementById('getValue').value = JSON.stringify(
      json.wrappedData,
      null,
      2
    );

    const res2 = await res2Promise;
    const json2 = await res2.json();

    document.getElementById('getBenchmarkIPFS').children[0].innerText =
      json2.duration.toString();

    stopLoadingButton('runGetButton');
  };

  runPurge = async () => {
    const key = document.getElementById('purgeKey').value;
    const res = await fetch(`${baseUrl}/purge/${key}`, { method: 'POST' });

    const getDisplay = document.getElementById('getValue');

    if (getDisplay.value.length > 0) {
      const next = { ...JSON.parse(getDisplay.value), data: '' };
      getDisplay.value = JSON.stringify(next, null, 2);
    }
  };

  private async _encryptData<T extends Object>(
    dataToEncrypt: T,
    opts: SetOptions
  ): Promise<EncryptedData> {
    const stringified = JSON.stringify(dataToEncrypt);
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
      stringified
    );

    const authSig =
      opts.overrideEncryptionAuthSig ||
      this.encryptionAuthSig ||
      (await this.signMessageForEncryption());

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
    { overrideEncryptionAuthSig }: GetOptions
  ) {
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
      overrideEncryptionAuthSig ||
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

    return JSON.parse(decryptedString);
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
