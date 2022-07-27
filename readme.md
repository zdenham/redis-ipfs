<p align="center">
  <img src="https://i.imgur.com/8KVnLX3m.png" title="Logo"/>

</p>
<p align="center">

  <b>
    🪦 RipDB 🪦
  </b>
  <br/>
  <i>A dead simple, snappy, decentralized JSON store perfect for fast moving web3 builders. It comes with a javascript client that feels like using localstorage, but has decentralization and encryption baked in.</i>
  <br/>
</p>

<p align="center">
  <img src="https://i.imgur.com/9UhC6cR.png" title="Logo"/>

</p>

## NOTE! ⚠️⚠️

Rip is a proof of concept and not production ready just yet, but I'd love to get it there. If you have any interest in using or contributing to RIP, please join our [discord](https://discord.gg/5HQ5V7d5jh).

[![discord](https://i.imgur.com/d1eTfYR.png)](https://discord.gg/5HQ5V7d5jh)

## Install

```sh
npm install --save rip-db-js

# or with yarn
yarn add rip-db-js
```

## Motivation

The SQL database is a powerful tool unrivaled for storing and querying relational data.

BUT, I believe most Dapps can live without a traditional SQL database in favor of something more light weight and decentralized.

Here are some problems with setting up a db for your dapp

1. There are already many great services which index blockchain data (why reinvent the wheel?)
2. DBs are expensive to host
3. Migrations are often a pain
4. They tend to be centralized / treasure trove for attackers
5. They usually don't give users provenance over their data
6. Encryption / key management is a pain

If a traditional db seems overkill for your use case, RIP might be for you. It gives you the speed of in memory cache (redis) but the decentralization of a global netowrk (Filecoin + IPFS), with some ther goodies like encryption.

### Example use case

In my own project (https://juicelabs.io), I needed some sort of store for a list of allowlist addresses (to calculate merkle proofs). Database seemed like a lot. I wanted something closer to an in memory store like Redis, but I wanted better redundancy / cold storage, and thus the idea for RIP came to be.

## Usage from browser js client

```javascript
// Setting up client
import { RipClient } from 'rip-db-js'
const ripServerUrl = '';

const rip = new RipClient({ ripServerUrl });

...

const myJson = { hello: 'RIP world' };
await rip.set('myJsonKey', myJson, { encrypt: false });

...

const { data } = await rip.get('myJsonKey');

...

// reclaims memory, but preserves data on IPFS
await rip.purge('myJsonKey');


```

☠️ simple or what?

## Running your own RipDb Instance

You will need to set up a redis instance first.

The fastest way to do this on your local is via homebrew.

```
> brew install redis
> brew services start redis
```

Under your environment variables you will need to set IPFS

- TODO (finish instructions lol).

## TODO

- [ ] Expose RIP client and Rip server as node_modules
- [ ] Implement other Redis operations e.g. scan on the front end client
- [ ] Maybe, build key -> data models in typescript, get graphql style automatic runtime validation during set based on the typescript models
      COOL: https://github.com/gcanti/io-ts
- [ ] Get fancier with user owned access control features
