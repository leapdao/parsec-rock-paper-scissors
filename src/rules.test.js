const { calcScore, calcScores } = require('./rules');
const { VALUES } = require('./constants');

const P1 = '0xB8205608d54cb81f44F263bE086027D8610F3C94';
const P2 = '0xD56F7dFCd2BaFfBC1d885F0266b21C7F2912020c';
const PLAYERS = [P1, P2];

test('calcScore', () => {
  expect(calcScore(VALUES.ROCK, VALUES.ROCK)).toBe(0);
  expect(calcScore(VALUES.ROCK, VALUES.SCISSORS)).toBe(1);
  expect(calcScore(VALUES.ROCK, VALUES.PAPER)).toBe(0);
  expect(calcScore(VALUES.PAPER, VALUES.PAPER)).toBe(0);
  expect(calcScore(VALUES.PAPER, VALUES.SCISSORS)).toBe(0);
  expect(calcScore(VALUES.PAPER, VALUES.ROCK)).toBe(1);
  expect(calcScore(VALUES.SCISSORS, VALUES.SCISSORS)).toBe(0);
  expect(calcScore(VALUES.SCISSORS, VALUES.ROCK)).toBe(0);
  expect(calcScore(VALUES.SCISSORS, VALUES.PAPER)).toBe(1);
});

test('calcScores', () => {
  expect(
    calcScores([
      {
        result: {
          [P1]: VALUES.ROCK,
          [P2]: VALUES.PAPER,
        },
        players: PLAYERS,
      },
      {
        result: {
          [P1]: VALUES.SCISSORS,
          [P2]: VALUES.PAPER,
        },
        players: PLAYERS,
      },
      {
        result: {
          [P1]: VALUES.SCISSORS,
          [P2]: VALUES.ROCK,
        },
        players: PLAYERS,
      },
    ])
  ).toEqual({
    [P1]: 1,
    [P2]: 2,
  });

  expect(
    calcScores([
      {
        result: {
          [P1]: VALUES.PAPER,
          [P2]: VALUES.PAPER,
        },
        players: PLAYERS,
      },
      {
        result: {
          [P1]: VALUES.ROCK,
          [P2]: VALUES.SCISSORS,
        },
        players: PLAYERS,
      },
      {
        result: {
          [P1]: VALUES.PAPER,
          [P2]: VALUES.SCISSORS,
        },
        players: PLAYERS,
      },
    ])
  ).toEqual({
    [P1]: 1,
    [P2]: 1,
  });

  expect(
    calcScores([
      {
        result: {
          [P1]: VALUES.SCISSORS,
          [P2]: VALUES.PAPER,
        },
        players: PLAYERS,
      },
      {
        result: {
          [P1]: VALUES.ROCK,
          [P2]: VALUES.SCISSORS,
        },
        players: PLAYERS,
      },
      {
        result: {
          [P1]: VALUES.PAPER,
          [P2]: VALUES.ROCK,
        },
        players: PLAYERS,
      },
    ])
  ).toEqual({
    [P1]: 3,
    [P2]: 0,
  });
});
