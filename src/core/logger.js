var chalk = require("chalk");
var slana = require("slana");

function info(message, arg) {
    console.log(chalk.blue("[Chunky]"), chalk.gray(message), arg ? chalk.bold(arg) : '', chalk.gray("..."))
}

function status(message) {
    console.log(chalk.blue("[Chunky]"), chalk.gray(message))
}

function done(message) {
    console.log(chalk.blue("[Chunky]"), chalk.green(message), chalk.green("✓"))
}

function banner(message) {
    console.log(chalk.blue("[Chunky]"))
    console.log(chalk.blue("[Chunky]"), chalk.bold("-".repeat(message.length)))
    console.log(chalk.blue("[Chunky]"), chalk.bold(message))
    console.log(chalk.blue("[Chunky]"), chalk.bold("-".repeat(message.length)))
}

function warn(message) {
    console.log(chalk.blue("[Chunky]"), chalk.yellow("WARN"), chalk.grey(message))
}

function error(error) {
    slana.stopWithError(error)
}

module.exports = {
    info,
    done,
    warn,
    status,
    banner,
    error
}
