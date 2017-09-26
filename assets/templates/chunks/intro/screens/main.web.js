import React from 'react'
import { Screen } from 'react-dom-chunky'
import { Snackbar } from 'react-mdl'

export default class MainCampaignScreen extends Screen {

  constructor(props) {
    super(props)
    this.state = { ...this.state }
  }

  componentDidMount() {
    super.componentDidMount()
  }

  get components() {
    return [<h1> hello </h1>]
  }
}
