const TruffleTest = require("../TruffleTest");

module.exports = async function teardown() {
  await TruffleTest.cleanup();
};
