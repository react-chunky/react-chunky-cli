import spec from './chunk.json'
import * as screens from './screens'
import * as assets from './assets'

const chunk = {
    screens, 
    assets, 
    ...spec
}

<% if (template) { %>
import parent from '<%= template %>'
import { extendChunk } from 'react-chunky'
export default extendChunk(parent, chunk)
<% } else { %>
export default chunk
<% } %>

