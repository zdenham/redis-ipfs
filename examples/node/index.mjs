import { RipDBClient } from '@rip-db/client';

const main = async () => {
  const ripServerUrl = 'https://rip-sandbox.onrender.com';
  const rip = new RipDBClient({ ripServerUrl });

  const key = `rand-key-${(Math.random() + 1).toString(36).substring(2)}`;
  const data = { hello: 'Rip Node World' };

  const { duration: setDuration } = await rip.set(key, data);
  console.log('Data saved to rip in time (ms): ', setDuration);

  const savedData = await rip.get(key);
  console.log('Data fetched from Rip for key', key, 'is', savedData);
};

main();
