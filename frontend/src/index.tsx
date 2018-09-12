/**
 * Copyright (c) 2018-present, Parsec Labs (parseclabs.org)
 *
 * This source code is licensed under the GNU GENERAL PUBLIC LICENSE Version 3
 * found in the LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { Provider } from 'mobx-react';
import * as ReactDOM from 'react-dom';
import * as Web3 from 'web3';
import { helpers } from 'parsec-lib';

import App from './components/app';
import { getAccount, requestFaucet } from './wallet';
import Store from './store';

const PARSEC_PROVIDER = 'https://testnet-2.parseclabs.org';
const web3 = helpers.extendWeb3(new (Web3 as any)(PARSEC_PROVIDER));

const account = getAccount(web3);

requestFaucet(web3, account).then(() => {
  const store = new Store(web3, account);
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('app')
  );
});
