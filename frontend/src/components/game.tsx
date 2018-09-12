import * as React from 'react';
import { observer, inject } from 'mobx-react';

import Join from './join';
import Store from '../store';
import { Fragment } from 'react';
import { calcScore, calcScores } from '../../../src/rules';
import { IRound, IScore } from '../types';
import { playerIcon, last } from '../utils';
import { toJS } from 'mobx';
import { VALUES } from '../../../src/constants';

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
    const address = store.account.address.toLowerCase();
    const joined = store.players.indexOf(address) > -1;
    const [p1, p2] = store.players;
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
                <strong>
                  {store.lastRound ? store.lastRound.number + 1 : 1}
                </strong>
                Round
              </div>
            )}

          {!store.playing &&
            store.game.rounds.length === 3 && (
              <div className="winner-wrapper">
                <div className="winner">
                  <h3>🎉</h3>
                  {scores[p1] !== scores[p2] && (
                    <div className="winner-pic">
                      {scores[p1] > scores[p2]
                        ? playerIcon(p1)
                        : playerIcon(p2)}
                    </div>
                  )}

                  {scores[p1] === scores[p2] && (
                    <div className="winner-pic">
                      {playerIcon(p1)} {playerIcon(p2)}
                    </div>
                  )}
                  {scores[p1] !== scores[p2] && store.stake * 2}
                </div>
              </div>
            )}
          <div className="players">
            {[0, 1].map(i => (
              <div className="player" key={i}>
                {store.players[i] && <h3>{playerIcon(store.players[i])}</h3>}
                {store.players[i] === address && '(you)'}
                <div className="player-result">
                  {store.lastRound &&
                    !store.move && (
                      <strong>
                        {ICONS[store.lastRound.result[store.players[i]]]}
                      </strong>
                    )}

                  {store.move &&
                    store.players[i] === address && (
                      <strong>{ICONS[store.move.value]}</strong>
                    )}

                  {store.players[i] &&
                    !store.move &&
                    roundWinner === store.players[i] && <span>🎉</span>}
                </div>

                {i > 0 &&
                  store.players.length > 0 &&
                  i >= store.players.length &&
                  !joined && (
                    <div className="join-popover">
                      <Join title="Join the game" stake={store.stake} />
                    </div>
                  )}

                {store.game.rounds.length < 3 &&
                  store.game.players.length === 2 && (
                    <Fragment>
                      {store.players[i] !== address &&
                        store.move && (
                          <div className="select-pane">
                            Waiting for a move...
                          </div>
                        )}
                      {store.players[i] === address && (
                        <div className="select-pane">
                          {[VALUES.ROCK, VALUES.PAPER, VALUES.SCISSORS].map(
                            v => (
                              <button
                                key={v}
                                disabled={!!store.move}
                                style={{
                                  backgroundColor:
                                    store.move && store.move.value === v
                                      ? 'rgba(35, 205, 253, 0.2)'
                                      : 'transparent',
                                }}
                                onClick={() => {
                                  store.makeMove(
                                    store.lastRound
                                      ? store.lastRound.number + 1
                                      : 1,
                                    v
                                  );
                                }}
                              >
                                {ICONS[v]}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </Fragment>
                  )}
              </div>
            ))}
          </div>
        </div>
        {false && (
          <Fragment>
            <pre>{JSON.stringify(store.game, undefined, 2)}</pre>
          </Fragment>
        )}
      </Fragment>
    );
  }
}
