import express from 'express';
import { RipDBStorageClient } from '../library';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const port = 3500;

const ripStorage = new RipDBStorageClient({
  redisUrl: process.env.REDIS_URL || '',
  ipfsApiKey: process.env.IPFS_KEY || '',
});

app.post('/set/:key', async (req, res) => {
  const wrappedData = await ripStorage.set(req.params.key, req.body);

  res.send(wrappedData);
});

app.get('/get/:key', async (req, res) => {
  const wrappedData = await ripStorage.get(req.params.key);

  res.send(wrappedData);
});

// TODO - implement once it has authentication
app.post('/purge/:key', async (req, res) => {
  // await ripStorage.purge(req.params.key);
  await res.send({ status: 'failed purge not yet supported' });
});

app.listen(port, () => {
  console.log(`Example RipDB server listening on port ${port}`);
});
