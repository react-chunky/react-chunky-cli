const coreutils = require('coreutils')
const path = require('path')
const fs = require('fs-extra')

const generators = require('../../src/generators')

function update(name, template, data) {
  return Promise.all([generators.generateChunk('auth', 'auth', Object.assign({}, data, { name: 'auth'})),
                      generators.generateChunk('feed', 'feed', Object.assign({}, data, { name: 'feed'})),
                      generators.generateChunk('account', 'account', Object.assign({}, data, { name: 'account'}))]).
                  then(() => generators.generateiOS(name, template, data)).
                  then(() => generators.generateAndroid(name, template, data)).
                  then(() => generators.generateAssets(name, template, data)).
                  then(() => generators.generateProvisioning(name, template, data)).catch(e => console.log(e))
}

function install() {
  const packageFile = path.resolve(process.cwd(), 'package.json')
  const chunkyFile = path.resolve(process.cwd(), 'chunky.json')

  if (!fs.existsSync(packageFile) && !fs.existsSync(chunkyFile)) {
    coreutils.logger.fail('The product is not initialized yet. Run chunky init first.')
    return Promise.resolve()
    }

  const main = require(packageFile)
  const chunky = require(chunkyFile)
  return update(chunky.name, chunky.template, { main, chunky, name: chunky.name, template: chunky.template })
}

module.exports = { install }
