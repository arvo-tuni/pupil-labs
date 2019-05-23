const options = require('./options');

module.exports = topic => { return {

  debug( msg ) {
    if (options.verbose) {
      console.log( `\x1b[34m[${topic}]\x1b[36m`, msg, '\x1b[0m' );
    }
  },

  info( msg ) {
    console.log( `\x1b[34m[${topic}]\x1b[0m`, msg );
  },

}};