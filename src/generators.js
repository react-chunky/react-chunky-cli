
const lali = require("lali")
const coreutils = require("coreutils")
const path = require("path")
const fs = require("fs-extra")
const ejs = require("ejs")
const cpy = require("cpy")
const recursive = require("recursive-readdir")

const config = {
    templatesDir: path.resolve(__dirname, '../assets', 'templates'),
    templatesIgnores: ['.DS_Store', '*.jar', '*.zip', '*.png', '*.jpg', '*.jpeg', '*.gif', '*.ttf', 'Pods'],
    assetsTypes: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.zip', '**/*.jar', '**/*.ttf', '!.DS_Store']
}

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

function _generateProductPackage(name, template) {
  return {
    name,
    version: "0.1.0",
    description: "This is an awesome Chunky product",
    scripts: {
      test: "react-native-savor test",
      lint: "react-native-savor lint",
      coverage: "react-native-savor coverage",
      codeclimate: "react-native-savor codeclimate"
    },
    repository: {
      type: "git",
      url: "git+https://github.com/react-chunky/react-chunky.git"
    },
    homepage: "https://github.com/react-chunky/react-chunky",
    dependencies: {
      "react-native-chunky": "0.x",
      "react-dom-chunky": "0.x",
      "react-chunky-auth-chunk": "0.x",
      "react-chunky-list-chunk": "0.x"
    },
    devDependencies: {
      "react-native-savor": "0.x"
    }
  }
}

function _generateProductChunkyManifest(name, template) {
  return {
    name,
    template,
    id: "io.chunky",
    sections: {
      start: {
        stack: [ "auth" ],
        hideHeader: true
      },
      dashboard: {
        stack: [ "feed", "account" ],
        layout: "tabs"
      }
    },
    transitions: ["replace://dashboard", "replace://start"],
    provisioning: {},
    theme: {
      progressColor: "rgba(50,50,50, 0.9)",
      primaryColor: "#43A047",
      statusBarLight: false,
      navigationColor: "#607D8B",
      navigationTintColor: "#37474F",
      backgroundColor: "#FAFAFA"
    }
  }
}

function _generateProductStrings(data) {
  return {
   "appName": data.chunky.name,
   "noData": "Sorry, no data available",
   "inProgress": "Loading data ...",
   "retry": "Try again",
   "cancel": "Cancel",
   "reload": "Reload",
   "success": "Success",
   "error": "An error occured",
   "signIn": "Sign In",
   "signUp": "Sign Up",
   "continue": "Continue",
   "logout": "Sign Out Of Our Account",
   "loginToAccount": "Welcome Back",
   "createAccount": "Create Your Account",
   "needAccount": "Do you need an account?",
   "haveAccount": "Do you have an account?",
   "email": "Enter Your Email Address",
   "enterEmail": "Please enter your email address",
   "password": "Enter Your Password",
   "password2": "Confirm Your Password",
   "enterPassword": "Please enter your password",
   "enterPassword2": "Please confirm your password",
   "detectingLocation": "Detecting your location...",
   "foundLocation": "Found your location",
   "notFoundLocation": "Could not find your location",
   "welcomeBack": "Welcome back",
   "failedLocationDetection": "Failed to detect your location",
   "yourProfile": "Your Profile",
   "updateAccount": "Update",
   "setupAccount": "Setup Your Account",
   "setup": "Setup",
   "skipSetup": "Skip Setup",
   "enterName": "Please enter your name",
   "name": "Enter Your Name",
   "enterPhone": "Please enter your phone number",
   "phone": "Your Phone Number",
   "enterImage": "Please take a picture",
   "image": "Your Picture",
   "passwordsNotMatching": "Please make sure your passwords match",
   "changePhoto": "Change Photo"
  }
}

function _generateProductChunkySecureManifest(name, template, serviceAccount) {
  return {
    name,
    template,
    cloud: {
      dev: {
        aws: {
            key: "",
            secret: "",
            apiDomain: "",
            region: "us-east-1"
        },
        google: {
            services: ["drive", "calendar", "spreadsheets"],
            serviceAccount
        }
      },
      staging: {
        aws: {
            key: "",
            secret: "",
            apiDomain: "",
            region: "us-east-1"
        },
        google: {
            services: ["drive", "calendar", "spreadsheets"],
            serviceAccount: { }
        }
      },
      production: {
        aws: {
            key: "",
            secret: "",
            apiDomain: "",
            region: "us-east-1"
        },
        google: {
            services: ["drive", "calendar", "spreadsheets"],
            serviceAccount: { }
        }
      }
    }
  }
}

function generateProductManifestFiles(name, template) {
  fs.writeFileSync(path.resolve(process.cwd(), 'package.json'), JSON.stringify(_generateProductPackage(name, template), null, 2))
  coreutils.logger.ok(`Created package.json`)

  fs.writeFileSync(path.resolve(process.cwd(), 'chunky.json'), JSON.stringify(_generateProductChunkyManifest(name, template), null, 2))
  coreutils.logger.ok(`Created chunky.json`)
}

function _postCreationiOSProcess(data) {
  const sourceFirebaseFile = path.resolve(process.cwd(), 'GoogleService-Info.plist')
  const targetFirebaseFile = path.resolve(process.cwd(), 'ios', 'GoogleService-Info.plist')

  if (!fs.existsSync(sourceFirebaseFile)) {
    return Promise.resolve()
  }

  fs.copySync(sourceFirebaseFile, targetFirebaseFile)
  coreutils.logger.ok(`Provisioned iOS app for Firebase`)

  return Promise.resolve()
}

function _postCreationAssetsProcess(data) {
  fs.writeFileSync(path.resolve(process.cwd(), 'assets', 'strings.json'), JSON.stringify(_generateProductStrings(data), null, 2))
  coreutils.logger.ok(`Created product strings`)

  return Promise.resolve()
}

function _postCreationAndroidProcess(data) {
  var paths = [process.cwd(), 'android', 'app', 'src', 'main', 'java']
  const sourcePackageRoot = paths.concat(['io']).join("/")
  const sourcePackage = paths.concat(['io', 'chunky']).join("/")
  const targetPackage = paths.concat(data.chunky.id.split('.')).join("/")

  fs.moveSync(sourcePackage, targetPackage, { overwrite: true })
  fs.removeSync(sourcePackageRoot)
  coreutils.logger.ok(`Created ${data.chunky.id} package`)

  const sourceFirebaseFile = path.resolve(process.cwd(), 'google-services.json')
  const targetFirebaseFile = path.resolve(process.cwd(), 'android', 'app', 'google-services.json')

  if (!fs.existsSync(sourceFirebaseFile)) {
    return Promise.resolve()
  }

  fs.copySync(sourceFirebaseFile, targetFirebaseFile)
  coreutils.logger.ok(`Provisioned Android app for Firebase`)

  return Promise.resolve()
}

function _processTemplateFile(file, options) {
  try {
    // Parse the file
    const templateContent = fs.readFileSync(file, "utf8")
    const templateCompiler = ejs.compile(templateContent)
    const templateResult = templateCompiler(options.context)

    // First copy the file
    fs.copySync(file, options.targetFile)

    // Let's override its contents now
    fs.writeFileSync(options.targetFile, templateResult, "utf8")

    // Looks like this file made it
    coreutils.logger.ok(`Created ${options.relativeFile}`)
  } catch (e) {
    coreutils.logger.fail(file)
  }
}

function _copyTemplateFiles(name, templateDir, targetDir, context) {
  return new Promise((resolve, reject) => {
    recursive(templateDir, config.templatesIgnores, (err, files) => {
        files.map((file) => {
          // Process each file in the template and copy it if necessary
          const relativeFile = file.substring(templateDir.length + 1)

          _processTemplateFile(file, {
              name,
              relativeFile,
              targetFile: path.join(targetDir, relativeFile),
              context
          })
        })
        resolve()
      })
    })
}

function _copyTemplateAssetsToTarget(templateDir, targetDir) {
  return cpy(config.assetsTypes, targetDir, {
      cwd: templateDir,
      parents: true
  }).catch(e => console.log(e))
}

function _generateChunkIndexFile(data) {
  return new Promise((resolve, reject) => {
    const productDir = path.resolve(process.cwd())
    const chunksDir = path.resolve(productDir, 'chunks')
    const chunks = fs.readdirSync(chunksDir).filter(dir => (dir && dir !== 'index.js' && dir !== '.DS_Store'))

    var chunksExports = chunks.map(chunk => `export { default as ${chunk} } from './${chunk}'`).join("\n")
    var chunksExportsHeader = "// AUTO-GENERATED FILE. PLEASE DO NOT MODIFY. CHUNKY WILL CRY."

    fs.writeFileSync(path.resolve(chunksDir, "index.js"), `${chunksExportsHeader}\n\n${chunksExports}`)
    resolve()
  })
}

function _postCreationProcess(type, data) {
  switch (type) {
    case "android":
      return _postCreationAndroidProcess(data)
    case "ios":
      return _postCreationiOSProcess(data)
    case "assets":
      return _postCreationAssetsProcess(data)
    case "chunk":
      return _generateChunkIndexFile(data)
    case "web":
    default:
      return Promise.resolve()
  }
}

function _generateArtifact(name, template, type, data) {
    // Figure out the path where it will live
    var targetDir = path.resolve(process.cwd(), 'chunks', name)
    var templateDir = path.resolve(config.templatesDir, 'chunks', template)

    switch (type) {
      case "android":
      case "ios":
      case "assets":
      case "web":
        targetDir = path.resolve(process.cwd(), type)
        templateDir = path.resolve(config.templatesDir, type, template)
        break
      default:
    }

    if (/\s/.test(name)) {
        // Make sure the name provided is valid
        throw new Error('The name cannot contain spaces')
    }

    if (fs.existsSync(targetDir)) {
        // We cannot duplicate names
        throw new Error(`Cannot regenerate ${type}`)
    }

    if (!fs.existsSync(config.templatesDir)) {
        // This should not happen, but better safe than sorry
        throw new Error('Missing expected template')
    }

    // Create the empty chunk destination
    fs.mkdirsSync(targetDir)

    return _copyTemplateAssetsToTarget(templateDir, targetDir).
           then(() => _copyTemplateFiles(name, templateDir, targetDir, data)).
           then(() => _postCreationProcess(type, data))
}

function generateChunk(name, template, data) {
  return _generateArtifact(name, template, 'chunk', data)
}

function generateAndroid(name, template, data) {
  return _generateArtifact(name, template, 'android', data)
}

function generateiOS(name, template, data) {
  return _generateArtifact(name, template, 'ios', data)
}

function generateAssets(name, template, data) {
  return _generateArtifact(name, template, 'assets', data)
}

function generateProvisioning(name, template, data) {
    const serviceAccountFile = path.resolve(process.cwd(), 'serviceAccount.json')

    if (!fs.existsSync(serviceAccountFile)) {
      return Promise.resolve()
    }

    try {
      const serviceAccount = require(serviceAccountFile)
      fs.writeFileSync(path.resolve(process.cwd(), '.chunky.json'), JSON.stringify(_generateProductChunkySecureManifest(name, template, serviceAccount), null, 2))
      coreutils.logger.ok(`Created .chunky.json`)
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
}

module.exports = {
    generateServerlessManifest,
    generateServerlessPackage,
    generateChunk,
    generateAndroid,
    generateiOS,
    generateAssets,
    generateProvisioning,
    generateProductManifestFiles
}
