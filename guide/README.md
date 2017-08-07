<p align="center">
 <h1 align="center"> The Chunky CLI User Guide</h1>
    <p align="center">
        <a href="https://www.npmjs.com/package/react-chunky-cli"> <img src="https://img.shields.io/npm/v/react-chunky-cli.svg"> </a>
    </p>

  <a href="https://github.com/react-chunky/react-chunky">
    <img height="256" src="https://raw.githubusercontent.com/react-chunky/react-chunky/master/assets/c-logo.gif">
    <br/>
    <img width="256" src="https://raw.githubusercontent.com/react-chunky/react-chunky/master/assets/c-logo-h.png">
  </a>

  <h3 align="center"> The Full Stack Product Development Platform (for mere mortals) </h3>
  <h4 align="center"> Chunky helps aspiring and seasoned developers quickly develop an idea into a scalable full stack product </h4>

  <p align="center">
    <a href="https://github.com/react-chunky/react-chunky"> <img src="https://img.shields.io/badge/react--chunky-core--framework-blue.svg"> </a>
    <a href="https://github.com/react-chunky/react-native-chunky"> <img src="https://img.shields.io/badge/react--chunky-mobile--framework-blue.svg"> </a>
 </p>

</p>

# Welcome

Welcome to the Chunky CLI User Guide.

This guide outlines all the available CLI commands that a developer can use to interface with the Chunky Platform. The guide is intended as the main starting point for aspiring or seasoned developers who are interested in the Chunky Platform. If you have not installed the Chunky CLI yet, [please do so now before moving on](#installation).

# Installation

In order to be able to install the Chunky CLI, please make sure you have Node.js v6+ installed on your development machine.

[Download Node.js](https://nodejs.org/en/)

Once you have Node.js installed, you can simply install the Chunky CLI as a global module, like so:

```
npm -ig react-chunky-cli
```

You should now have access to the Chunky CLI in your terminal. To check that you've successfully installed the Chunky CLI, just open up your terminal and type:

```
$ chunky
```

*If you need help installing the Chunky CLI, no worries, please open up an issue and we'll get you up and running as fast as possible.*

[Please help me install this thing](https://github.com/react-chunky/react-chunky-cli/issues/new?title=Please%20help%20me%20install%20this%20thing)

# Commands Overview

* [run](#run)
  * [Run on all platforms](#run-on-all-platforms)
  * [Run on iOS only](#run-on-ios-only)
  * [Run on Android only](#run-on-android-only)
  * [Run on Web only](#run-on-web-only)
  * [Run on iOS and Android only](#run-on-ios-and-android-only)
  * [Run on iOS and Web only](#run-on-ios-and-web-only)
  * [Run on Android and Web only](#run-on-android-and-web-only)
  * [Specify a custom mobile packager port](#specify-a-custom-mobile-packager-port)
  * [Specify a custom web packager port](#specify-a-custom-web-packager-port)
* [new](#new)

# Commands Usage Instructions

Now that you're all setup with Node.js and with the Chunky CLI, let's explore the available commands and see what Chunky can do for you. Here below is the complete list of all the commands available through the Chunky CLI. Have fun and don't forget to show & share your love for Chunky!

## run

*Runs the product on one or more platforms*

#### Run on all platforms

*Platforms: iOS, Android, Web*

```
$ chunky run 
```

#### Run on iOS only

```
$ chunky run --ios
```

#### Run on Android only

```
chunky run --android
```

#### Run on Web only

```
chunky run --web
```

#### Run on iOS and Android only

```
chunky run --ios --android
```

#### Run on iOS and Web only

```
chunky run --ios --web
```

#### Run on Android and Web only

```
chunky run --android --web
```
 
#### Specify a custom mobile packager port

```
chunky run --mobile-packager-port 9004
```

#### Specify a custom web packager port

```
chunky run --web-packager-port 9005
```

## new

*Creates a new product artifact*

#### Create a new product

*Creates the product from a default template*

```
$ chunky init 
```

or 

```
$ chunky init --app 
```