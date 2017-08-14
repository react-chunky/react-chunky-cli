
function generateServerlessPackage(service, deployment) {
    return {
        name: service.name,
        version: service.version,
        description: "",
        main: "service.js",
        scripts: {},
        author: "",
        dependencies: service.dependencies
    }
}

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
            exclude: [".git/**"]
        }
        // resources: {
        //     Resources: {
        //         pathmapping: {
        //             Type: "AWS::ApiGateway::BasePathMapping",
        //             Properties: {
        //                 BasePath: "",
        //                 DomainName: deployment.apiDomain,
        //                 RestApiId: {
        //                     Ref: "ApiGatewayRestApi"
        //                 },
        //                 Stage: deployment.env
        //             }
        //         }
        //     }
        // }
    }

    base.functions = {}
    
    service.functions.forEach(f => {
      base.functions[f.name] = {
          handler: f.name + ".main",
          events: [{
              http: {
                  method: f.source,
                  path: f.path,
                  cors: true,
                  integration: 'lambda'
              }
          }]
      }
    })

    return base
}

module.exports = {
    generateServerlessManifest,
    generateServerlessPackage
}