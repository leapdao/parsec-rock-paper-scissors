const { VALUES } = require('./constants');

const calcScore = (v1, v2) => {
  if (v1 === v2) {
    return 0;
  }

  return (v1 === VALUES.ROCK && v2 === VALUES.SCISSORS) ||
    (v1 === VALUES.PAPER && v2 === VALUES.ROCK) ||
    (v1 === VALUES.SCISSORS && v2 === VALUES.PAPER)
    ? 1
    : 0;
};

const calcScores = rounds => {
  const {
    players: [p1, p2],
  } = rounds[0];

  return rounds.reduce(
    (scores, round) => ({
      [p1]: scores[p1] + calcScore(round.result[p1], round.result[p2]),
      [p2]: scores[p2] + calcScore(round.result[p2], round.result[p1]),
    }),
    {
      [p1]: 0,
      [p2]: 0,
    }
  );
};

exports.calcScore = calcScore;
exports.calcScores = calcScores;
