const { Tx, Input, Output } = require('parsec-lib');

const calcDistribution = (scores, unspent, transactions) => {
  const [p1, p2] = Object.keys(scores);

  const inputs = unspent.map(u => new Input(u.outpoint));

  // draw
  if (scores[p1] === scores[p2]) {
    const outputs = transactions.map(t => new Output(t.value, t.from, 0));
    return Tx.transfer(inputs, outputs);
  }

  const stake = Math.min.apply(null, transactions.map(t => t.value));
  const pot = stake * 2;

  const winner = scores[p1] > scores[p2] ? p1 : p2;
  const outputs = [new Output(pot, winner, 0)];
  for (const tx of transactions) {
    if (tx.from !== p1 && tx.from !== p2) {
      outputs.push(new Output(tx.value, tx.from, 0));
    } else if (tx.value > stake) {
      // leftovers
      if (tx.from === winner) {
        outputs[0].value += tx.value - stake;
      } else {
        outputs.push(new Output(tx.value - stake, tx.from, 0));
      }
    }
  }

  return Tx.transfer(inputs, outputs);
};

module.exports = calcDistribution;
