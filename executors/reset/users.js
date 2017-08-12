const coreutils = require('coreutils')
const firebaseline = require('firebaseline')

module.exports = function(firebase) {
    coreutils.logger.info("Resetting users ...")

    return firebaseline.operations.retrieve(firebase, { key: 'users' }).
           then(users => users.map(user => user._id)).
           then(ids => Promise.all(ids.map(id => firebaseline.operations.unregister(firebase, { id })))).
           then(ids => firebaseline.operations.remove(firebase, { key: 'users' })).
           then(() => coreutils.logger.done())
}