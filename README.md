<p align="center">
  <a href="https://github.com/react-chunky/react-chunky">
    <img height="256" src="https://raw.githubusercontent.com/react-chunky/react-chunky/master/assets/c-logo.gif">
    <br/>
    <img width="256" src="https://raw.githubusercontent.com/react-chunky/react-chunky/master/assets/c-logo-h.png">
  </a>

<h3 align="center"> 
The Full Stack Product Development Platform That Makes Creating Products Feel Like Play.  
</h3>
Chunky helps aspiring, entry-level and seasoned developers become Full Stack Product Developers by providing a Creative Opinionated Developer Experience for building Native Mobile Apps, Web Apps, Static Websites and Serverless Cloud Backends. 

<h3 align="center">CLI •
<a href="https://github.com/react-chunky/react-native-chunky"> Mobile </a> •
<a href="https://github.com/react-chunky/react-dom-chunky"> Web </a> •
<a href="https://github.com/react-chunky/react-cloud-chunky"> Cloud </a> •
<a href="https://github.com/react-chunky/react-chunky-market"> Marketplace </a>
</h3>
<br/>
</p>

# The Chunky CLI 
    
<a href="https://www.npmjs.com/package/react-chunky-cli"> <img src="https://img.shields.io/npm/v/react-chunky-cli.svg"></a>

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

* [start](#start)
  * [Start all packagers](#start-all-packagers)
  * [Start the mobile packager](#start-the-mobile-packager)
  * [Start the web packager](#start-the-web-packager)
  * [Specify a custom mobile packager port](#specify-a-custom-mobile-packager-port)
  * [Specify a custom web packager port](#specify-a-custom-web-packager-port)
* [run](#run)
  * [Run on all platforms](#run-on-all-platforms)
  * [Run on iOS only](#run-on-ios-only)
  * [Run on Android only](#run-on-android-only)
  * [Run on Web only](#run-on-web-only)
  * [Run on iOS and Android only](#run-on-ios-and-android-only)
  * [Run on iOS and Web only](#run-on-ios-and-web-only)
  * [Run on Android and Web only](#run-on-android-and-web-only)
* [init](#init)
  * [Create a new product](#create-a-new-product)
  * [Create a new product from a product template](#create-a-new-product-from-a-product-template)
  * [Create a new chunk](#create-a-new-chunk)
  * [Create a new chunk from a chunk template](#create-a-new-chunk-from-a-chunk-template)

# Commands Usage Instructions

Now that you're all setup with Node.js and with the Chunky CLI, let's explore the available commands and see what Chunky can do for you. Here below is the complete list of all the commands available through the Chunky CLI. Have fun and don't forget to show & share your love for Chunky!

## start

*Starts the packagers in development mode*

#### Start all packagers

*Platforms: Mobile, Web*

```
$ chunky start
```

#### Start the mobile packager

```
$ chunky start --mobile
```

#### Start the web packager

```
$ chunky start --web
```

#### Specify a custom mobile packager port

```
chunky start --mobile-port 9004
```

#### Specify a custom web packager port

```
chunky start --web-port 9005
```

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
 
## init

*Creates a new product artifact*

#### Create a new product

*Creates the product from a default product template*

```
$ chunky init --name MyProduct
```

or 

```
$ chunky init --app --name MyProduct
```

#### Create a new product from a product template

```
$ chunky init --name MyProduct --template conference
```

#### Create a new chunk

*Creates the chunk from a default chunk template*

```
$ chunky init --chunk --name mychunk
```

#### Create a new chunk from a chunk template

```
$ chunky init --chunk --name mychunk --template list
```