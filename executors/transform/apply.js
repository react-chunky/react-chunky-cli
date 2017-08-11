const firebase = require("firebase-admin")
const path = require('path')
const yaml = require('js-yaml')
const fs = require('fs-extra')
const coreutils = require('coreutils')
const firebaseline = require('firebaseline')

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

function batchNextOperations(groups, operations) {
    if (!groups || groups.length === 0) {
        return Promise.resolve()
    }

    const nextGroup = groups[0]
    const nextOperations = operations[nextGroup]

    if (!nextOperations || nextOperations.length === 0) {
        throw new Error(`Missing ${group} operations`)
    }

    return executeOperations(nextOperations).
        then(result => {
            coreutils.logger.ok(`↳ Completed ${nextGroup} operations (${nextOperations.length})`)
           return batchNextOperations(groups.slice(1), operations)
        }).
        catch(error => {
            coreutils.logger.error(error)
            process.exit(1)
        })
}

function applyChunkTransform(chunk, transform, ops) {
    const groups = Object.keys(ops)
    return batchNextOperations(groups, ops)
}

function initialize(config) {
    if (!config.firebase || !config.firebase.serviceAccount) {
        throw new Error('Invalid Firebase secure configuration')
    }

    firebase.initializeApp({
        credential: firebase.credential.cert(config.firebase.serviceAccount),
        databaseURL: "https://" + config.firebase.serviceAccount.project_id + ".firebaseio.com"
    })
}

module.exports = function(config, transforms) {
    initialize(config)
    
    for(const chunk in transforms) {
        for(const transform in transforms[chunk]) {
            applyChunkTransform(chunk, transform, transforms[chunk][transform])
        }
    }
}