# The Chunky CLI User Guide

Welcome to the Chunky CLI User Guide.

This guide outlines all the available CLI commands that a developer can use to interface with the Chunky Platform. The guide is intended as the main starting point for aspiring or seasoned developers who are interested in the Chunky Platform. If you have not installed the Chunky CLI yet, please do so now before moving on:

```
npm -ig react-chunky-cli
```

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