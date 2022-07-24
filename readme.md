# RipDB (Redis + IPfs = RIP)

RipDB is a dead simple, fast, decentralized JSON store and corresponding javascript client perfect for fast moving web3 builders.

![img](https://i.imgur.com/8KVnLX3.png)

## Motivation

I've found that I am able to get very far building dapps without ANY self hosted database at all. There are so many great services that do the hard work of indexing and caaching blockchain data and are trivial to query with a simple network request.

BUT, every now and then I find myself wanting to slice the data in a slightly different way

## Usage from browser js client

```
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
