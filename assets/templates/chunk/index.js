import parent from '<%= template %>'
import spec from './chunk.json'
import * as screens from './screens'
import * as assets from './assets'
import { extendChunk } from 'react-chunky'

const chunk = {
    screens, 
    assets, 
    ...spec
}

export default extendChunk(parent, chunk)
