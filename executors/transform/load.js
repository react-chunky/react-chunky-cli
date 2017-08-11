const firebase = require("firebase-admin")
const fs = require('fs-extra')
const path = require('path')
const yaml = require('js-yaml')
const coreutils = require('coreutils')

function loadChunkTransforms(chunk, transforms) {
    const transformsDir = path.resolve(process.cwd(), 'chunks', chunk, 'transforms')

    if (!fs.existsSync(transformsDir)) {
        // This chunk has no transforms
        return {}
    }

    if (transforms.length === 0) {
        // We want all the transforms in this chunk
        transforms = fs.readdirSync(transformsDir).map(file => path.basename(file, '.yaml'))
    }

    var all = {}

    // Look up all valid transforms
    transforms.forEach(transform => {
        if (!fs.existsSync(path.resolve(transformsDir, transform + ".yaml"))) {
            return
        }

        const transformPath = path.resolve(process.cwd(), 'chunks', chunk, 'transforms', transform + ".yaml")

        if (!fs.existsSync(transformPath)) {
            return
        }   

        // Load all operations
        const ops = yaml.safeLoad(fs.readFileSync(transformPath, 'utf8'));
        
        if (!ops || Object.keys(ops).length === 0) {
            return
        }

        all[transform] = ops
    })

    return all
}

module.exports = function(chunks, transforms) {
    // Figure out the chunks we need to look into
    if (chunks.length === 0) {
        chunks = fs.readdirSync(path.resolve(process.cwd(), "chunks")).filter(dir => (dir && dir !== 'index.js'))
    }

    var all = {}
    chunks.forEach(chunk => {
        all[chunk] = loadChunkTransforms(chunk, transforms)
    })

    return all
}