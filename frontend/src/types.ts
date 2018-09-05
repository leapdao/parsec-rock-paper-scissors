export type IRound = {
  number: number;
  players: string[];
  result: {
    [key: string]: number;
  };
};

export type IGame = {
  address: string;
  stake: number;
  players: string[];
  rounds: IRound[];
};
