const coreutils = require('coreutils')
const path = require('path')
const fs = require('fs-extra')
const common = require('../common')
const Serverless = require('../src/Serverless')
const firebaseline = require('firebaseline')
const firebase = require("firebase-admin")
const yaml = require('js-yaml')
const WPAPI = require('wpapi')

function getWordpressSitePostsPage(wp, page = 1) {
    return wp.posts().perPage(100).page(page).embed()
} 

function getWordpressSitePosts(wp) {
    return getWordpressSitePostsPage(wp).
        then(posts => {
        const totalPosts = posts._paging.total
        const totalPages = posts._paging.totalPages
        coreutils.logger.ok(`Loaded ${totalPosts} posts.`)

        if (totalPages === 1) {
            return Promise.resolve(posts)
        }

        var allNextRequests = []
        for (var p = 1; p < totalPages; p++) {
            allNextRequests.push(getWordpressSitePostsPage(wp, p + 1))
        }

        return Promise.all(allNextRequests).then(pages => {
            var all = [].concat(posts)
            pages.forEach(pagePosts => { all = all.concat(pagePosts) })
            return all
        })
    })
}

function syncWordpressSitePosts(site, posts) {
    return firebaseline.operations.retrieve(firebase, { key: `posts` }).
    then(currentPosts => {
        var index = {}
        delete currentPosts._id
        if (currentPosts) {
            currentPosts.map(currentPost => (index[currentPost._id] = true))
        }
        return index
    }).
    then(index => {
        return Promise.all(posts.map(post => {
            delete index[post.id]
            var summary = {
                key: `posts/${site}-${post.id}`,
                title: post.title.rendered,
                date: post.modified
            }
            if (post._embedded && post._embedded['wp:featuredmedia'] && 
                post._embedded['wp:featuredmedia'][0] && post._embedded['wp:featuredmedia'][0].source_url) {
                summary.imageUrl = post._embedded['wp:featuredmedia'][0].source_url
            }
            var content = {
                key: `posts-content/${site}-${post.id}`,
                data: post.content.rendered
            }
            return firebaseline.operations.update(firebase, summary).
                   then(() => firebaseline.operations.update(firebase, content))
        })).
        then(() => ({ totalUpdated: posts.length, index }))
    }).
    then(({ totalUpdated, index }) => {
        coreutils.logger.ok(`Updated ${totalUpdated} posts`)
        if (!index || Object.keys(index).length === 0) {
            // Nothing to delete
            return 
        }
        return Promise.all(Object.keys(index).map(id => {
            return firebaseline.operations.remove(firebase, { key: `posts/${site}-${id}` }).
                   then(() => firebaseline.operations.remove(firebase, { key: `posts-content/${site}-${id}` }))
        }))
    }).
    then(removed => {
        if (!removed) {
            return
        }
        coreutils.logger.ok(`Removed ${removed.length} stale posts.`)
    })
}

function syncNextWordpressSite(sites, wp) {
    if (!sites || sites.length === 0) {
        return Promise.resolve()
    }
    
    const site = sites[0]

    coreutils.logger.info(`Syncing the ${site} site ...`)
    return getWordpressSitePosts(wp[site]).
        then(posts => {
            return syncWordpressSitePosts(site, posts)
        }).
        then(result => {
            coreutils.logger.ok(`Synced posts.`)
        }).
        then(result => {
            return syncNextWordpressSite(sites.slice(1), wp)
        })
}

function syncWordpressSites(env) {
     // Let's get Firebase setup
    initializeFirebase(env)

    const wp = initializeWordpress(env)
    const sites = Object.keys(wp)
    const totalSites = sites.length

    coreutils.logger.info(`Syncing your Wordpress sites with your Chunky Cloud ...`)
    coreutils.logger.ok(`Found ${totalSites} site${totalSites > 1 ? 's' : ''}`)

    return syncNextWordpressSite(sites, wp).
           then(() => {
             coreutils.logger.info(`Successfully synced all sites.`)
             coreutils.logger.ok(`Enjoy!`)
             process.exit(0)
           }).catch(error => {
             coreutils.logger.error(error)
             process.exit(1)
           })
}

function secureConfig(env) {
    const config = common.loadSecureConfig()

    if (!config || !config[env]) {
        throw new Error("Invalid secure configuration")
    }

    return config[env]
}

function runServerless(service, options) {
    const servicePath = path.resolve(process.cwd(), 'cloud', 'services', service)

    if (!fs.existsSync(servicePath)) {
        throw new Error(`Looks like an unknown service: ${service} (${options.env})`)
    }   

    const awsConfig = secureConfig(options.env).aws

    if (!awsConfig) {
        throw new Error('Invalid AWS secure configuration')
    }

    process.env.AWS_ACCESS_KEY_ID=awsConfig.key
    process.env.AWS_SECRET_ACCESS_KEY=awsConfig.secret
    process.env.AWS_DEFAULT_REGION=awsConfig.region

    const serverless = new Serverless({
        interactive: false,
        servicePath
    })

    return serverless.init({ commands: ['deploy'], options }).
        then(() => serverless.run()).
        catch(e => {
            throw e
        })
}

function executeFirebaselineOperations(operations) {
    return Promise.all(operations.map(args => {
        const name = args.operation
        const operation = firebaseline.operations[name]
        if (!operation) {
            // Ignore invalid operationss
            return
        }

        delete args.operation
        return operation(firebase, args)
    }))
}

function runFirebaselineOperations(groups, operations) {
    if (!groups || groups.length === 0) {
        return Promise.resolve()
    }

    const nextGroup = groups[0]
    const nextOperations = operations[nextGroup]

    if (!nextOperations || nextOperations.length === 0) {
        throw new Error(`Missing ${group} operations`)
    }

    coreutils.logger.info(`Running ${nextGroup} operations (${nextOperations.length}) ...`)

    return executeFirebaselineOperations(nextOperations).
        then(result => {
            coreutils.logger.ok(`↳ All done.`)
            return runFirebaselineOperations(groups.slice(1), operations)
        }).
        catch(error => {
            coreutils.logger.error(error)
            process.exit(1)
        })
}

function initializeFirebase(env) {
    const firebaseConfig = secureConfig(env).firebase

    if (!firebaseConfig || !firebaseConfig.serviceAccount) {
        throw new Error('Invalid Firebase secure configuration')
    }

    firebase.initializeApp({
        credential: firebase.credential.cert(firebaseConfig.serviceAccount),
        databaseURL: "https://" + firebaseConfig.serviceAccount.project_id + ".firebaseio.com"
    })
}

function initializeWordpress(env) {
    const wordpressConfig = secureConfig(env).wordpress

    if (!wordpressConfig) {
        throw new Error('Invalid Wordpress secure configuration')
    }

    if (!Object.keys(wordpressConfig).length === 0) {
        throw new Error('Missing Wordpress sites')
    }

    var apis = {}

    for (var siteKey in wordpressConfig) {
        const site = wordpressConfig[siteKey]

        if (!site || !site.url) {
            continue
        }

        apis[siteKey] = new WPAPI({ endpoint: `${site.url}/wp-json` })
    }

    if (Object.keys(apis).length === 0) {
        throw new Error('Missing Wordpress sites')
    }

    return apis
}

function runFirebaseline(transformation, options) {
    const transformationPath = path.resolve(process.cwd(), 'cloud', 'transformations', transformation)

    if (!fs.existsSync(transformationPath)) {
        throw new Error(`Looks like an unknown transformation: ${transformation} (${options.env})`)
    }   

    // Look for the firebaseline file
    const firebaselineFile = path.resolve(transformationPath, 'firebaseline.yaml')

    if (!fs.existsSync(firebaselineFile)) {
        // We can't continue without this file
        throw new Error('The firebaseline.yaml file is missing')
    }

    // Let's get Firebase setup
    initializeFirebase(options.env)

    // Load all operations
    const ops = yaml.safeLoad(fs.readFileSync(firebaselineFile, 'utf8'));

    if (!ops || Object.keys(ops).length === 0) {
        throw new Error('Missing firebaseline operations')
    }

    // Look at the groups
    const groups = Object.keys(ops)
    coreutils.logger.ok(`Found ${groups.length} groups of operations`)

    return runFirebaselineOperations(groups, ops)
}

function deploy(service, options) {
    coreutils.logger.info(`Deploying the ${service} service to the ${options.env} environment ...`)

    runServerless(service, options).then(() => {
        coreutils.logger.info(`The ${service} service was successfully deployed to the ${options.env} environment.`)
        coreutils.logger.ok(`Enjoy!`)
        process.exit(0)
    }).catch(error => {
        coreutils.logger.error(error)
        process.exit(1)
    })
}

function transform(transformation, options) {
    coreutils.logger.info(`Applying the ${transformation} transformation to the ${options.env} environment ...`)

    runFirebaseline(transformation, options).then(() => {
        coreutils.logger.info(`The ${transformation} transformation was successfully applied to the ${options.env} environment.`)
        coreutils.logger.ok(`Enjoy!`)
        process.exit(0)
    }).catch(error => {
        coreutils.logger.error(error)
        process.exit(1)
    })
}

function resetUsers() {
    coreutils.logger.info(`Removing all users ...`)    
    return firebaseline.operations.retrieve(firebase, { key: 'users' }).then(users => {
        delete users._id
        return Object.keys(users)
    }).then(ids => {
        return Promise.all(ids.map(id => firebaseline.operations.unregister(firebase, { id })))
    }).then(() => {
        coreutils.logger.ok(`All users have been removed.`)
    })
}

function resetData() {
    coreutils.logger.info(`Removing all data ...`)
    return firebaseline.operations.remove(firebase, { key: '/' }).
    then(() => {
        coreutils.logger.ok(`All data has been removed.`)
    })
}

function reset(parts, options) {
    const allowed = { users: true, data: true }
    var resetParts = {}
    parts.split("+").forEach(part => (allowed[part] && (resetParts[part] = true)))
    
    coreutils.logger.info(`Resetting the ${options.env} environment ...`)
    coreutils.logger.ok(`Resetting ${Object.keys(resetParts).join(' & ')}`)

    // Let's get Firebase setup
    initializeFirebase(options.env)

    return Promise.resolve().
           then(() => resetParts.users && resetUsers()).
           then(() => resetParts.data && resetData()).
           then(() => {
             coreutils.logger.info(`Successfully reset the ${options.env} environment.`)
             coreutils.logger.ok(`Enjoy!`)
             process.exit(0)
           }).catch(error => {
             coreutils.logger.error(error)
             process.exit(1)
           })
}

function sync(system, options) {
    switch (system) {
        case 'wordpress':
        return syncWordpressSites(options.env)
    }

    throw new Error('Not sure what you are asking to sync')
}

function parseCommand(command) {
    
    if (!command.options.env) {
        throw new Error('Please specify an environment (--env)')
    }
    
    if (command.options.deploy) {
        return deploy(command.options.deploy, { 
            env: command.options.env
         })
    }

    if (command.options.transform) {
        return transform(command.options.transform, { 
            env: command.options.env
         })
    }

    if (command.options.reset) {
        return reset(command.options.reset, { 
            env: command.options.env
         })
    }

    if (command.options.sync) {
        return sync(command.options.sync, { 
            env: command.options.env
         })
    }

    throw new Error('Unsupported cloud operation')
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        coreutils.logger.error(error)
    }
}