const coreutils = require('coreutils')
const common = require('../../common')
const load = require('./load')
const apply = require('./apply')

function parseCommand(command) {
    var config = common.loadSecureConfig()

    if (!config || !config.cloud[command.env]) {
        throw new Error(`Invalid secure cloud configuration or invalid cloud environment ${command.env}`)
    }

    // The environment-specific configuration
    config = config.cloud[command.env]

    coreutils.logger.info(`Transforming the ${command.env} cloud environment ...`)

    // First, load the transforms we care about
    const transforms = load(command.chunks.filter(c => c), command.transforms)

    // Next, apply them
    apply(config, transforms)
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        coreutils.logger.error(error)
    }
}