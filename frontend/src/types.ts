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
  distribution?: string;
};

export type IGame = {
  address: string;
  stake: number;
  players: string[];
  rounds: IRound[];
};
