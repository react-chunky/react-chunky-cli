var ejs = require("ejs");
var fs = require("fs-extra");
var path = require("path");
var cpy = require("cpy");
var recursive = require("recursive-readdir");
var config = require("../config");

function processTemplateFile(file, options) {
    var templateContent = fs.readFileSync(file, "utf8")
    var templateCompiler = ejs.compile(templateContent)
    var templateResult = templateCompiler(options.context)

    var targetFile = options.relativeFile
    var regex = new RegExp('chunky', 'g');
    targetFile = path.join(options.dir, targetFile.replace(regex, options.name))

    // First copy the file
    fs.copySync(file, targetFile)

    // Let's override its contents now
    fs.writeFileSync(targetFile, templateResult, "utf8")
}

function createFromTemplate(name, options) {
    var dir = path.resolve(path.join(config.templatesDir, name))

    if (!fs.existsSync(dir)) {
        throw new Error('Please specify a valid template')
    }

    var context = {
        name: options.name
    }
    var targetDir = path.resolve(options.name)

    if (fs.existsSync(targetDir)) {
        // Make sure the host directory is clean
        fs.removeSync(targetDir)
    }

    // Let's start with a fresh target
    fs.mkdirSync(targetDir)

    // First, copy the assets without parsing
    cpy(config.assetsTypes, targetDir, {
        cwd: dir,
        parents: true
    }).then(() => {

        // Next, fill in the templates
        recursive(dir, config.templatesIgnores, function(err, files) {
            files.map(function(file) {
                var relativeFile = file.substring(dir.length + 1)
                processTemplateFile(file, {
                    dir: path.resolve(options.name),
                    name: options.name,
                    targetFile: path.join(targetDir, relativeFile),
                    relativeFile,
                    context
                })
            })
        });
    });
}

module.exports = {
    createFromTemplate
}
