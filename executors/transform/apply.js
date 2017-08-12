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

function batchNextOperations(groups, chunk) {
    if (!groups || groups.length === 0) {
        return Promise.resolve()
    }

    const nextGroup = groups[0]
    const nextOperations = chunk.operations[nextGroup]

    if (!nextOperations || nextOperations.length === 0) {
        throw new Error(`Missing ${group} operations`)
    }

    return executeOperations(nextOperations).
        then(result => {
           coreutils.logger.ok(`Finished ${nextGroup} operations`)
           return batchNextOperations(groups.slice(1), chunk)
        }).
        catch(error => {
           coreutils.logger.skip(`Skipped ${nextGroup} operations`)
        })
}

function performChunkOperations(chunk) {
    const groups = Object.keys(chunk.operations)
    return batchNextOperations(groups, chunk)
}

function applyTransforms(transforms) {
    if (!transforms || transforms.length === 0) {
        return Promise.resolve()
    }

    const nextChunk = transforms[0]
    coreutils.logger.info(`Applying the ${nextChunk.chunk} ${nextChunk.transform} transform ...`)
    return performChunkOperations(nextChunk).then(() => {
        coreutils.logger.done()
        return applyTransforms(transforms.slice(1))
    })
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
    
    var all = []

    for(const chunkName in transforms) {
        for(const transformName in transforms[chunkName]) {
            const transform = transforms[chunkName][transformName]
            all.push(Object.assign({ chunk: chunkName, transform: transformName, priority: 999 }, transform))
        }
    }

    // Sort by priority
    all.sort((a, b) => (a.priority - b.priority))
    return applyTransforms(all)
}