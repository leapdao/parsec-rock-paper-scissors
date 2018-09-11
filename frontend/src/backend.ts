import { requestApi } from './api';
import { IGame } from './types';

const request = requestApi('http://testnet-1.parseclabs.org:3005');

export const getGames = (): Promise<IGame[]> => {
  return request('get', 'games');
};

export const requestFunds = (address: string) => {
  return request('post', `requestFunds/${address}`);
};

export const playRound = (
  gameAddr: string,
  round: number
): Promise<{ game: IGame }> => {
  return request('post', `round/${gameAddr}/${round}`);
};
