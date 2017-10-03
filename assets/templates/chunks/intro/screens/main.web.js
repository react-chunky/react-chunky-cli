import React from 'react'
import { Screen, Components } from 'react-dom-chunky'
import { Snackbar, Button } from 'react-mdl'

export default class MainIntroScreen extends Screen {

  constructor(props) {
    super(props)
    this.state = { ...this.state }
  }

  componentDidMount() {
    super.componentDidMount()
  }

  subscribe() {
    showMailchimpDialog(this.props.theme.mailchimp.uuid, this.props.theme.mailchimp.lid)
  }

  get components() {
    return [ <Components.Summary {...this.props.intro} />]
  }
}
