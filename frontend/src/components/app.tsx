/**
 * Copyright (c) 2018-present, Parsec Labs (parseclabs.org)
 *
 * This source code is licensed under the GNU GENERAL PUBLIC LICENSE Version 3
 * found in the LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { Account } from 'web3/types';
import { ExtendedWeb3 } from 'parsec-lib';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

import Game from './game';
import '../style.css';
import Store from '../store';

interface IProps {
  store?: Store;
}

@inject('store')
@observer
class App extends React.Component<IProps, any> {
  render() {
    const { store } = this.props;
    if (!store) {
      return null;
    }
    return (
      <div className="app">
        <h1>🌟 ✊ ✋ ✌ 🌟</h1>
        {!store.game && 'Loading...'}
        {store.game && <Game />}
      </div>
    );
  }
}

export default App;
