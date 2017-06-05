const path = require('path')
const fs = require('fs-extra')
const recursive = require("recursive-readdir")
const URL = require('url-parse')
const coreutils = require('coreutils')

function parseCommand(command) {
    // Figure out the expected paths
    const chunkyPackageFile = path.resolve(process.cwd(), 'chunky.json')
    const modulePackageFile = path.resolve(process.cwd(), 'package.json')
    const chunksDir = path.resolve(process.cwd(), 'chunks')

    if (!fs.existsSync(chunkyPackageFile) || 
        !fs.existsSync(modulePackageFile) || 
        !fs.existsSync(chunksDir)) {
        throw new Error('This does not look like a Chunky app') 
    }

    // Load up the Chunky package for this app
    const chunkyPackage = JSON.parse(fs.readFileSync(chunkyPackageFile, 'utf8'))
    
    if (!chunkyPackage) {
        throw new Error("The Chunky package seems invalid")
    }

    // Let's look at some of the main application indicators
    const sections = chunkyPackage.sections
    const chunks = chunkyPackage.chunks
    const transitions = chunkyPackage.transitions

    // Print out a friendly list of all app sections
    coreutils.logger.info(`Sections:`)
    for(const sectionName in sections) {
        coreutils.logger.ok(` ↳ ${sectionName}`)        
    }

    // Print out a friendly list of all app chunks
    coreutils.logger.info(`Chunks:`)
    const chunkNames = fs.readdirSync(chunksDir)
    chunkNames.forEach(chunkName => {
        if (chunkName === 'index.js') return
        coreutils.logger.ok(` ↳ ${chunkName}`)        
    })

    // Print out a friendly list of all app global transitions
    coreutils.logger.info(`Transitions:`)
    transitions.forEach(transition => {
        const url = new URL(transition, true)
        const name = url.hash.substring(1)
        coreutils.logger.ok(` ↳ ${name}`)        
    })
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        coreutils.logger.error(error)
    }
}