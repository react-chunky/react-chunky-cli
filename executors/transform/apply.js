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

function batchNextOperations(groups, transform) {
    if (!groups || groups.length === 0) {
        return Promise.resolve()
    }

    const nextGroup = groups[0]
    const nextOperations = transform.data[nextGroup]

    if (!nextOperations || nextOperations.length === 0) {
        throw new Error(`Missing ${group} operations`)
    }

    return executeOperations(nextOperations).
        then(result => {
           coreutils.logger.ok(`Finished ${nextGroup} operations`)
           return batchNextOperations(groups.slice(1), transform)
        }).
        catch(error => {
           coreutils.logger.skip(`Skipped ${nextGroup} operations (${error.message})`)
        })
}

function performChunkOperations(transform) {
    const groups = Object.keys(transform.data)
    return batchNextOperations(groups, transform)
}

function applyTransforms(transforms) {
    if (!transforms || transforms.length === 0) {
        return Promise.resolve()
    }

    const nextTransform = transforms[0]
 
    coreutils.logger.info(`Applying the ${nextTransform.chunk} ${nextTransform.name} transform ...`)
    return performChunkOperations(nextTransform).then(() => {
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
    
    return applyTransforms(transforms)
}