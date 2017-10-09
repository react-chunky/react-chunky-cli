const coreutils = require('coreutils')
const browserSync = require("browser-sync")
const path = require("path")

module.exports = function(port) {
  coreutils.logger.info(`Starting the Web app on port ${port} ...`)

  const webDir = path.resolve(process.cwd(), 'web', 'build')
  const bs = browserSync.create()

  bs.init({
    port,
    server: webDir
  })
}
