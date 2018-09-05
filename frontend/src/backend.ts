import { requestApi } from './api';
import { Game } from './types';

const request = requestApi('http://localhost:3005');

export const getGames = (): Promise<Game[]> => {
  return request('get', 'games');
};

export const requestFunds = (address: string) => {
  return request('post', `requestFunds/${address}`);
};

export const playRound = (gameAddr: string, round: number) => {
  return request('post', `round/${gameAddr}/${round}`);
};
