const coreutils = require('coreutils')
const path = require('path')
const fs = require('fs-extra')
const yaml = require('js-yaml')
const firebaseline = require('firebaseline')
const firebase = require('firebase')
const common = require('../common')

function executeOperations(operations) {
    return Promise.all(operations.map(args => {
        const name = args.operation
        const operation = firebaseline.operations[name]
        if (!operation) {
            // Ignore invalid operationss
            return
        }

        delete args.operation
        return operation(firebase, args)
    }))
}

function executeLine(groups, user) {
    if (!groups || groups.length === 0) {
        coreutils.logger.info(`All done.`)
        process.exit()
        return 
    }

    const next = groups[0]
    coreutils.logger.info(`[${next.name}]`)
    executeOperations(next.operations).
    then(result => {
        coreutils.logger.ok(`↳ Done.`)
        executeLine(groups.slice(1), user)
    }).
    catch(error => {
        coreutils.logger.error(error)
        process.exit(1)
    })
}

function executeBase(profile, adminPass, base, groups) {
    if (!base || !base.groups) {
        throw new Error('Missing groups')
    }

    var filter = []
    for(const groupName in base.groups) {
        const operations = base.groups[groupName]
        if (!operations || (groups && !groups[groupName])) {
            continue
        }

        filter.push({ name: groupName, operations })
    }

    if (filter.length === 0) {
        throw new Error("No groups specified")
    }

    // Let's make sure Firebase is up and running
    initializeFirebase(profile, adminPass).

    then((user) => {    
        coreutils.logger.ok(`↳ Ready to go (as ${user ? user.email : 'guest'})`)

        // And then take care of the desired groups
        executeLine(filter, user)
    }).catch(error => {
        coreutils.logger.error(error)
        coreutils.logger.ok(`↳ Trying as guest`)
        // And then take care of the desired groups no
        executeLine(filter)
    })
}

function initializeFirebase(profile, adminPass) {
    // Look for the configuration
    const secureConfig = common.loadSecureConfig()
    

    if (!secureConfig.firebase || !secureConfig.firebase[profile]) {
        throw new Error("Invalid Firebase configuration")
    }

    coreutils.logger.info("Initializing Firebase (" + profile + ")")

    const config = secureConfig.firebase[profile]
    firebase.initializeApp({
       apiKey: config.apiKey,
       authDOmain: config.projectId + ".firebaseapp.com",
       databaseURL: "https://" + config.projectId + ".firebaseio.com"
    })

    if (!adminPass || !config.adminEmail) {
        // No need to login
        return Promise.resolve()
    }

    // Login if we've got credentials
    return firebase.auth().signInWithEmailAndPassword(config.adminEmail, adminPass)
}

function parseCommand(command) {
    if (!command.options.profile) {
        throw new Error("Please specify a profile")
    }

    // The project directory
    const dir = path.resolve(process.cwd())

    // Look for the firebaseline file
    const file = path.resolve(dir, 'firebaseline.yaml')

    if (!fs.existsSync(file)) {
        // We can't continue without this file
        throw new Error('The firebaseline.yaml file is missing')
    }

    const base = yaml.safeLoad(fs.readFileSync(file, 'utf8'));

    const groups = (command.options.groups ? command.options.groups.split(',') : undefined)
    var groupsIndex = undefined
    if (groups) {
        groupsIndex = {}
        groups.forEach(group => groupsIndex[group] = true)
    }

    executeBase(command.options.profile, command.options.adminPass, base, groupsIndex)
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        coreutils.logger.error(error)
    }
}
