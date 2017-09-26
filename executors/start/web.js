const coreutils = require('coreutils')
const opn = require('opn')
const path = require('path')

module.exports = function(port) {
  coreutils.logger.info(`Starting the web packager on port ${port} ...`)
  const file = path.resolve(process.cwd(), 'node_modules', 'react-dom-chunky', 'bin', 'start')
  const start = require(file)
  start({ port, dir: process.cwd() }).then(url => {
    coreutils.logger.ok(`Your web app is now available at ${url}`)
  }).catch(e => {
    coreutils.logger.fail(e)
  })
}
