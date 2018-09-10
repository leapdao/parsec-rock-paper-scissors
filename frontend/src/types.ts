import { Tx } from 'parsec-lib';

export type IResult = {
  [key: string]: number;
};

export type IScore = {
  [key: string]: number;
};

export type IRound = {
  number: number;
  players: string[];
  result: IResult;
  stake: number;
  distribution?: string | Tx<any>;
};

export type IGame = {
  address: string;
  stake: number;
  players: string[];
  rounds: IRound[];
};
