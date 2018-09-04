const { Tx, Input, Output, Outpoint } = require('parsec-lib');
const { VALUES, calcScore, calcScores, calcDistribution } = require('./index');

const GAME = '0x8ab21c65041778dfc7ec7995f9cdef3d5221a5ae';

const PRIV1 =
  '0x9b63fe8147edb8d251a6a66fd18c0ed73873da9fff3f08ea202e1c0a8ead7311';
const PRIV2 =
  '0xea3a59a673a9f7e74ad65e92ee04c2330fc5b905d0fa47bb2ae36c0b94af61cd';
const PRIV3 =
  '0x84207865074c52f6b39b31a5315e0f820ac078921888d86d193454f95777c855';
const P1 = '0xB8205608d54cb81f44F263bE086027D8610F3C94';
const P2 = '0xD56F7dFCd2BaFfBC1d885F0266b21C7F2912020c';
const P3 = '0x983f0159242a8eeF9BbE5aC3E02D96aA3252dD9c';
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
        [P1]: VALUES.ROCK,
        [P2]: VALUES.PAPER,
        players: PLAYERS,
      },
      {
        [P1]: VALUES.SCISSORS,
        [P2]: VALUES.PAPER,
        players: PLAYERS,
      },
      {
        [P1]: VALUES.SCISSORS,
        [P2]: VALUES.ROCK,
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
        [P1]: VALUES.PAPER,
        [P2]: VALUES.PAPER,
        players: PLAYERS,
      },
      {
        [P1]: VALUES.ROCK,
        [P2]: VALUES.SCISSORS,
        players: PLAYERS,
      },
      {
        [P1]: VALUES.PAPER,
        [P2]: VALUES.SCISSORS,
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
        [P1]: VALUES.SCISSORS,
        [P2]: VALUES.PAPER,
        players: PLAYERS,
      },
      {
        [P1]: VALUES.ROCK,
        [P2]: VALUES.SCISSORS,
        players: PLAYERS,
      },
      {
        [P1]: VALUES.PAPER,
        [P2]: VALUES.ROCK,
        players: PLAYERS,
      },
    ])
  ).toEqual({
    [P1]: 3,
    [P2]: 0,
  });
});

describe('calcDistribution', () => {
  test('draw', () => {
    const tx1 = Tx.transfer(
      [
        new Input(
          new Outpoint(
            '0x7777777777777777777777777777777777777777777777777777777777777777',
            0
          )
        ),
      ],
      [new Output(1000, GAME, 0)]
    ).signAll(PRIV1);
    const tx2 = Tx.transfer(
      [
        new Input(
          new Outpoint(
            '0x7777777777777777777777777777777777777777777777777777777777777777',
            0
          )
        ),
      ],
      [new Output(1200, GAME, 0)]
    ).signAll(PRIV2);
    const distribution = calcDistribution(
      {
        [P1]: 0,
        [P2]: 0,
      },
      [
        {
          outpoint: new Outpoint(tx1.hash(), 0),
          output: tx1.outputs[0].toJSON(),
        },
        {
          outpoint: new Outpoint(tx2.hash(), 0),
          output: tx2.outputs[0].toJSON(),
        },
      ],
      [
        {
          from: P1,
          value: 1000,
        },
        {
          from: P2,
          value: 1200,
        },
      ]
    );
    expect(distribution.outputs[0].toJSON()).toEqual({
      color: 0,
      value: 1000,
      address: P1,
    });
    expect(distribution.outputs[1].toJSON()).toEqual({
      color: 0,
      value: 1200,
      address: P2,
    });
  });

  test('win', () => {
    const tx1 = Tx.transfer(
      [
        new Input(
          new Outpoint(
            '0x7777777777777777777777777777777777777777777777777777777777777777',
            0
          )
        ),
      ],
      [new Output(1000, GAME, 0)]
    ).signAll(PRIV1);
    const tx2 = Tx.transfer(
      [
        new Input(
          new Outpoint(
            '0x7777777777777777777777777777777777777777777777777777777777777777',
            0
          )
        ),
      ],
      [new Output(1000, GAME, 0)]
    ).signAll(PRIV2);
    const distribution = calcDistribution(
      {
        [P1]: 1,
        [P2]: 0,
      },
      [
        {
          outpoint: new Outpoint(tx1.hash(), 0),
          output: tx1.outputs[0].toJSON(),
        },
        {
          outpoint: new Outpoint(tx2.hash(), 0),
          output: tx2.outputs[0].toJSON(),
        },
      ],
      [
        {
          from: P1,
          value: 1000,
        },
        {
          from: P2,
          value: 1000,
        },
      ]
    );
    expect(distribution.outputs[0].toJSON()).toEqual({
      color: 0,
      value: 2000,
      address: P1,
    });
    expect(distribution.outputs.length).toBe(1);
  });

  test('win with leftovers', () => {
    const tx1 = Tx.transfer(
      [
        new Input(
          new Outpoint(
            '0x7777777777777777777777777777777777777777777777777777777777777777',
            0
          )
        ),
      ],
      [new Output(1000, GAME, 0)]
    ).signAll(PRIV1);
    const tx2 = Tx.transfer(
      [
        new Input(
          new Outpoint(
            '0x7777777777777777777777777777777777777777777777777777777777777777',
            0
          )
        ),
      ],
      [new Output(1200, GAME, 0)]
    ).signAll(PRIV2);
    const distribution = calcDistribution(
      {
        [P1]: 1,
        [P2]: 0,
      },
      [
        {
          outpoint: new Outpoint(tx1.hash(), 0),
          output: tx1.outputs[0].toJSON(),
        },
        {
          outpoint: new Outpoint(tx2.hash(), 0),
          output: tx2.outputs[0].toJSON(),
        },
      ],
      [
        {
          from: P1,
          value: 1000,
        },
        {
          from: P2,
          value: 1200,
        },
      ]
    );
    expect(distribution.outputs[0].toJSON()).toEqual({
      color: 0,
      value: 2000,
      address: P1,
    });
    expect(distribution.outputs[1].toJSON()).toEqual({
      color: 0,
      value: 200,
      address: P2,
    });
    expect(distribution.outputs.length).toBe(2);
  });

  test('win with leftovers for winner', () => {
    const tx1 = Tx.transfer(
      [
        new Input(
          new Outpoint(
            '0x7777777777777777777777777777777777777777777777777777777777777777',
            0
          )
        ),
      ],
      [new Output(1200, GAME, 0)]
    ).signAll(PRIV1);
    const tx2 = Tx.transfer(
      [
        new Input(
          new Outpoint(
            '0x7777777777777777777777777777777777777777777777777777777777777777',
            0
          )
        ),
      ],
      [new Output(1000, GAME, 0)]
    ).signAll(PRIV2);
    const distribution = calcDistribution(
      {
        [P1]: 1,
        [P2]: 0,
      },
      [
        {
          outpoint: new Outpoint(tx1.hash(), 0),
          output: tx1.outputs[0].toJSON(),
        },
        {
          outpoint: new Outpoint(tx2.hash(), 0),
          output: tx2.outputs[0].toJSON(),
        },
      ],
      [
        {
          from: P1,
          value: 1200,
        },
        {
          from: P2,
          value: 1000,
        },
      ]
    );
    expect(distribution.outputs[0].toJSON()).toEqual({
      color: 0,
      value: 2200,
      address: P1,
    });
    expect(distribution.outputs.length).toBe(1);
  });

  test('win with more than 2 transactions', () => {
    const tx1 = Tx.transfer(
      [
        new Input(
          new Outpoint(
            '0x7777777777777777777777777777777777777777777777777777777777777777',
            0
          )
        ),
      ],
      [new Output(1200, GAME, 0)]
    ).signAll(PRIV1);
    const tx2 = Tx.transfer(
      [
        new Input(
          new Outpoint(
            '0x7777777777777777777777777777777777777777777777777777777777777777',
            0
          )
        ),
      ],
      [new Output(1000, GAME, 0)]
    ).signAll(PRIV2);
    const tx3 = Tx.transfer(
      [
        new Input(
          new Outpoint(
            '0x7777777777777777777777777777777777777777777777777777777777777777',
            0
          )
        ),
      ],
      [new Output(1000, GAME, 0)]
    ).signAll(PRIV3);
    const distribution = calcDistribution(
      {
        [P1]: 1,
        [P2]: 0,
      },
      [
        {
          outpoint: new Outpoint(tx1.hash(), 0),
          output: tx1.outputs[0].toJSON(),
        },
        {
          outpoint: new Outpoint(tx2.hash(), 0),
          output: tx2.outputs[0].toJSON(),
        },
        {
          outpoint: new Outpoint(tx3.hash(), 0),
          output: tx3.outputs[0].toJSON(),
        },
      ],
      [
        {
          from: P1,
          value: 1200,
        },
        {
          from: P2,
          value: 1000,
        },
        {
          from: P3,
          value: 1000,
        },
      ]
    );
    expect(distribution.outputs[0].toJSON()).toEqual({
      color: 0,
      value: 2200,
      address: P1,
    });
    expect(distribution.outputs[1].toJSON()).toEqual({
      color: 0,
      value: 1000,
      address: P3,
    });
    expect(distribution.outputs.length).toBe(2);
  });
});
