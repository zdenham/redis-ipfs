# RipDB (Redis + IPfs = RIP)

RipDB is a dead simple, fast, decentralized JSON store and corresponding javascript client perfect for fast moving web3 builders.

![img](https://i.imgur.com/8KVnLX3.png)

## Motivation

The SQL database is an amazing and powerful tool unrivaled for storing and querying relational data.

BUT, I believe most Dapps can live without a traditional SQL database in favor of something more light weight and decentralized.

Here are some problems with setting up a db for your dapp

1. There are already many great services which index blockchain data (why reinvent the wheel?)
2. DBs are expensive to host
3. Migrations are often a pain
4. They tend to be centralized / treasure trove for attackers
5. They usually don't give users provenance over their data
6. Encryption / key management is a pain

I wanted Rip to feel like web based localstorage, but with decentralization and encryption baked in. I think its getting there and I'm very excited to use it in my upcoming projects!

## Usage from browser js client

```javascript
// Setting up client
import { RipClient } from './RipClient'
const ripServerEndpointUrl = '';

const rip = new RipClient(ripServerEndpointUrl);

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

## TODO

- [ ] Expose RIP client and Rip server as node_modules
- [ ] Implement other Redis operations e.g. scan on the front end client
- [ ] Maybe, build key -> data models in typescript, get graphql style automatic runtime validation during set based on the typescript models
- [ ] Get fancier with user owned access control features
