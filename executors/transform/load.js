const firebase = require("firebase-admin")
const fs = require('fs-extra')
const path = require('path')
const yaml = require('js-yaml')
const coreutils = require('coreutils')
const loaders = require('../../src/loaders')

function loadChunkTransforms(chunk, transforms) {
    try {
        // Look up the config file for this chunk
        const config = loaders.loadChunkConfig(chunk)

        if (!config.transforms || config.transforms.length === 0) {
            // No transforms defined
            return {}
        }

        // Look up the transforms dir
        const transformsDir = path.resolve(process.cwd(), 'chunks', chunk, 'transforms')

        if (!fs.existsSync(transformsDir)) {
            // This chunk has no transforms, even if it declared some
            return {}
        }
        
        if (transforms.length === 0) {
            // We want all the transforms in this chunk
            transforms = config.transforms
        } else {
            transforms = transforms.filter(t => {
                var found = false
                config.transforms.forEach(t2 => {
                    if (t === t2) {
                        found = true
                        return
                    }
                })
                return found
            })
        }


        var all = {}

        // Look up all valid transforms
        transforms.forEach(transform => {
            const transformFile = path.resolve(transformsDir, transform + ".yaml")

            if (!fs.existsSync(transformFile)) {
                return
            }

            // Load all operations
            const data = yaml.safeLoad(fs.readFileSync(transformFile, 'utf8'));
            
            if (!data || Object.keys(data).length === 0) {
                return
            }

            all[transform] = data
        })

        return all
    } catch (e) {
        console.log(e)
        return {}
    }
}

module.exports = function(chunks, transforms) {
    // Figure out the chunks we need to look into
    if (chunks.length === 0) {
        chunks = fs.readdirSync(path.resolve(process.cwd(), "chunks")).filter(dir => (dir && dir !== 'index.js'))
    }

    var all = {}
    chunks.forEach(chunk => {
        const data = loadChunkTransforms(chunk, transforms)
        if (data && Object.keys(data).length > 0) {
            all[chunk] = data
        }
    })

    if (Object.keys(all).length === 0) {
        return 
    }

    return all
}