const TruffleTest = require("../TruffleTest");

function setup() {
  before(function() {
    this.timeout(10000);
    return TruffleTest.instance();
  });

  after(function() {
    return TruffleTest.cleanup();
  });
}

module.exports = setup;
