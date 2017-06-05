const coreutils = require('coreutils')

function parseCommand(command) {
    coreutils.logger.info("Starting the React Native packager")
    coreutils.run.npm(["start"])
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        coreutils.logger.error(error)
    }
}
