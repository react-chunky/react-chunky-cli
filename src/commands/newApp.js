const logger = require("../core/logger")
const runner = require("../core/runner")
const lali = require('lali')
const coreutils = require('coreutils')
const path = require('path')
const fs = require('fs-extra')

function overrideJSONFile(dir, filename, content) {
    // This is the file we want to generate
    const file = path.resolve(dir, `${filename}.json`)
    var fileContent = {}

    if (fs.existsSync(file)) {
        fileContent = JSON.parse(fs.readFileSync(file, 'utf8'))
    }

    // Dump the friendly JSON to the file
    fs.writeFileSync(file, JSON.stringify(Object.assign({}, fileContent, content), null, 2), "utf8")    
}

function configureApp(name, dir) {
    return new Promise((resolve, reject) => {
        coreutils.file.jsonMerge(path.resolve(dir, 'package.json'), {
            name
        })
        resolve()
    })
}

function installTemplateIfItExists(name, template, dir) {
    return template.sourceExists().then(() => {
        // Looks like we found the theme, so let's go ahead and install it
        logger.done(`↳ Found template.`)
        logger.info("⇨ [2/3] Downloading template")
        return template.download(dir)
    }).then(() => {
        logger.done(`↳ Download complete.`)
        logger.info("⇨ [3/3] Configuring your new Chunky app")
        return configureApp(name, dir)
    }).then(() => {
        logger.done(`↳ Successfully configured.`)
        logger.banner("Congratulations, you've got yourself a brand new Chunky app!")
    }).catch(error => {
        // The template does not exist so we're stopping right away
        logger.error(new Error('The template could not be installed'))
    })
}

function createApp(name, template) {
    if (/\s/.test(name)) {
        // Make sure the name provided is valid
        throw new Error('The app name cannot contain spaces')
    }

    logger.info("⇨ [1/3] Creating a new Chunky app", name)

    if (!template) {
        // We're going to use the default template because no theme was specified
        logger.info(`↳ Using template:`, 'default')
    } else {
        // This is going to be app created from a specified template
        logger.info(`↳ Using template:`, template)
    }

    // Build the app template
    const appTemplate = new lali.Template(template || "react-chunky/react-chunky-starter-mobile-template")
    const dir = path.resolve(process.cwd(), name)

    // Always create it in a fresh location    
    if (fs.existsSync(dir)) {
        fs.removeSync(dir)
    }
    fs.mkdirSync(dir)

    // Let's attempt to look up the template and install if it we find it
    return installTemplateIfItExists(name, appTemplate, dir)
}


function parseCommand(command) {
    if (!command.options.name) {
        // The new app requires a name
        throw new Error('Please specify an app name (--name)')
    }

    // This is going to create a new app
    createApp(command.options.name, command.options.template)
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        logger.error(error)
    }
}
