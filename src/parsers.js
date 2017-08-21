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

  var location = Object.assign({})
  //                op.city ? { city: op.city } : {},
  //                op.state ? { state: op.state } : {},
  //                op.street_address ? { street: op.street_address } : {},
  //                op.country ? { country: op.country } : {})

  //  var post = {}
  //  var meta = {}
  //  var categories = []
  //  var comments = []

  // op._thumbnail_id ? { thumbnailId: op._thumbnail_id } : {},
  // op.wp_post_id ? { postId: op.wp_post_id } : {},
  // op.wp_attachment_url ? { attachmentUrl: op.wp_attachment_url } : {},
  // categories.length > 0 ? { categories } : {},
  // comments.length > 0 ? { comments } : {})

  // if (op.wp_postmeta) {
  //   if (Array.isArray(op.wp_postmeta)) {
  //     op.wp_postmeta.map(meta => { meta[meta.wp_meta_key] = meta.wp_meta_value })
  //   } else if ("object" === typeof op.wp_postmeta) {
  //     meta = Object.assign({}, op.wp_postmeta)
  //   }
  //   delete op.wp_postmeta
  // }

  // if (op.location && "string" === typeof op.location) {
  //   op.location = op.location.split(";").map(i => i.split(":").splice(-1, 1).join("/"))
  //   op.location.pop()
  //   op.location = op.location.map(i => i.replace(/[\"]/g, ''))
  //   for (var i = 0; i < op.location.length; i = i+2) {
  //     newLocation[op.location[i]] = op.location[i+1]
  //   }
  // }

  //
  // if (op.category && Array.isArray(op.category)) {
  //   categories = op.category.map(c => c._t)
  // }
  //
  // if (op.wp_comment && Array.isArray(op.wp_comment)) {
  //   comments = op.wp_comment.map(c => Object.assign({},
  //     c.wp_comment_author ? { author: c.wp_comment_author } : {},
  //     c.wp_comment_author_email ? { authorEmail: c.wp_comment_author_email } : {},
  //     c.wp_comment_author_url ? { authorUrl: c.wp_comment_author_url } : {},
  //     c.wp_comment_author_IP ? { authorIP: c.wp_comment_author_IP } : {},
  //     c.wp_comment_date ? { date: c.wp_comment_date, timestamp: new Date(c.wp_comment_date).getTime() } : {},
  //     c.wp_comment_content ? { content: c.wp_comment_content } : {},
  //     c.wp_comment_approved ? { status: c.wp_comment_approved } : {}
  //   ))
  // }

  return Object.assign({}, info,
    meta ? meta : {},
    location ? { location } : {})
}

function parseWordpressPostsAsTransforms(meta, data) {
  var wordpress = []
  data.rss.channel.item.forEach(item => {
    var post = _parseWordpressPost (item)
    const transform = Object.assign({}, meta, post)
    
    wordpress.push(transform)
  })
  return { wordpress }
}

module.exports = {
  parseWordpressPostsAsTransforms
}
