const logger = require("../core/logger");
const coreutils = require('coreutils')

function parseCommand(command) {
    logger.info("Starting the React Native packager")
    coreutils.run.npm(["start"])
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        logger.error(error)
    }
}
