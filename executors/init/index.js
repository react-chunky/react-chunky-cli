const coreutils = require('coreutils')
const create = require('./create')

function parseCommand(command) {
    if (!command.name) {
        command.name = "MyChunkyProduct"
    }
    
    create(command.name, command.template) 
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        coreutils.logger.error(error)
    }
}