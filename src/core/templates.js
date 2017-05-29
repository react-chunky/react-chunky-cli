let got = require('got')
let tar = require('tar')
let zlib = require('zlib')

function checkIfUrlExists(url) {
    if (!url) {
        return Promise.reject(new Error())
    }

    return got.head(url)
}

module.exports = {
    checkIfUrlExists
}