const fs = require("fs");
const OS = require("os");

const Config = require("truffle-config");
const Artifactor = require("truffle-artifactor");
const Environment = require("truffle-core/lib/environment");
const Develop = require("truffle-core/lib/develop");
const copy = require("truffle-core/lib/copy");
const temp = require("temp");

function getConfig() {
  const config = Config.detect({ workingDirectory: process.cwd() });

  // if "development" exists, default to using that for testing
  if (!config.network && config.networks.development) {
    config.network = "development";
  }

  if (!config.network) {
    config.network = "test";
  }

  return config;
}

function start(done) {
  const config = getConfig();

  let ipcDisconnect;

  temp.mkdir("test-", function(err, temporaryDirectory) {
    if (err) return done(err);

    function cleanup() {
      const args = arguments;
      // Ensure directory cleanup.
      temp.cleanup(function(err) {
        // Ignore cleanup errors.
        //done.apply(null, args);
        if (ipcDisconnect) {
          ipcDisconnect();
        }
      });
    }

    function run2() {
      // Set a new artifactor; don't rely on the one created by Environments.
      // TODO: Make the test artifactor configurable.
      config.artifactor = new Artifactor(temporaryDirectory);

      done(
        null,
        config.with({
          test_files: [],
          contracts_build_directory: temporaryDirectory
        }),
        cleanup
      );
    }

    const environmentCallback = function(err) {
      if (err) return done(err);
      // Copy all the built files over to a temporary directory, because we
      // don't want to save any tests artifacts. Only do this if the build directory
      // exists.
      fs.stat(config.contracts_build_directory, function(err, stat) {
        if (err) return run2();

        copy(config.contracts_build_directory, temporaryDirectory, function(
          err
        ) {
          if (err) return done(err);

          config.logger.log("Using network '" + config.network + "'." + OS.EOL);

          run2();
        });
      });
    };

    if (config.networks[config.network]) {
      Environment.detect(config, environmentCallback);
    } else {
      const ipcOptions = {
        network: "test"
      };

      const testrpcOptions = {
        host: "127.0.0.1",
        port: 7545,
        network_id: 4447,
        mnemonic:
          "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
        gasLimit: config.gas
      };

      Develop.connectOrStart(ipcOptions, testrpcOptions, function(
        started,
        disconnect
      ) {
        ipcDisconnect = disconnect;
        Environment.develop(config, testrpcOptions, environmentCallback);
      });
    }
  });
}

module.exports = start;