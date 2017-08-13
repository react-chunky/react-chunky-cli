const Serverless = require('../../src/Serverless')
const coreutils = require('coreutils')
const path = require('path')
const fs = require('fs-extra')
const loaders = require('../../src/loaders')
const generators = require('../../src/generators')
const cpy = require('cpy')

function prepareService(service, deployment) {
    if (!fs.existsSync(service.dir)) {
        fs.mkdirsSync(service.dir)
    }
    
    // Get a manifest and package
    const manifest = generators.generateServerlessManifest(service, deployment)
    const package = generators.generateServerlessPackage(service, deployment)

    // Generate the manifest
    fs.writeFileSync(path.resolve(service.dir, "serverless.json"), 
                     JSON.stringify(manifest, null, 2))

    // Generate the package
    fs.writeFileSync(path.resolve(service.dir, "package.json"), 
                     JSON.stringify(package, null, 2))

    // Copy the functions
    const functionsSourceDir = path.resolve(process.cwd(), 'chunks', service.name, "functions")
    return cpy([functionsSourceDir + '/*.js'], service.dir)
}

function installServiceDependencies(service, deployment) {
    return coreutils.run.npmInstall(service.dir)
}

function deployService(service, deployment) {
    const serverless = new Serverless({
        interactive: false,
        servicePath: service.dir
    })

    coreutils.logger.info(`${deployment.remove ? 'Removing' : 'Deploying'} ${service.name} service (${service.functions.length} functions)...`)
    return prepareService(service, deployment).
           then(() => installServiceDependencies(service, deployment)).
           then(() => serverless.init({ commands: [deployment.remove ? 'remove' : 'deploy'], options: { env: deployment.env }})).
           then(() => serverless.run())
}

function batchServices(services, deployment) {
    // Prepare the raw path
    const servicesDir = path.resolve(deployment.dir, 'services')
    if (!fs.existsSync(servicesDir)) {
        fs.mkdirsSync(servicesDir)
    }

    return Promise.all(Object.keys(services).map(serviceName => {
        var service = services[serviceName]
        service.name = serviceName
        service.dir = path.resolve(servicesDir, serviceName)
        
        return deployService(service, deployment)
    }))
}

module.exports = function(deployment) {
    const functions = loaders.loadFunctions(deployment.chunks)
    
    if (!functions || Object.keys(functions).length === 0) {
        coreutils.logger.skip("Skipping - no functions to be deployed")
        return Promise.resolve().
               then(() => coreutils.logger.done())
    }

    var services = {}
    functions.forEach(f => {    
        services[f.chunk] = services[f.chunk] || {}
        services[f.chunk].dependencies = Object.assign({}, services[f.chunk].dependencies || {}, f.dependencies)
        services[f.chunk].functions = services[f.chunk].functions || []
        services[f.chunk].functions.push(f)
    })
    
    return batchServices(services, deployment).
           then(() => coreutils.logger.done())
}
   