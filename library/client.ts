/**
 * This client is meant to be isomorphic
 * it can be used on your front end web app
 * or on a node server if you so choose!
 */

export type RipDBClientOptions = {
  ripServerUrl: string;
  // TODO - what other config options might we want here?
};

type LitAuthSig = {
  address: string;
  signature: string;
};

export class RipDBClient {
  private ripServerUrl: string;
  private encryptionAuthSig: LitAuthSig;

  constructor({ ripServerUrl }: RipDBClientOptions) {
    this.ripServerUrl = ripServerUrl;
  }
}
