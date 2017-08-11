const coreutils = require('coreutils')

module.exports = function(port) {
    coreutils.logger.info(`Starting the web packager on port ${port} ...`)    
    coreutils.run.async("node", ["node_modules/react-dom-chunky/bin/start.js", port])
}