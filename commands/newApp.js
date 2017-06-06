const lali = require('lali')
const coreutils = require('coreutils')
const path = require('path')
const fs = require('fs-extra')
const merge = require('deepmerge')

function overrideJSONFile(dir, filename, content) {
    // This is the file we want to generate
    const file = path.resolve(dir, `${filename}.json`)
    var fileContent = {}

    if (fs.existsSync(file)) {
        fileContent = fs.readFileSync(file, 'utf8')
        fileContent = JSON.parse(fileContent)
    }

    fileContent = merge.all([fileContent, content])

    // Dump the friendly JSON to the file
    fs.writeFileSync(file, JSON.stringify(fileContent, null, 2), "utf8")    
}

function configureApp(name, dir) {
    return new Promise((resolve, reject) => {
        // overrideJSONFile(dir, 'package', { name })
        resolve()
    })
}

function installTemplateIfItExists(name, template, dir) {
    return template.sourceExists().then(() => {
        // Looks like we found the theme, so let's go ahead and install it
        coreutils.logger.ok(`↳ Found template.`)
        coreutils.logger.info("[2/4] Downloading template")
        return template.download(dir)
    }).then(() => {
        coreutils.logger.ok(`↳ Download complete.`)
        coreutils.logger.info("[3/4] Configuring your new Chunky app")
        return configureApp(name, dir)
    }).then(() => {
        coreutils.logger.ok(`↳ Successfully configured.`)
        coreutils.logger.info("[4/4] Installing dependencies (this might take a while)")
        coreutils.run.npmInstall(dir)
    }).catch(error => {
        console.log(error)
        // The template does not exist so we're stopping right away
        coreutils.logger.error(new Error('The template could not be installed'))
    })
}

function createApp(name, template) {
    if (/\s/.test(name)) {
        // Make sure the name provided is valid
        throw new Error('The app name cannot contain spaces')
    }

    coreutils.logger.info("[1/4] Creating a new Chunky app", name)

    if (!template) {
        // We're going to use the default template because no theme was specified
        coreutils.logger.ok(`↳ Using default template`)
    } else {
        // This is going to be app created from a specified template
        coreutils.logger.ok(`↳ Using template: ${template}`)
    }

    // Build the app template
    var templatePath = template || "react-chunky/react-chunky-conference-template"
    const appTemplate = new lali.Template(`${templatePath}@latest`)
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
        coreutils.logger.error(error)
    }
}
