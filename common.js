const path = require('path')
const fs = require('fs-extra')

function loadSecureConfig() {
    // The project directory
    const dir = path.resolve(process.cwd())

    // Look for the security file file
    const file = path.resolve(dir, '.chunky.json')
    
    if (!fs.existsSync(file)) {
        // We can't continue without this file
        throw new Error('The Chunky security file is missing')
    }

    // Load the configuration
    var secureConfig = fs.readFileSync(file, 'utf8')

    if (!secureConfig) {
        throw new Error('The Chunky security file is invalid')
    }

    // Parse the json content
    secureConfig = JSON.parse(secureConfig)

    if (!secureConfig) {
        throw new Error('The Chunky security file is invalid')
    }

    return secureConfig
}

module.exports = {
    loadSecureConfig
}