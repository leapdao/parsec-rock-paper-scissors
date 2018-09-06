import autobind from 'autobind-decorator';
import { observable, reaction } from 'mobx';
import { Account } from 'web3/types';
import { ExtendedWeb3, Tx, helpers } from 'parsec-lib';
import { IGame } from './types';
import { getGames, playRound } from './backend';

export default class Store {
  @observable
  public balance: number;

  @observable
  public game: IGame;

  private interval: number;
  private waiting: boolean = false;

  constructor(public web3: ExtendedWeb3, public account: Account) {
    this.watch();
    reaction(() => this.game, this.autoplay);
  }

  @autobind
  private autoplay() {
    if (
      this.game.players.length === 2 &&
      this.game.players.indexOf(this.account.address) > -1 &&
      this.game.rounds.length < 3
    ) {
      setTimeout(this.play, this.game.rounds.length === 0 ? 2000 : 5000);
    }
  }

  public watch() {
    this.loadData();
    this.interval = setInterval(this.loadData, 3000) as any;
  }

  private loadBalance() {
    this.web3.eth.getBalance(this.account.address).then(balance => {
      this.balance = balance;
    });
  }

  private loadGame() {
    getGames().then(([game]) => {
      if (!this.waiting) {
        this.game = game;
      }
    });
  }

  @autobind
  private loadData() {
    if (!this.waiting) {
      this.loadBalance();
      this.loadGame();
    }
  }

  public async join(stake) {
    const unspent = await this.web3.getUnspent(this.account.address);
    const inputs = helpers.calcInputs(unspent, this.account.address, stake, 0);
    const outputs = helpers.calcOutputs(
      unspent,
      inputs,
      this.account.address,
      this.game.address,
      stake,
      0
    );

    const tx = Tx.transfer(inputs, outputs).signAll(this.account.privateKey);
    const receipt = await this.web3.eth.sendSignedTransaction(
      tx.toRaw() as any
    );

    this.loadData();

    return receipt;
  }

  @autobind
  public async play() {
    this.waiting = true;

    try {
      const { game } = await playRound(
        this.game.address,
        this.game.rounds.length + 1
      );
      this.game = game;

      if (this.game.rounds.length === 3) {
        clearInterval(this.interval);

        setTimeout(() => {
          this.watch();
        }, 10000);
      }
    } finally {
      this.waiting = false;
    }

    // this.loadData();
  }
}
