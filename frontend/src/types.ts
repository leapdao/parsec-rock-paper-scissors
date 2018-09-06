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
};

export type IGame = {
  address: string;
  stake: number;
  players: string[];
  rounds: IRound[];
};
