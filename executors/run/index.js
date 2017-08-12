const coreutils = require('coreutils')
const ios = require('./ios')
const android = require('./android')
const web = require('./web')
const site = require('./site')

function parseCommand(command) {
   if (command.platforms.length == 0) {
        command.platforms = ["ios", "android", "web", "site"]
    }

    command.platforms.forEach(platform => {
        switch(platform) {
            case 'ios':
                ios()
            break;
            case 'android':
                android()
            break;
            case 'web':
                web(command.webPort)
            break;
            case 'site':
                site(command.sitePort)
            break;
        }
    })    
}

module.exports = function(command) {
    try {
        parseCommand(command)
    } catch (error) {
        coreutils.logger.error(error)
    }
}