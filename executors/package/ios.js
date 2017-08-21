const coreutils = require('coreutils')

module.exports = function(optimize) {
    coreutils.logger.info(`Packaging the iOS app ...`)
    return coreutils.run.reactNative(['bundle',
          '--platform', 'ios',
          '--dev', 'false',
          '--assets-dest', './ios/',
          '--entry-file', 'node_modules/react-native-chunky/app/index.ios.js',
          '--bundle-output', 'ios/main.jsbundle'])
}
