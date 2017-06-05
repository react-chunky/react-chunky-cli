const lali = require("lali")
const coreutils = require("coreutils")
const path = require("path")
const fs = require("fs-extra")
const ejs = require("ejs")
const cpy = require("cpy")
const recursive = require("recursive-readdir")

const config = {
    templatesDir: path.resolve(__dirname, '../../assets', 'templates'),
    templatesIgnores: ['.DS_Store', '*.jar', '*.zip', '*.png', '*.jpg', '*.jpeg', '*.gif'],
    assetsTypes: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.zip', '**/*.jar', '!.DS_Store']
}

function processTemplateFile(file, options) {
    // Parse the file
    const templateContent = fs.readFileSync(file, "utf8")
    const templateCompiler = ejs.compile(templateContent)
    const templateResult = templateCompiler(options.context)

    // First copy the file
    fs.copySync(file, options.targetFile)

    // Let's override its contents now
    fs.writeFileSync(options.targetFile, templateResult, "utf8")

    // Looks like this file made it
    coreutils.logger.ok(`↳ Added ${options.relativeFile}`)
}

function installTemplateIfItExists(name, template, targetDir) {
    if (!fs.existsSync(config.templatesDir)) {
        // This should not happen, but better safe than sorry
        throw new Error('Missing expected template assets')
    }

    // Start off with a simple context for each template
    const context = { name, template: path.basename(template.name) }

    // This is the default location where we want to look for our files
    const templateDir = path.resolve(config.templatesDir, 'chunk')

    // First, we want to copy binary assets over to the target
    cpy(config.assetsTypes, targetDir, {
        cwd: templateDir,
        parents: true
    }).then(() => {
        // Next, we want to process all the templates
        recursive(templateDir, config.templatesIgnores, function(err, files) {
            files.map(function(file) {
                // Process each file in the template and copy it if necessary
                const relativeFile = file.substring(templateDir.length + 1)
                processTemplateFile(file, {
                    dir: path.resolve(name),
                    name,
                    targetFile: path.join(targetDir, relativeFile),
                    relativeFile,
                    context
                })
            })

            // We should be ready to add dependencies now
            coreutils.logger.info("[2/2] Installing dependencies")
            coreutils.run.npm(['install', '--save', template.name])
        })
    })
}

function createChunk(name, template) {
    if (/\s/.test(name)) {
        // Make sure the name provided is valid
        throw new Error('The chunk name cannot contain spaces')
    }

    // Figure out the path where the chunk will live
    const dir = path.resolve(process.cwd(), 'chunks', name)

    if (fs.existsSync(dir)) {
        // We cannot duplicate chunk names
        throw new Error('Please specify a unique name') 
    }

    // Create the empty chunk destination
    fs.mkdirsSync(dir)

    coreutils.logger.info("[1/2] Creating a new Chunky chunk", name)

    if (!template) {
        // We're going to use the default template because no template was specified
        coreutils.logger.ok(`↳ Using template:`, 'default')
    } else {
        // This is going to be a chunk created from a specified template
        coreutils.logger.ok(`↳ Using template:`, template)
    }

    // Build the chunk template
    const chunkTemplate = new lali.Template(template || "react-chunky-list-chunk")

    // // Let's attempt to look up the template and install if it we find it
    return installTemplateIfItExists(name, chunkTemplate, dir)
}


function parseCommand(command) {
    if (!command.options.name) {
        // The new chunk requires a name
        throw new Error('Please specify a chunk name (--name)')
    }

    // This is going to create a new chunk
    createChunk(command.options.name, command.options.template)
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        coreutils.logger.error(error)
    }
}
