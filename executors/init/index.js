const coreutils = require('coreutils')
const product = require('./product')

function setup () {
}

function parseCommand(command) {
    if (!command.name) {
        command.name = "MyChunkyProduct"
    }

    product.create(command.name, command.template)
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        coreutils.logger.error(error)
    }
}
