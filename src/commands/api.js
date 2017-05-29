var config = require("../config");
var logger = require("../lib/logger");
var runner = require("../lib/runner");

function parseCommand(command) {
    throw new Error("Cannot start the local API - just yet. Stay tuned.")
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        logger.error(error)
    }
}
