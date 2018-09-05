export type Round = {
  number: number;
  players: string[];
  result: {
    [key: string]: number;
  };
};

export type Game = {
  address: string;
  players: string[];
  rounds: Round[];
};
