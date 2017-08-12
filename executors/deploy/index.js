const coreutils = require('coreutils')
const loaders = require('../../src/loaders')
const assets = require('./assets')
const functions = require('./functions')
const path = require('path')
const fs = require('fs-extra')

function initialize(config, command) {
    if (!config.aws || !config.aws) {
        throw new Error('Invalid AWS secure configuration')
    }

    // Let's get ready to use AWS
    process.env.AWS_ACCESS_KEY_ID=config.aws.key
    process.env.AWS_SECRET_ACCESS_KEY=config.aws.secret
    process.env.AWS_DEFAULT_REGION=config.aws.region

    // Prepare the deploy path
    const id = coreutils.string.uuid()
    const date = new Date()
    const timestamp = date.getTime()

    const deployPath = path.resolve(process.cwd(), '.chunky', 'deployments', id)
    if (!fs.existsSync(deployPath)) {
        fs.mkdirsSync(deployPath)
    }

    // Create a fingerprint
    const fingerprint = { id, date, timestamp, remove: command.remove, env: command.env, chunks: command.chunks.filter(c => c) }
    fs.writeFileSync(path.resolve(deployPath, 'fingerprint.json'), JSON.stringify(fingerprint, null, 2))

    return Object.assign({ dir: deployPath }, fingerprint)
}

function deployChain(index, deployment) {
    // If we want to deploy the assets, let's do that first
    var chain = (index.assets ? assets(deployment) : Promise.resolve())

    // If we've got functions to deploy, let's do that next
    return (index.functions ? chain.then(() => functions(deployment)) : chain)
}

function parseCommand(command) {
    var config = loaders.loadSecureConfig()
 
     if (!config || !config.cloud[command.env]) {
        throw new Error(`Invalid secure cloud configuration or invalid cloud environment ${command.env}`)
    }

    // The environment-specific configuration
    config = config.cloud[command.env]

    // First, find the artifacts we care about
    if (command.artifacts.length == 0) {
        command.artifacts = ["assets", "functions"]
    }

    var artifacts = command.artifacts.filter(artifact => (artifact === 'assets' || artifact === 'functions'))
    if (!artifacts || artifacts.length === 0) {
        coreutils.logger.skip(`Skipping - no valid artifacts requested`)
        process.exit(0)
    }

    // Setup a new deployment
    const deployment = initialize(config, command)

    var index = {}
    command.artifacts.forEach(artifact => (index[artifact] = true))

    coreutils.logger.header(`Starting new deployment to the ${command.env} cloud environment`)

    deployChain(index, deployment).then(() => {
        coreutils.logger.footer(`The ${command.env} cloud environment is now ready`)
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