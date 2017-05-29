const logger = require("../core/logger")
const coreutils = require('coreutils')

function parseCommand(command) {
    logger.info("⇨ Updating Chunky")
    coreutils.run.npm(["i", "-gf", "react-chunky-cli"])
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        logger.error(error)
    }
}