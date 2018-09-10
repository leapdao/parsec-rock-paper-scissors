import * as React from 'react';
import { observer, inject } from 'mobx-react';

import Join from './join';
import Store from '../store';
import { Fragment } from 'react';
import { calcScore, calcScores } from '../../../src/rules';
import { IRound, IScore } from '../types';
import { playerIcon, last } from '../utils';
import { toJS } from 'mobx';

interface IProps {
  store?: Store;
}

const ICONS = ['✊', '✌', '✋'];

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
    const joined = store.players.indexOf(store.account.address) > -1;
    const [p1, p2] = store.players;
    const p1Icon = playerIcon(p1);
    const p2Icon = playerIcon(p2);
    const roundWinner = store.lastRound && getWinner(store.lastRound);
    const scores =
      store.game.rounds.length > 0
        ? (calcScores(store.game.rounds) as IScore)
        : null;

    return (
      <Fragment>
        <div className="game">
          {store.players.length === 0 && (
            <div className="join-popover">
              <Join
                title="No one joined the game yet"
                maxStake={store.balance}
              />
            </div>
          )}
          {store.players.length === 2 &&
            store.playing && (
              <div className="round">
                {!store.lastRound && (
                  <Fragment>
                    waiting
                    <br />
                    for start
                  </Fragment>
                )}
                {store.lastRound && (
                  <Fragment>
                    <strong>{store.lastRound.number}</strong>
                    Round
                  </Fragment>
                )}
              </div>
            )}

          {!store.playing &&
            store.game.rounds.length === 3 && (
              <div className="winner-wrapper">
                <div className="winner">
                  <h3>🎉</h3>
                  {scores[p1] !== scores[p2] && (
                    <div className="winner-pic">
                      {scores[p1] > scores[p2] ? p1Icon : p2Icon}
                    </div>
                  )}

                  {scores[p1] === scores[p2] && (
                    <div className="winner-pic">
                      {p1Icon} {p2Icon}
                    </div>
                  )}
                  {scores[p1] !== scores[p2] && store.stake * 2}
                </div>

                {false && (
                  <button
                    onClick={() => {
                      store.watch();
                    }}
                  >
                    Ok
                  </button>
                )}
              </div>
            )}
          <div className="players">
            <div className="player">
              {store.players.length >= 1 && <h3>{p1Icon}</h3>}
              {p1 === store.account.address && '(you)'}
              <div className="player-result">
                {store.lastRound && (
                  <strong>{ICONS[store.lastRound.result[p1]]}</strong>
                )}

                {p1 && roundWinner === p1 && <span>🎉</span>}
              </div>
            </div>
            <div className="player">
              {store.players.length === 2 && <h3>{p2Icon}</h3>}
              {p2 === store.account.address && '(you)'}

              <div className="player-result">
                {store.lastRound && (
                  <strong>{ICONS[store.lastRound.result[p2]]}</strong>
                )}
                {p2 && roundWinner === p2 && <span>🎉</span>}
              </div>

              {store.players.length === 1 &&
                !joined && (
                  <div className="join-popover">
                    <Join title="Join the game" stake={store.stake} />
                  </div>
                )}
            </div>
          </div>
        </div>
        {false && (
          <Fragment>
            <button
              onClick={() => {
                store.play(
                  store.game.rounds.length === 0
                    ? 1
                    : last(store.game.rounds).number + 1
                );
              }}
            >
              Play
            </button>
            <pre>{JSON.stringify(store.game, undefined, 2)}</pre>
          </Fragment>
        )}
      </Fragment>
    );
  }
}
