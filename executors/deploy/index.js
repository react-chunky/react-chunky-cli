const coreutils = require('coreutils')

function parseCommand(command) {
    coreutils.logger.info("Deploying")
    console.log(command)
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        coreutils.logger.error(error)
    }
}