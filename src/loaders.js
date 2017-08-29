const path = require('path')
const fs = require('fs-extra')
const yaml = require('js-yaml')
const URL = require('url-parse')
const xml2json = require('xml2json')
const parsers = require('./parsers')

function _loadXmlAsJsonFile(file) {
  if (!fs.existsSync(file)) {
    throw new Error('Wordpress export file does not exist')
  }

  const xml = fs.readFileSync(file, 'utf8')
  try {
    const json = xml2json.toJson(xml, {
      object: true,
      coerce: true,
      sanitize: true,
      trim: true,
      arrayNotation: false,
      alternateTextNode: false
    })
    return json
  } catch (e) {
  }
  return {}
}

function _loadChunkArtifactAsXmlToJson(chunk, type, artifact) {
  const artifactFile = path.resolve(process.cwd(), 'chunks', chunk, type, artifact.name + ".xml")

  if (!fs.existsSync(artifactFile)) {
      return
  }

  return _loadXmlAsJsonFile(artifactFile)
}

function _loadChunkArtifactAsYaml(chunk, type, artifact) {
    const artifactFile = path.resolve(process.cwd(), 'chunks', chunk, type, artifact.name + ".yaml")

    if (!fs.existsSync(artifactFile)) {
        return
    }

    // Load all data as Yaml
    const data = yaml.safeLoad(fs.readFileSync(artifactFile, 'utf8'));

    if (!data || Object.keys(data).length === 0) {
        return
    }

    return data
}

function _loadChunkArtifactAsFilePath(chunk, type, artifact, ext) {
    const artifactFile = path.resolve(process.cwd(), 'chunks', chunk, type, artifact.name + "." + ext)

    return (fs.existsSync(artifactFile) ? artifactFile : undefined)
}

function _findChunkArtifacts(chunk, type, artifacts) {
     try {
        // Look up the config file for this chunk
        var config = loadChunkConfig(chunk)
        var dependencies = {}

        if (type === 'functions') {
            config = config.service
            dependencies = config.dependencies
        }

        if (!config[type] || config[type].length === 0) {
            // No artifacts defined
            return []
        }

        // Look up the artifacts dir
        const artifactsDir = path.resolve(process.cwd(), 'chunks', chunk, type)


        if (!fs.existsSync(artifactsDir)) {
            // This chunk has no artifacts, even if it declared some
            return []
        }

        if (!artifacts || artifacts.length === 0) {
            // We want all the artifacts in this chunk
            artifacts = config[type]
        } else {
            artifacts = config[type].filter(a => {
                var found = false
                const aConfig = new URL(a, true)
                artifacts.forEach(a2 => {
                    if (a2.toLowerCase() === aConfig.hostname.toLowerCase()) {
                        found = true
                        return
                    }
                })
                return found
            })
        }

       return artifacts.map(artifact => {
            const url = new URL(artifact, true)
            const path = url.hostname + url.pathname
            const name = url.hash.slice(1) || path
            return { chunk,
                     name,
                     source: url.protocol.slice(0, -1),
                     dependencies,
                     path,
                     options: Object.assign({ priority: 99999 }, url.query )}
        }).sort((a, b) => (Number.parseInt(a.options.priority) - Number.parseInt(b.options.priority)))

    } catch (e) {
        console.log(e)
        return []
    }
}

function _loadChunkTransforms(providers, chunk, transforms) {
    const all = _findChunkArtifacts(chunk, "transforms", transforms)

    // Look up all valid transforms and load them up
    return Promise.all(all.map(transform => {
        var data = _loadChunkArtifactAsYaml(chunk, "transforms", transform)

        if (data.import) {
          data = data.import
          const type = data.type
          delete data.type
          var local = _loadChunkArtifactAsXmlToJson(chunk, "transforms", transform)
          return parsers.parseImportAsTransforms({ type, data, local, providers }).
                then(d => Object.assign({}, transform, (d ? { data: d } : {})))
        }

        data = Object.assign({}, transform, (data ? { data } : {}))
        return Promise.resolve(data)
    }))
}

function _loadChunkFunctions(providers, chunk) {
    const functions = _findChunkArtifacts(chunk, "functions")

    // Look up all valid transforms and load them up
    return Promise.resolve(functions.map(f => {
        const data = _loadChunkArtifactAsFilePath(chunk, "functions", f, "js")
        return Object.assign({}, f, (data ? { data } : {}))
    }))
}

function _load(providers, chunks, loader, artifacts) {
    // Figure out the chunks we need to look into
    if (chunks.length === 0) {
        chunks = fs.readdirSync(path.resolve(process.cwd(), "chunks")).filter(dir => (dir && dir !== 'index.js'))
    }

    return Promise.all(chunks.map(chunk => loader(providers, chunk, artifacts))).

    then(all => {
      var merged = []
      all.map(a => { merged = merged.concat(a) })
      return merged.sort((a, b) => (Number.parseInt(a.options.priority) - Number.parseInt(b.options.priority)))
    })
}

function loadTransforms(providers, chunks, transforms) {
    return _load(providers, chunks, _loadChunkTransforms, transforms)
}

function loadFunctions(providers, chunks) {
    return _load(providers, chunks, _loadChunkFunctions)
}

function loadChunkConfig(chunk) {
    // The chunk config file
    const file = path.resolve(process.cwd(), "chunks", chunk, "chunk.json")

    if (!fs.existsSync(file)) {
        // We can't continue without this file
        throw new Error('The chunk.json file is missing')
    }

    // Load the configuration
    var config = fs.readFileSync(file, 'utf8')

    if (!config) {
        throw new Error('The chunky.json file is invalid')
    }

    // Parse the json content
    config = JSON.parse(config)

    if (!config) {
        throw new Error('The chunky.json file is invalid')
    }

    return config
}

function loadSecureConfig() {
    // The project directory
    const dir = path.resolve(process.cwd())

    // Look for the security file file
    const file = path.resolve(dir, '.chunky.json')

    if (!fs.existsSync(file)) {
        // We can't continue without this file
        throw new Error('The Chunky security file is missing')
    }

    // Load the configuration
    var secureConfig = fs.readFileSync(file, 'utf8')

    if (!secureConfig) {
        throw new Error('The Chunky security file is invalid')
    }

    // Parse the json content
    secureConfig = JSON.parse(secureConfig)

    if (!secureConfig) {
        throw new Error('The Chunky security file is invalid')
    }

    return secureConfig
}

module.exports = {
    loadSecureConfig,
    loadChunkConfig,
    loadFunctions,
    loadTransforms
}
