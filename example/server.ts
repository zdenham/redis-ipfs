import express from 'express';
import { RipDBClient } from '../library';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3500;

const rip = new RipDBClient({
  redisUrl: '',
  ipfsApiKey: process.env.IPFS_KEY || '',
});

app.get('/get/:key', async (req, res) => {
  console.log('THE KEY:', req.params.key);
  res.send('Hello World!');
});

app.post('set/:key', async (req, res) => {
  console.log('THE KEY: ', req.params.key);
  res.send('Hello World');
});

app.get('/ipfs/get/:cid', async (req, res) => {
  res.send('Hello World!');
});

app.post('/ipfs/set', async (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example RipDB server listening on port ${port}`);
});
