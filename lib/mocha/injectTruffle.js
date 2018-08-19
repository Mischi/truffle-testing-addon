const TruffleTest = require("../TruffleTest");

function injectTruffle(tests) {
  let truffleTest;

  return function() {
    describe("with truffle", function() {
      before(function(done) {
        TruffleTest.instance().then(instance => {
          truffleTest = instance;
          this.timeout(truffleTest.runner.BEFORE_TIMEOUT);
          truffleTest.runner.initialize(done);
        });
      });

      beforeEach(function(done) {
        truffleTest.runner.startTest(this, done);
      });

      afterEach(function(done) {
        truffleTest.runner.endTest(this, done);
      });

      tests();
    });
  };
}

module.exports = injectTruffle;
