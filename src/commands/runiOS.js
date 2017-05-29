const logger = require("../core/logger");
const coreutils = require('coreutils')

function parseCommand(command) {
    logger.info("Starting the iOS app")
    coreutils.run.reactNativeRun("ios")
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        logger.error(error)
    }
}
