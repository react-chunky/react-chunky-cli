var spawn = require("child_process").spawn;
var logger = require("./logger");

function run(cmd, args) {
    var proc = spawn(cmd, args);

    proc.stdout.on('data', (data) => {
        logger.info(data);
    });

    proc.stderr.on('data', (data) => {
        logger.warn(cmd + " failed: " + data)
    });

    proc.on('close', (code) => {
        logger.done("↳ Done");
    });
}

function npm(args) {
    run("npm", args)
}

function npmInstall(name, dir) {
    var args = ["install"]

    if (dir) {
        args.push("--prefix")
        args.push(dir)
    }

    args.push("--save")
    args.push(name)

    npm(args)
}

function reactNative(args) {
    run("react-native", args)
}

function reactNativeRun(platform) {
    reactNative(["run-" + platform])
}

module.exports = {
    run,
    npm,
    npmInstall,
    reactNative,
    reactNativeRun
}
