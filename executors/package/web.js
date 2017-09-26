const coreutils = require('coreutils')
const path = require('path')

module.exports = function(optimize) {
    coreutils.logger.info(`Packaging the Web app ...`)
    const file = path.resolve(process.cwd(), 'node_modules', 'react-dom-chunky', 'bin', 'build')
    const build = require(file)
    return build({ dir: process.cwd() }).then(() => {
      coreutils.logger.ok(`Your web app is now packaged`)
    }).catch(e => {
      coreutils.logger.fail(e)
    })
}
