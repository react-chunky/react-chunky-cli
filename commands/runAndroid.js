const coreutils = require('coreutils')

function parseCommand(command) {
    coreutils.logger.info("Starting the Android app")
    coreutils.run.reactNativeRun("android")
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        coreutils.logger.error(error)
    }
}
