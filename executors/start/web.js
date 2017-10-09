const coreutils = require('coreutils')
const opn = require('opn')
const path = require('path')
const loaders = require('../../src/loaders')

module.exports = function(port) {
  coreutils.logger.info(`Starting the web packager on port ${port} ...`)

  const file = path.resolve(process.cwd(), 'node_modules', 'react-dom-chunky', 'bin', 'start')
  const start = require(file)
  const config = loaders.loadMainConfig()
  const secure = loaders.loadSecureConfig()
  const chunks = loaders.loadChunkConfigs()

  start({ port, dir: process.cwd(), config, secure, chunks }).then(url => {
    coreutils.logger.ok(`Your web app is now available at ${url}`)
  }).catch(e => {
    coreutils.logger.fail(e)
  })
}
