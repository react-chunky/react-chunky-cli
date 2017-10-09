const coreutils = require('coreutils')
const path = require('path')
const loaders = require('../../src/loaders')

module.exports = function(optimize) {
    coreutils.logger.info(`Packaging the Web app ...`)

    const file = path.resolve(process.cwd(), 'node_modules', 'react-dom-chunky', 'bin', 'build')
    const build = require(file)
    const config = loaders.loadMainConfig()
    const secure = loaders.loadSecureConfig()
    const chunks = loaders.loadChunkConfigs()

    return build({ dir: process.cwd(), config, secure, chunks }).then(() => {
      coreutils.logger.ok(`Your web app is now packaged`)
    }).catch(e => {
      coreutils.logger.fail(e)
    })
}
