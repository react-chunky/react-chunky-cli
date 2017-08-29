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

function createChunkStructure(name, targetDir, template) {
    if (!fs.existsSync(config.templatesDir)) {
        // This should not happen, but better safe than sorry
        throw new Error('Missing expected template assets')
    }

    // Start off with a simple context for each template
    const context = { name, template }

    const productDir = path.resolve(process.cwd())
    const chunksDir = path.resolve(productDir, 'chunks')

    // This is the default location where we want to look for our files
    const templateDir = path.resolve(config.templatesDir, 'chunks', template)

    // Create the empty chunk destination
    fs.mkdirsSync(targetDir)

    // First, we want to copy binary assets over to the target
    return new Promise((resolve, reject) => {
        cpy(config.assetsTypes, targetDir, {
            cwd: templateDir,
            parents: true
        }).
        then(() => {
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

                // We're all finished with creating the chunk
                coreutils.logger.done()
                resolve()
            })
        }).
        then(() => {
          // Generate the manifest
          const chunks = fs.readdirSync(chunksDir).filter(dir => (dir && dir !== 'index.js' && dir !== '.DS_Store'))
          var chunksExports = chunks.map(chunk => `export { default as ${chunk} } from './${chunk}'`).join("\n")
          var chunksExportsHeader = "// AUTO-GENERATED FILE. PLEASE DO NOT MODIFY. CHUNKY WILL CRY."
          fs.writeFileSync(path.resolve(chunksDir, "index.js"), `${chunksExportsHeader}\n\n${chunksExports}`)
        })
    })
}

function create(name, template) {

    if (/\s/.test(name)) {
        // Make sure the name provided is valid
        return Promise.reject(new Error('The chunk name cannot contain spaces'))
    }

    // Figure out the path where the chunk will live
    const dir = path.resolve(process.cwd(), 'chunks', name)

    if (fs.existsSync(dir)) {
        // We cannot duplicate chunk names
        return Promise.reject(new Error('Please specify a unique name'))
    }

    return createChunkStructure(name, dir, template)
}

module.exports = { create }
