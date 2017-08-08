# The Chunky CLI User Guide
    
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

# Commands

Now that you're all setup with Node.js and with the Chunky CLI, let's explore the available commands and see what Chunky can do for you. Here below is the complete list of all the commands available through the Chunky CLI. Have fun and don't forget to show & share your love for Chunky!

* [start](/docs/start)
  * [Start all packagers](/guide/start#start-all-packagers)
  * [Start the mobile packager](/guide/start#start-the-mobile-packager)
  * [Start the web packager](/guide/start#start-the-web-packager)
  * [Specify a custom mobile packager port](/guide/start#specify-a-custom-mobile-packager-port)
  * [Specify a custom web packager port](/guide/start#specify-a-custom-web-packager-port)
* [run](/guide/run)
  * [Run on all platforms](/guide/run#run-on-all-platforms)
  * [Run on iOS only](/guide/run#run-on-ios-only)
  * [Run on Android only](/guide/run#run-on-android-only)
  * [Run on Web only](/guide/run#run-on-web-only)
  * [Run on iOS and Android only](/guide/run#run-on-ios-and-android-only)
  * [Run on iOS and Web only](/guide/run#run-on-ios-and-web-only)
  * [Run on Android and Web only](/guide/run#run-on-android-and-web-only)
* [init](/guide/init)
  * [Create a new product](/guide/init#create-a-new-product)
  * [Create a new product from a product template](/guide/init#create-a-new-product-from-a-product-template)
  * [Create a new chunk](/guide/init#create-a-new-chunk)
  * [Create a new chunk from a chunk template](/guide/init#create-a-new-chunk-from-a-chunk-template)