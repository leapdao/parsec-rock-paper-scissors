import * as React from 'react';

import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import Store from '../store';
import { playerIcon } from '../utils';

interface IProps {
  title: string;
  stake?: number;
  maxStake?: number;
  store?: Store;
}

@inject('store')
@observer
export default class Game extends React.Component<IProps, any> {
  @observable
  private stake: number = this.props.stake || 0;

  @observable
  private sending: boolean = false;

  render() {
    const { title, store } = this.props;

    return (
      <div className="join-wrapper">
        <div className="join">
          <div style={{ fontSize: '4rem' }}>
            {playerIcon(store.account.address)}
          </div>
          <p>{title}</p>
          <p className="stake">{this.stake}</p>
          {!this.props.stake && (
            <input
              value={this.stake}
              onChange={e => {
                this.stake = Number(e.target.value);
              }}
              type="range"
              min="0"
              step="100"
              max={this.props.maxStake}
            />
          )}
          <button
            onClick={() => {
              this.sending = true;
              const cb = () => {
                this.sending = false;
              };
              store.join(this.stake).then(cb, cb);
            }}
          >
            {this.sending ? 'Joining...' : 'Join'}
          </button>
        </div>
      </div>
    );
  }
}
