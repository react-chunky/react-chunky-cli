const coreutils = require('coreutils')

module.exports = function(port) {
    coreutils.logger.info(`Starting the Web app on port ${port} ...`)
}