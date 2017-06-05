const coreutils = require('coreutils')

function parseCommand(command) {
    coreutils.logger.info("Updating Chunky")
    coreutils.run.npm(["i", "-gf", "react-chunky-cli"])
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        coreutils.logger.error(error)
    }
}