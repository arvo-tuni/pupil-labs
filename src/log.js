const options = require('./options');

module.exports = topic => { return {
  debug( msg ) {
    if (options.verbose) {
      console.log( `[${topic}]`, msg );
    }
 },
}};