const logger = require("../core/logger");
const coreutils = require('coreutils')

function parseCommand(command) {
    logger.info("Starting the Android app")
    coreutils.run.reactNativeRun("android")
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        logger.error(error)
    }
}
