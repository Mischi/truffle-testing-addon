const TruffleTest = require('../TruffleTest');

function createCleanRoomEnv() {
  let truffleTest;

  beforeAll(done => {
    TruffleTest.instance().then(instance => {
      truffleTest = instance;
      truffleTest.runner.initialize(done);
    });
  });

  beforeEach(done => {
    truffleTest.runner.startTest(null, done);
  });

  afterEach(done => {
    const result = {
      currentTest: {
        state: "success"
      }
    };
    truffleTest.runner.endTest(result, done);
  });
}

module.exports = createCleanRoomEnv;
