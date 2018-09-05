import * as React from 'react';
import { observer, inject } from 'mobx-react';

import Join from './join';
import Store from '../store';
import { Fragment } from 'react';

interface IProps {
  store?: Store;
}

const ICONS = ['✊', '✋', '✌'];

function last<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

@inject('store')
@observer
export default class Game extends React.Component<IProps, any> {
  render() {
    const { store } = this.props;
    if (!store) {
      return null;
    }
    const joined = store.game.players.indexOf(store.account.address) > -1;
    const lastRound = last(store.game.rounds);

    return (
      <div className="game">
        {store.game.players.length === 0 && (
          <div className="join-popover">
            <Join title="No one joined the game yet" maxStake={store.balance} />
          </div>
        )}
        {store.game.players.length === 2 && (
          <div className="round">
            {!lastRound && (
              <Fragment>
                waiting
                <br />
                for start
              </Fragment>
            )}
            {lastRound && (
              <Fragment>
                <strong>{lastRound.number}</strong>
                Round
              </Fragment>
            )}
          </div>
        )}
        <div className="players">
          <div className="player">
            {store.game.players.length >= 1 && <h3>🦊</h3>}
            {lastRound && ICONS[lastRound.result[store.game.players[0]]]}
          </div>
          <div className="player">
            {store.game.players.length === 2 && <h3>🐨</h3>}

            {lastRound && ICONS[lastRound.result[store.game.players[1]]]}

            {store.game.players.length === 1 &&
              !joined && (
                <div className="join-popover">
                  <Join title="Join the game" stake={store.game.stake} />
                </div>
              )}
          </div>
        </div>

        <button
          onClick={() => {
            store.play();
          }}
        >
          Play
        </button>
      </div>
    );
  }
}
