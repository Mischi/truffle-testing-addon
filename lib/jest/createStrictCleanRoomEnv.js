const TruffleTest = require('../TruffleTest');

function createCleanRoomEnv() {
  let truffleTest;

  beforeEach(done => {
    TruffleTest.instance().then(instance => {
      truffleTest = instance;
      truffleTest.runner.initialize(() => {
        truffleTest.runner.startTest(null, done);
      });
    });
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
