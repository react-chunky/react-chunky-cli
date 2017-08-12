function generateServerlessManifest(service, deployment) {
    var base = {
        service: service.name,
        provider: {
            name: 'aws',
            runtime: 'nodejs6.10',
            stage: deployment.env,
            timeout: 60,
            environment: {
                CHUNKY_ENV: deployment.env
            }
        },
        package: {
            exclude: [".git/**"],
            include: ["../../../../../chunky.json", "../../../../../.chunky.json"]
        }
    }

    base.functions = {}
    
    service.functions.forEach(f => {
      base.functions[f.name] = {
          handler: f.name,
          events: [{
              http: {
                  method: f.source,
                  path: f.options.path,
                  cors: true,
                  integration: 'lambda'
              }
          }]
      }
    })

    return base
}

module.exports = {
    generateServerlessManifest
}