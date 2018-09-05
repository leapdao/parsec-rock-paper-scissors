/**
 * Copyright (c) 2018-present, Parsec Labs (parseclabs.org)
 *
 * This source code is licensed under the GNU GENERAL PUBLIC LICENSE Version 3
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { Fragment } from 'react';
// import PropTypes from 'prop-types';
import { Route, withRouter } from 'react-router';

import Home from '../routes/home';

import '../style.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Fragment>
        <Route path="/" exact component={Home} />
      </Fragment>
    );
  }
}

App.propTypes = {};

export default withRouter(App);
