import parent from '<%= template %>'
import local from './chunk.json'
import * as screens from './src/screens'
import { extendChunk } from 'react-chunky'

export default extendChunk(parent, { screens, ...local})