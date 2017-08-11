const coreutils = require('coreutils')

module.exports = function(port) {
    coreutils.logger.info(`Starting the Static Site on port ${port} ...`)
}