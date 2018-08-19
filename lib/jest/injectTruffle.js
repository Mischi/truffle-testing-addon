const TruffleTest = require('../TruffleTest');

function injectTruffle(tests) {
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

  return tests;
}

module.exports = injectTruffle;
