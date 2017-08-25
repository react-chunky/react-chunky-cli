function _sanitizeKey(key) {
  return key.replace(/[\$:]/g, '_');
}

function _sanitizeData(data) {
  if (!data) {
    return ""
  }

  if ("string" === typeof data) {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(item => _sanitizeData(item))
  }

  if ("object" !== typeof data) {
    return data
  }

  var newData = {}
  for (const key in data) {
    newData[_sanitizeKey(key)] = _sanitizeData(data[key])
  }
  return newData
}

function _parseWordpressPost(data) {
  var op = _sanitizeData(data)

  var info = {
    title: op.title,
    date: op.wp_post_date,
    status: op.wp_status,
    timestamp: new Date(op.wp_post_date).getTime()
  }

  var meta = {}
  if (op.wp_postmeta) {
    if (Array.isArray(op.wp_postmeta)) {
      op.wp_postmeta.map(m => {
        const field = m.wp_meta_key
        if (meta[field] || meta[field] != undefined || meta[field.substring(1)]) {
          return
        }
        const value = m.wp_meta_value
        meta[field] = value
      })
    } else if ("object" === typeof op.wp_postmeta) {
      meta = Object.assign({}, op.wp_postmeta)
    }
  }

  return Object.assign({}, info,
    meta ? meta : {})
}

function _parseWordpressPostsAsTransforms(data, providers, local) {
  var wordpress = []
  local.rss.channel.item.forEach(item => {
    var post = _parseWordpressPost (item)
    const transform = Object.assign({}, data, post)

    wordpress.push(transform)
  })
  return { wordpress }
}

function _parseGoogleDataAsTransforms(data, google) {
  // console.log(data, google)
  return {}
}

function parseImportAsTransforms({ type, data, providers, local }) {
  switch (type) {
    case 'wordpress':
      return _parseWordpressPostsAsTransforms(data, providers, local)
    case 'google':
      return _parseGoogleDataAsTransforms(data, providers.google)
    default:
  }
}

module.exports = {
  parseImportAsTransforms
}
