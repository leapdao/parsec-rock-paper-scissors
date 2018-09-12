const { Tx, Input, Output, Outpoint } = require('parsec-lib');
const calcDistribution = require('./calcDistribution');

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

  test('with real-life data', () => {
    const scores = {
      '0x4ddf6cc901e0b7652939503a73b474ba952a2950': 1,
      '0x82282f19c3d26a2d89f5184cb6652ca8e57e3fc3': 0,
    };
    const unspent = [
      {
        output: {
          address: '0xb549eda70d3765d5e978f2c761650cb29d4683f3',
          value: 3500,
          color: 0,
        },
        outpoint: new Outpoint(
          '0xb2d5d8f5469b4a80a11abcb1d61b8479b12389d82c6e0cfde4b064c4b9c08742',
          0
        ),
      },
      {
        output: {
          address: '0xb549eda70d3765d5e978f2c761650cb29d4683f3',
          value: 3500,
          color: 0,
        },
        outpoint: new Outpoint(
          '0xd1c3af2e2062c5aac7c1475314041674efaabcfa86ad85d6843cceb2437470c0',
          0
        ),
      },
    ];
    const transactions = [
      {
        hash:
          '0xb2d5d8f5469b4a80a11abcb1d61b8479b12389d82c6e0cfde4b064c4b9c08742',
        from: '0x4DDF6CC901e0B7652939503A73B474ba952a2950',
        raw:
          '0x03420e36a85475c4ed765d07bc51b9779635ce94750415613022b6e369e638cff697018bdb4be790d85f39a78ce393272926b0a08bfc9e77a97b8aee43bbb3e2265b9934674e1821e5628d59e899c31eec8dd7855df6c6d0459ff8f0162a64f1ee334d1b6de10ee56c8b592d637dd54f89b0ec1f2d40d734e61fe621098261f87c09c6ea008bdb4be790d85f39a78ce393272926b0a08bfc9e77a97b8aee43bbb3e2265b9934674e1821e5628d59e899c31eec8dd7855df6c6d0459ff8f0162a64f1ee334d1bdb4d64b220d510f54299fc37c683d1f7dcb5fd8f590a20c09cdad61b4c4ac893018bdb4be790d85f39a78ce393272926b0a08bfc9e77a97b8aee43bbb3e2265b9934674e1821e5628d59e899c31eec8dd7855df6c6d0459ff8f0162a64f1ee334d1b34ed96a4c742054c1758403f82a8e2ccaca3b8ab6c5df62d8c891ef17cca4fc4008bdb4be790d85f39a78ce393272926b0a08bfc9e77a97b8aee43bbb3e2265b9934674e1821e5628d59e899c31eec8dd7855df6c6d0459ff8f0162a64f1ee334d1b0000000000000000000000000000000000000000000000000000000000000dac0000b549eda70d3765d5e978f2c761650cb29d4683f3000000000000000000000000000000000000000000000000000000000000251c00004ddf6cc901e0b7652939503a73b474ba952a2950',
        blockHash:
          '0xfa808f212c7c211297858da1f404e35e537d1e4eebf1bef02e008c759d39db68',
        blockNumber: 117,
        transactionIndex: 0,
        value: '3500',
        to: '0xB549eda70D3765d5E978f2C761650CB29d4683f3',
        gas: 0,
        gasPrice: '0',
        nonce: undefined,
      },
      {
        hash:
          '0xd1c3af2e2062c5aac7c1475314041674efaabcfa86ad85d6843cceb2437470c0',
        from: '0x82282F19C3D26A2d89F5184Cb6652CA8e57e3Fc3',
        raw:
          '0x03420e36a85475c4ed765d07bc51b9779635ce94750415613022b6e369e638cff69700b40d5f3c130512197a928b39a532c0413fc9adef9c4f4dcbd0a21ee6c5ff4bba0c3b9d27fd2bf14ea49e2a2b2c79168b695551a19b9262ce947f9c56f758ffe51c59c1e14a6cb7c193f6408314090395dfcc41c224a00f20dbb6176377848ab7af00b40d5f3c130512197a928b39a532c0413fc9adef9c4f4dcbd0a21ee6c5ff4bba0c3b9d27fd2bf14ea49e2a2b2c79168b695551a19b9262ce947f9c56f758ffe51cdb4d64b220d510f54299fc37c683d1f7dcb5fd8f590a20c09cdad61b4c4ac89300b40d5f3c130512197a928b39a532c0413fc9adef9c4f4dcbd0a21ee6c5ff4bba0c3b9d27fd2bf14ea49e2a2b2c79168b695551a19b9262ce947f9c56f758ffe51c6814e5b8ead44dcba1182a7f21eb88401e4403f003f5bc42a1e74b7dc4611f5101b40d5f3c130512197a928b39a532c0413fc9adef9c4f4dcbd0a21ee6c5ff4bba0c3b9d27fd2bf14ea49e2a2b2c79168b695551a19b9262ce947f9c56f758ffe51c0000000000000000000000000000000000000000000000000000000000000dac0000b549eda70d3765d5e978f2c761650cb29d4683f30000000000000000000000000000000000000000000000000000000000000258000082282f19c3d26a2d89f5184cb6652ca8e57e3fc3',
        blockHash:
          '0x7e2bf0c9f3c1092d05263287fda42bb0d7ef2662bb8c342ecb657a95a76a052a',
        blockNumber: 120,
        transactionIndex: 0,
        value: '3500',
        to: '0xB549eda70D3765d5E978f2C761650CB29d4683f3',
        gas: 0,
        gasPrice: '0',
        nonce: undefined,
      },
    ];
    const distribution = calcDistribution(scores, unspent, transactions);
    expect(distribution.outputs[0].value).toBe(7000);
    expect(distribution.outputs[0].address).toBe(
      '0x4ddf6cc901e0b7652939503a73b474ba952a2950'
    );
    expect(distribution.outputs[0].color).toBe(0);
    expect(distribution.outputs.length).toBe(1);
  });
});
