const Serverless = require('../../src/Serverless')
const coreutils = require('coreutils')
const path = require('path')
const fs = require('fs-extra')
const loaders = require('../../src/loaders')
const generators = require('../../src/generators')

function prepareService(service, deployment) {
    if (!fs.existsSync(service.dir)) {
        fs.mkdirsSync(service.dir)
    }
    
    // Get a manifest
    const manifest = generators.generateServerlessManifest(service, deployment)

    fs.writeFileSync(path.resolve(service.dir, "serverless.json"), 
                     JSON.stringify(manifest, null, 2))

    return Promise.resolve()
}

function deployService(service, deployment) {
    const serverless = new Serverless({
        interactive: false,
        servicePath: service.dir
    })

    coreutils.logger.info(`${deployment.remove ? 'Removing' : 'Deploying'} ${service.name} service (${service.functions.length} functions)...`)
    return prepareService(service, deployment).
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
        services[f.chunk].functions = services[f.chunk].functions || []
        services[f.chunk].functions.push(f)
    })
    
    return batchServices(services, deployment).
           then(() => coreutils.logger.done())
}
   