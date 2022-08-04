import React from 'react';
import logo from './logo.svg';
import './App.css';
import { rip } from './rip';

type MyDataType = {
  hello: string;
};

function App() {
  const onButtonClick = async () => {
    await rip.signMessageForEncryption();

    const randKey = `rand-key-${(Math.random() + 1).toString(36).substring(2)}`;
    const dataToStore: MyDataType = {
      hello: 'Rip React Typescript Encrypted World',
    };

    const { duration: setDuration, data: encryptedData } =
      await rip.set<MyDataType>(randKey, dataToStore, {
        encrypt: true,
      });

    const message = `Stored encrypted data to rip in ${setDuration} ms \n ${JSON.stringify(
      encryptedData
    )}`;

    alert(message);

    const { data, duration } = await rip.get<MyDataType>(randKey);

    const getMessage = `Retrieved data in ${duration} ms. \n ${JSON.stringify(
      data
    )}`;

    alert(getMessage);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          View <code>src/App.tsx</code> and <code>src/rip.ts</code> to see how
          this example works! <br />
          <br />
          When you click the below button, you will be prompted to sign a
          transaction to prove your identity for encryption.
        </p>
        <button onClick={onButtonClick}>
          Click this button to store some encrypted dummy data
        </button>
      </header>
    </div>
  );
}

export default App;
