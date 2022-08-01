import express from 'express';
import { RipDBStorageClient } from '../src/storageClient';
import dotenv from 'dotenv';
import { NFTStorage } from 'nft.storage';
import { Blob } from 'node:buffer';
import cors from 'cors';
import fetch from 'cross-fetch';
// import LitJsSdk from 'lit-js-sdk';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const port = 3500;

const rip = new RipDBStorageClient({
  redisUrl: process.env.REDIS_URL || '',
  ipfsApiKey: process.env.IPFS_KEY || '',
});

app.post('/set/:key', async (req, res) => {
  const startTime = Date.now();
  const wrappedData = await rip.set(req.params.key, req.body);
  const duration = Date.now() - startTime;

  const responseBody = {
    wrappedData,
    duration,
  };

  res.send(responseBody);
});

app.get('/get/:key', async (req, res) => {
  const startTime = Date.now();
  const wrappedData = await rip.get(req.params.key);
  const duration = Date.now() - startTime;

  const responseBody = {
    wrappedData,
    duration,
  };

  res.send(responseBody);
});

app.post('/purge/:key', async (req, res) => {
  await rip.purge(req.params.key);
  await res.send({ status: 'success' });
});

// BELOW Endpoints are just for demo benchmark comparison purposes

// TODO - replace this with a different ipfs client
const rawIPFSClient = new NFTStorage({ token: process.env.IPFS_KEY || '' });

app.post('/ipfs/set', async (req, res) => {
  // slightly modify the data so the comparison is with two different CIDs
  const body = { ...req.body, slight: 'modification' };
  const dataStr = JSON.stringify(body);

  const blob = new Blob([dataStr], { type: 'application/json' });

  const startTime = Date.now();
  // @ts-ignore
  await rawIPFSClient.storeBlob(blob);
  const duration = Date.now() - startTime;

  res.send({ duration });
});

app.get('/ipfs/get/:key', async (req, res) => {
  // read CID from RIPDB
  const response = await rip.get(req.params.key);
  if (!response) {
    throw new Error('No value stored with this key');
  }
  const { cid } = response;
  const startTime = Date.now();

  await fetch(`https://ipfs.io/ipfs/${cid}`);
  const duration = Date.now() - startTime;
  res.send({ duration });
});

app.listen(port, () => {
  console.log(`Example RipDB server listening on port ${port}`);
});
