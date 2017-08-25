const firebase = require("firebase-admin")
const path = require('path')
const yaml = require('js-yaml')
const fs = require('fs-extra')
const coreutils = require('coreutils')
const firebaseline = require('firebaseline')

function executeOperations(services, operations) {
    return Promise.all(operations.map(args => {
        const name = args.operation
        const operation = firebaseline.operations[name]
        if (!operation) {
            // Ignore invalid operationss
            return
        }
        delete args.operation
        return operation(services.firebase, args)
    }))
}

function batchNextOperations(services, groups, transform) {
    if (!groups || groups.length === 0) {
        return Promise.resolve()
    }

    const nextGroup = groups[0]
    const nextOperations = transform.data[nextGroup]

    if (!nextOperations || nextOperations.length === 0) {
        throw new Error(`Missing ${group} operations`)
    }

    return executeOperations(services, nextOperations).
        then(result => {
           coreutils.logger.ok(`Finished ${nextGroup} operations`)
           return batchNextOperations(services, groups.slice(1), transform)
        }).
        catch(error => {
           coreutils.logger.skip(`Skipped ${nextGroup} operations (${error.message})`)
        })
}

function performChunkOperations(services, transform) {
    const groups = Object.keys(transform.data)
    return batchNextOperations(services, groups, transform)
}

function applyTransforms(services, transforms) {
    if (!transforms || transforms.length === 0) {
        return Promise.resolve()
    }

    const nextTransform = transforms[0]

    coreutils.logger.info(`Applying the ${nextTransform.chunk} ${nextTransform.name} transform ...`)
    return performChunkOperations(services, nextTransform).then(() => {
        coreutils.logger.done()
        return applyTransforms(services, transforms.slice(1))
    })
}

module.exports = applyTransforms
