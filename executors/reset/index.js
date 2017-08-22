const coreutils = require('coreutils')
const loaders = require('../../src/loaders')
const users = require('./users')
const data = require('./data')
const firebase = require("firebase-admin")

function initialize(config) {
    if (!config.firebase || !config.firebase.serviceAccount) {
        throw new Error('Invalid Firebase secure configuration')
    }

    firebase.initializeApp({
        credential: firebase.credential.cert(config.firebase.serviceAccount),
        databaseURL: "https://" + config.firebase.serviceAccount.project_id + ".firebaseio.com"
    })
}

function resetChain(index) {
    // If we want to reset the users layer, let's do that first
    var chain = (index.users ? users(firebase) : Promise.resolve())

    // If we've got a data layer to reset, let's do that next
    return (index.data ? chain.then(() => data(firebase)) : chain)
}

function parseCommand(command) {
    var config = loaders.loadSecureConfig()
 
     if (!config || !config.cloud[command.env]) {
        throw new Error(`Invalid secure cloud configuration or invalid cloud environment ${command.env}`)
    }

    // The environment-specific configuration
    config = config.cloud[command.env]

    // First, find the layers we care about
    if (command.layers.length == 0) {
        command.layers = ["users", "data"]
    }

    initialize(config)

    var index = {}
    command.layers.map(layer => (index[layer] = true))

    coreutils.logger.header(`Resetting the ${command.env} cloud environment`)

    resetChain(index).then(() => {
        coreutils.logger.footer(`The ${command.env} cloud environment is now reset`)
        process.exit(0)
    }).catch(e => {
        coreutils.logger.error(e)
        process.exit(1)
    })
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        coreutils.logger.error(error)
    }
}