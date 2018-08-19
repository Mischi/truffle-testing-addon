const TestRunner = require("truffle-core/lib/testing/testrunner");
const TestResolver = require("truffle-core/lib/testing/testresolver");
const TestSource = require("truffle-core/lib/testing/testsource");
const Resolver = require("truffle-resolver");
const Migrate = require("truffle-migrate");
const Config = require("truffle-config");
const start = require("./helpers");
const { createWeb3, getAccounts } = require("./web3");

class TruffleTest {
  static performInitialDeploy(config, resolver) {
    return new Promise(function(accept, reject) {
      Migrate.run(
        config.with({
          reset: true,
          resolver: resolver,
          quiet: true
        }),
        function(err) {
          if (err) return reject(err);
          accept();
        }
      );
    });
  }

  static instance() {
    if (TestRunner._instance) {
      return TestRunner._instance;
    }

    TestRunner._instance = new Promise((resolve, reject) => {
      start((err, options, cleanup) => {
        if (err) {
          console.error(err);
          reject(err);
        }

        const config = Config.default().merge(options);
        const web3 = createWeb3(config.provider);

        // TODO: still needed in testrunner.js:130
        global.web3 = web3;

        getAccounts(web3).then(
          accounts => {
            if (!config.from) {
              config.from = accounts[0];
            }

            if (!config.resolver) {
              config.resolver = new Resolver(config);
            }

            const test_resolver = new TestResolver(
              config.resolver,
              new TestSource(config),
              config.contracts_build_directory
            );
            test_resolver.cache_on = false;

            TruffleTest.performInitialDeploy(config, test_resolver).then(() => {
              resolve(
                new TruffleTest({
                  config,
                  web3,
                  accounts,
                  test_resolver,
                  cleanup
                })
              );
            });
          },
          error => {
            console.error(error);
            reject(error);
          }
        );
      });
    });

    return TestRunner._instance;
  }

  static async cleanup() {
    (await TruffleTest.instance()).cleanup();
  }

  constructor(options) {
    Object.assign(this, options);

    this.runner = new TestRunner(this.config);
  }

  get artifacts() {
    return {
      require: import_path => {
        return this.test_resolver.require(import_path);
      }
    };
  }

  addHooks(mocha, done) {
    const self = this;

    mocha.timeout(self.runner.BEFORE_TIMEOUT);

    self.runner.initialize(done);

    beforeEach("before test", function(done) {
      self.runner.startTest(this, done);
    });

    afterEach("after test", function(done) {
      self.runner.endTest(this, done);
    });
  }
}

module.exports = TruffleTest;
