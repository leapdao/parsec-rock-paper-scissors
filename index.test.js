const { calcScore, calcScores } = require('./index');

const PLAYERS = [
  '0x8ab21c65041778dfc7ec7995f9cdef3d5221a5ad',
  '0x4436373705394267350db2c06613990d34621d69',
];
const VALUES = {
  ROCK: 0,
  SCISSORS: 1,
  PAPER: 2,
};

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
        [PLAYERS[0]]: VALUES.ROCK,
        [PLAYERS[1]]: VALUES.PAPER,
        players: PLAYERS,
      },
      {
        [PLAYERS[0]]: VALUES.SCISSORS,
        [PLAYERS[1]]: VALUES.PAPER,
        players: PLAYERS,
      },
      {
        [PLAYERS[0]]: VALUES.SCISSORS,
        [PLAYERS[1]]: VALUES.ROCK,
        players: PLAYERS,
      },
    ])
  ).toEqual({
    [PLAYERS[0]]: 1,
    [PLAYERS[1]]: 2,
  });

  expect(
    calcScores([
      {
        [PLAYERS[0]]: VALUES.PAPER,
        [PLAYERS[1]]: VALUES.PAPER,
        players: PLAYERS,
      },
      {
        [PLAYERS[0]]: VALUES.ROCK,
        [PLAYERS[1]]: VALUES.SCISSORS,
        players: PLAYERS,
      },
      {
        [PLAYERS[0]]: VALUES.PAPER,
        [PLAYERS[1]]: VALUES.SCISSORS,
        players: PLAYERS,
      },
    ])
  ).toEqual({
    [PLAYERS[0]]: 1,
    [PLAYERS[1]]: 1,
  });

  expect(
    calcScores([
      {
        [PLAYERS[0]]: VALUES.SCISSORS,
        [PLAYERS[1]]: VALUES.PAPER,
        players: PLAYERS,
      },
      {
        [PLAYERS[0]]: VALUES.ROCK,
        [PLAYERS[1]]: VALUES.SCISSORS,
        players: PLAYERS,
      },
      {
        [PLAYERS[0]]: VALUES.PAPER,
        [PLAYERS[1]]: VALUES.ROCK,
        players: PLAYERS,
      },
    ])
  ).toEqual({
    [PLAYERS[0]]: 3,
    [PLAYERS[1]]: 0,
  });
});
