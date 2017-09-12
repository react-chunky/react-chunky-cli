'use strict'

// let coreutils = require('coreutils')
let path = require('path')
let fs = require('fs-extra')
let webpack = require('webpack')
let config = require('./config')
let WebpackDevServer  = require('webpack-dev-server')

function start(options) {
  return new Promise((resolve, reject) => {
    const setup = config(options)
      process.noDeprecation = true
      new WebpackDevServer(webpack(setup), setup.devServer).
      listen(options.port, 'localhost', (error) => {

        if (error) {
          // Looks like webpack failed with a hard error
          reject(error)
          return
        }

        // Open a browser with the website loaded
        const url = 'http://localhost:' + options.port
        resolve(url)
      })
  })
}

module.exports = { start }
