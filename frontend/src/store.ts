import autobind from 'autobind-decorator';
import { observable, reaction, toJS, computed, action } from 'mobx';
import { Account } from 'web3/types';
import { ExtendedWeb3, Tx, helpers, Type } from 'parsec-lib';
import { IGame } from './types';
import { getGames, playRound } from './backend';
import { last } from './utils';

export default class Store {
  @observable
  public balance: number;

  @observable
  public game: IGame;

  @observable
  public playing = false;

  private interval: number;

  constructor(public web3: ExtendedWeb3, public account: Account) {
    this.watch();
    reaction(() => this.game, this.autoplay);
  }

  @autobind
  private autoplay() {
    if (this.game.players.length === 2 && this.game.rounds.length < 3) {
      setTimeout(
        this.play.bind(
          this,
          this.game.rounds.length === 0 ? 1 : last(this.game.rounds).number + 1
        ),
        this.game.rounds.length === 0 ? 2000 : 5000
      );
    }
  }

  public async watch() {
    this.loadData().then(data => {
      this.updateData(data);
      this.playing = true;
      this.interval = setInterval(() => {
        this.loadData().then(data => this.updateData(data));
      }, 1000) as any;
    });
  }

  @autobind
  private loadData() {
    return Promise.all([this.loadBalance(), this.loadGame()]);
  }

  private loadBalance() {
    return this.web3.eth.getBalance(this.account.address);
  }

  private loadGame() {
    return getGames().then(([game]) => game);
  }

  @action
  private updateData([balance, game]: [number, IGame]) {
    this.balance = balance;
    this.updateGame(game);
  }

  @action
  private updateGame(game: IGame) {
    if (game.rounds.length > 0 && last(game.rounds).distribution) {
      last(game.rounds).distribution = Tx.fromRaw(last(game.rounds)
        .distribution as string);
      console.log(last(game.rounds).distribution);
    }
    if (
      this.game &&
      !(this.game.rounds.length > 0 && last(this.game.rounds).distribution) &&
      (game.rounds.length > 0 && last(game.rounds).distribution) &&
      this.playing
    ) {
      this.playing = false;
      clearInterval(this.interval);
      this.waitForDistribution(last(game.rounds).distribution as Tx<
        Type.TRANSFER
      >);
    }
    this.game = game;
  }

  private waitForDistribution(tx: Tx<Type.TRANSFER>) {
    setTimeout(() => {
      const checkDistribution = async () => {
        this.web3.eth.getTransaction(tx.hash()).then(tx => {
          if (tx) {
            this.watch();
          } else {
            setTimeout(checkDistribution, 500);
          }
        });
      };
      checkDistribution();
    }, 10000);
  }

  @computed
  get lastRound() {
    if (this.game) {
      return last(this.game.rounds);
    }

    return undefined;
  }

  @computed
  public get stake() {
    return !this.playing && this.lastRound
      ? this.lastRound.stake
      : this.game.stake;
  }

  @computed
  public get players() {
    return !this.playing && this.lastRound
      ? this.lastRound.players
      : this.game.players;
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

    const data = await this.loadData();
    this.updateData(data);

    return receipt;
  }

  @autobind
  public async play(round) {
    try {
      if (
        !this.lastRound ||
        (this.lastRound && this.lastRound.number !== round)
      ) {
        await playRound(this.game.address, round);
      }
    } catch (err) {}
  }
}
