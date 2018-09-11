import { requestApi } from './api';
import { IGame } from './types';

const request = requestApi('http://localhost:3005');

export const getGames = (): Promise<IGame[]> => {
  return request('get', 'games');
};

export const requestFunds = (address: string) => {
  return request('post', `requestFunds/${address}`);
};

export const submitReceipt = (
  gameAddr: string,
  receipt: string
): Promise<{ game: IGame }> => {
  return request('post', `submitReceipt/${gameAddr}`, { receipt });
};
