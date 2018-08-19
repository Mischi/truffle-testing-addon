const NodeEnvironment = require("jest-environment-node");
const TruffleTest = require("../TruffleTest");

class TruffleEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();
    this.global.truffleTest = await TruffleTest.instance();
  }
}

module.exports = TruffleEnvironment;
