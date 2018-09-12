const ADDR_REGEX = /0x[A-Fa-f0-9]{40}/;

const last = (arr, n = 1) => arr[arr.length - n];

const not = fn => (...args) => !fn(...args);

const isPendingRound = round =>
  !round.result ||
  round.result[round.players[0]] === undefined ||
  round.result[round.players[1]] === undefined;

exports.last = last;
exports.not = not;
exports.isPendingRound = isPendingRound;
exports.ADDR_REGEX = ADDR_REGEX;
