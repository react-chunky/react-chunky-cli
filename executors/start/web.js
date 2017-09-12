const coreutils = require('coreutils')
// const engine = require('react-chunky-engine')
const opn = require('opn')
const packager = require('../../packager')

module.exports = function(port) {
  coreutils.logger.info(`Starting the web packager on port ${port} ...`)
  packager.start({ port, dir: process.cwd() }).then(url => {
    coreutils.logger.ok(`Your web app is now available at ${url}`)
  }).catch(e => {
    console.log(e)
  })
}
