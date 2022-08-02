import type { RipWrapped } from './storageClient';
// @ts-ignore - TODO - declare types
import LitJsSdk from 'lit-js-sdk';

export class RipDBClient {
  get() {
    new LitJsSdk.LitNodeClient({
      debug: false,
      alertWhenUnauthorized: typeof window !== 'undefined',
    }) as unknown as LitNodeClient;
  }
  set() {}
}
