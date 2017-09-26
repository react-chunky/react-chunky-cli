import React from 'react'
import { Screen } from 'react-dom-chunky'
import { Button } from 'react-mdl'

export default class MainCampaignScreen extends Screen {

  constructor(props) {
    super(props)
    this.state = { ...this.state }
    this._join = this.join.bind(this)
  }

  componentDidMount() {
    super.componentDidMount()
  }

  join() {
    showMailchimpDialog(this.props.theme.mailchimp.uuid, this.props.theme.mailchimp.lid)
  }

  get title() {
    return (<h1 style={{textAlign: 'center', marginTop: 60 }}> { this.props.strings.welcomeTitle } </h1>)
  }

  get subtitle() {
    return (<h4 style={{marginTop: 0, textAlign: 'center'}}> { this.props.strings.welcomeSubtitle } </h4>)
  }

  get action() {
    return (<Button style={{margin: 20}} raised colored onClick={this._join}> { this.props.strings.welcomeActionTitle } </Button>)
  }

  get actionFooter() {
    return (<p> { this.props.strings.welcomeActionSubtitle } </p>)
  }

  get components() {
    return [this.title, this.subtitle, this.action, this.actionFooter]
  }
}
