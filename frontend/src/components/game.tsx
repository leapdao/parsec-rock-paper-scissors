import * as React from 'react';
import { observer, inject } from 'mobx-react';

import Join from './join';
import Store from '../store';
import { Fragment } from 'react';
import { calcScore, calcScores } from '../../../src/rules';
import { toJS } from 'mobx';
import { IRound, IScore } from '../types';

interface IProps {
  store?: Store;
}

const ICONS = ['✊', '✌', '✋'];

function last<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

const getWinner = (round: IRound) => {
  const [p1, p2] = round.players;
  const score1 = calcScore(round.result[p1], round.result[p2]);
  const score2 = calcScore(round.result[p2], round.result[p1]);

  if (score1 === score2) {
    return undefined;
  }

  return score1 > score2 ? p1 : p2;
};

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
    const [p1, p2] = store.game.players;
    const roundWinner = lastRound && getWinner(lastRound);
    const scores =
      store.game.rounds.length > 0
        ? (calcScores(store.game.rounds) as IScore)
        : null;

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

        {store.game.rounds.length === 3 && (
          <div className="winner-wrapper">
            <div className="winner">
              <h3>🎉</h3>
              {scores[p1] !== scores[p2] && (
                <div className="winner-pic">
                  {scores[p1] > scores[p2] ? '🦊' : '🐨'}
                </div>
              )}

              {scores[p1] === scores[p2] && (
                <div className="winner-pic">🦊 🐨</div>
              )}
              {scores[p1] !== scores[p2] && store.game.stake * 2}
            </div>

            <button
              onClick={() => {
                store.watch();
              }}
            >
              Ok
            </button>
          </div>
        )}
        <div className="players">
          <div className="player">
            {store.game.players.length >= 1 && <h3>🦊</h3>}
            {lastRound && ICONS[lastRound.result[p1]]}

            {p1 &&
              roundWinner === p1 && (
                <Fragment>
                  <br />
                  🎉
                </Fragment>
              )}
          </div>
          <div className="player">
            {store.game.players.length === 2 && <h3>🐨</h3>}

            {lastRound && ICONS[lastRound.result[p2]]}
            {p2 &&
              roundWinner === p2 && (
                <Fragment>
                  <br />
                  🎉
                </Fragment>
              )}

            {store.game.players.length === 1 &&
              !joined && (
                <div className="join-popover">
                  <Join title="Join the game" stake={store.game.stake} />
                </div>
              )}
          </div>
        </div>

        {store.game.players.length === 2 &&
          store.game.rounds.length < 3 && (
            <button
              onClick={() => {
                store.play();
              }}
            >
              Play
            </button>
          )}
      </div>
    );
  }
}
