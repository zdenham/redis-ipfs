<p align="center">
  <img src="https://i.imgur.com/8KVnLX3m.png" title="Logo"/>
</p>
<p align="center">

  <b style="font-size: 40px;">
    🪦 RipDB 🪦
  </b>
  <br/>
  A snappy, decentralized JSON store perfect for fast moving web3 builders. <br/> <a href="https;">Redis</a> + <a href="https://ipfs.io/" target="_blank">IPFS</a> = RIP = 😍
</p>

# Install

### With a Package Manager (browser or node.js)

```sh
npm install --save @rip-db/client

# or with yarn
yarn add @rip-db/client
```

### With a Script Tag

```html
<script type="module">
  import { RipDBClient } from 'https://rip-db.storage.googleapis.com/rip-client.es-browser1.0.12.js';

  const ripServerUrl = ...

  ... see quick start guide below
</script>
```

# Quick Start

The quickest way to get started testing out rip-db is with the rip sandbox server. If you want to run a production instance of rip, see the [running your own server section](https://github.com/zdenham/redis-ipfs#running-your-own-ripdb-server).

```javascript
import { RipDBClient } from '@rip-db/client';

// Quickstart guide here
const ripServerUrl = 'https://rip-sandbox.onrender.com';

const rip = new RipClient({ ripServerUrl });

...

type MyJsonType = { hello: string; };

const myJson: MyJsonType = { hello: 'RIP world' };
await rip.set('myJsonKey', myJson, { encrypt: false });

...

const { data } = await rip.get<MyJsonType>('myJsonKey');

...

// reclaims memory, but preserves data on IPFS
await rip.purge('myJsonKey');

```

☠️ simple or what?

# Speed

<p align="center">
  <img src="https://i.imgur.com/9UhC6cR.png" title="Logo"/>
</p>

# Motivation

The SQL database is a powerful tool unrivaled for storing and querying relational data.

**BUT**, I believe most dapps can live without a traditional SQL database in favor of something more light weight and decentralized.

Here are some problems with setting up a db for your dapp

1. There are already many great services which index blockchain data (why reinvent the wheel?)
2. DBs are expensive to host
3. Migrations are often a pain
4. They tend to be centralized / treasure trove for attackers
5. They usually don't give users provenance over their data
6. Encryption / key management is a pain

Many web3 developers choose to store their data as JSON directly on IPFS rather than a traditional DB, but IPFS upload times can be slow and gateway timeouts are brutal.

If a traditional db seems overkill for your use case, and interacting directly with IPFS seems a bit too slow, RIP might be for you.

It gives you the speed of in memory cache (redis) but the decentralization of a global network (Filecoin + IPFS), with some ther goodies like encryption.

# Running your own Rip Server

For now, if you want to use rip in production, you will need to run your own rip server instance.

**⚠️⚠️ !! We can help you get a server instance up and running !! ⚠️⚠️**

If you would like help from the team behind rip-db getting a production instance up and running, please join our [discord](https://discord.gg/5HQ5V7d5jh)

[![discord](https://i.imgur.com/d1eTfYR.png)](https://discord.gg/5HQ5V7d5jh)

### Instructions for hosting Rip Server

If you want to run a rip instance on your own follow the below instructions

#### Prep

1. Install and run redis (documentation [here](https://redis.io/docs/getting-started). You can run on your local or a cloud service of your choice.
2. Acquire an NFT Storage API Key (found [here](https://nft.storage/manage))
3. Clone the repo `git clone https://github.com/zdenham/redis-ipfs.git`

#### Install Dependencies

```ssh
> yarn install
> cd server
> yarn install
```

#### Set Environment Variables:

**NOTE:** you can see the redis URI syntax [here](https://github.com/lettuce-io/lettuce-core/wiki/Redis-URI-and-connection-details)

Under `/server` directory if you are using a .env file.

```
REDIS_URL=redis://[[username:]password@]host[:port][/database]
IPFS_KEY=[YOUR_NFT STORAGE_KEY]
```

Under your environment variables you will need to set IPFS

#### Start The Server

```ssh
> yarn start
```

#### Point Your Rip Client to the Server

Once your server is live, you can point your rip client to the server by initializing it with `ripServerUrl` that points to your server instance url.

# Contributing

If you have any interest in contributing to RIP, please join our [discord](https://discord.gg/5HQ5V7d5jh) and we can help you get started with a starter task. Also feel free to contact me at [zac@juicelabs.io](mailto:zac@juicelabs.io)

[![discord](https://i.imgur.com/d1eTfYR.png)](https://discord.gg/5HQ5V7d5jh)
