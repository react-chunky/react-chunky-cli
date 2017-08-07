# The Chunky CLI User Guide

Welcome to the Chunky CLI User Guide.

This guide outlines all the available CLI commands that a developer can use to interface with the Chunky Platform. The guide is intended as the main starting point for aspiring or seasoned developers who are interested in the Chunky Platform. If you have not installed the Chunky CLI yet, please do so now before moving on:

```
npm -ig react-chunky-cli
```

# Overview

* [run](#run)

  * [Run on all platforms](run-on-all-platforms)

  * [Run on iOS only](run-on-ios-only)

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
