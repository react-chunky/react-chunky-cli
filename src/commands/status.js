const logger = require("../core/logger")

function parseCommand(command) {
    logger.info("OK")
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        logger.error(error)
    }
}