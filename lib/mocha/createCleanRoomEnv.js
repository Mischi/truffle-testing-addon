const TruffleTest = require("../TruffleTest");

function createCleanRoomEnv() {
  let truffleTest;

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
}

module.exports = createCleanRoomEnv;
