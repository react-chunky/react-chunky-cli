const coreutils = require('coreutils')
const path = require('path')
const fs = require('fs-extra')

const generators = require('../../src/generators')

function initial(name, template) {
  return generators.generateProductManifestFiles(name, template)
}

function update(name, template, data) {
  return Promise.all([generators.generateChunk('auth', 'auth', Object.assign({}, data, { name: 'auth'})),
                      generators.generateChunk('feed', 'feed', Object.assign({}, data, { name: 'feed'})),
                      generators.generateChunk('account', 'account', Object.assign({}, data, { name: 'account'}))]).
                  then(() => generators.generateiOS(name, template, data)).
                  then(() => generators.generateAndroid(name, template, data)).
                  then(() => generators.generateAssets(name, template, data)).
                  then(() => generators.generateProvisioning(name, template, data))
}

function create(name, template) {
  const packageFile = path.resolve(process.cwd(), 'package.json')
  const chunkyFile = path.resolve(process.cwd(), 'chunky.json')

  if (fs.existsSync(packageFile) &&
      fs.existsSync(chunkyFile)) {
        const main = require(packageFile)
        const chunky = require(chunkyFile)
        return update(name, template, { main, chunky, name, template })
  }

  return initial(name, template)
}

module.exports = { create }
