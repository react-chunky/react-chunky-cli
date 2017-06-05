import React from 'react'
import { ActivityIndicator } from 'react-native'
import { Screen } from 'react-native-chunky'

export default class MainScreen extends Screen {

  render() {
    return (
      <View style={this.styles.containers.main}>
        <ActivityIndicator
          animating={true}
          style={{height: 120}}
          size="small"/>
      </View>)
  }
}
