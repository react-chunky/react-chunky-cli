var config = require("../config");
var logger = require("../lib/logger");
var runner = require("../lib/runner");

function parseCommand(command) {
    logger.info("Starting the Android app")
    runner.reactNativeRun("android")
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        logger.error(error)
    }
}
