const MINE_RATE = 1000;

const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
  index: "0",
  timestamp: "1",
  data: "-----",
  hash: "hash-one",
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: [],
};

module.exports = { GENESIS_DATA, MINE_RATE };
