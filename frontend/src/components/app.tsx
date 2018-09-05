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
import { observer } from 'mobx-react';
// import PropTypes from 'prop-types';

import '../style.css';

interface IProps {
  web3: ExtendedWeb3;
  account: Account;
}

@observer
class App extends React.Component<IProps, any> {
  @observable
  private balance: number;

  constructor(props) {
    super(props);
    this.readData();
  }

  private readData() {
    const { web3, account } = this.props;
    web3.eth.getBalance(account.address).then(balance => {
      this.balance = balance;
    });
  }

  render() {
    return (
      <div>
        <h1>Index page</h1>
        Balance: {this.balance}
      </div>
    );
  }
}

export default App;
