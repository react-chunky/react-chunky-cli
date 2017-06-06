const coreutils = require('coreutils')

function parseCommand(command) {
    coreutils.logger.info("Starting the iOS app")
    coreutils.run.reactNativeRun("ios")
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        coreutils.logger.error(error)
    }
}
