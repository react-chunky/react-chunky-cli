var config = require("../config");
var logger = require("../lib/logger");
var runner = require("../lib/runner");

function parseCommand(command) {
    logger.info("Starting the iOS app")
    runner.reactNativeRun("ios")
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        logger.error(error)
    }
}
