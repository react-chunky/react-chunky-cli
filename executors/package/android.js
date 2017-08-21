const coreutils = require('coreutils')

module.exports = function(optimize) {
    coreutils.logger.info(`Packaging the Android app ...`)

    return coreutils.run.reactNative(['bundle',
          '--platform', 'android',
          '--dev', 'false',
          '--entry-file', 'node_modules/react-native-chunky/app/index.android.js',
          '--assets-dest', 'android/app/src/main/res/',
          '--bundle-output', 'android/app/src/main/assets/index.android.bundle']).
      then(() =>  coreutils.run.async('cd', ['android', '&&', './gradlew', 'assembleRelease', '&&', './gradlew', 'installRelease']))
}
