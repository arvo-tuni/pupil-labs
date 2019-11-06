import options from './options';

export default (topic: string) => { return {

  debug( msg: any ) {
    if (options.verbose) {
      // tslint:disable-next-line
      console.log( `\x1b[34m[${topic}]\x1b[36m`, msg, '\x1b[0m' );
    }
  },

  info( msg: any ) {
      // tslint:disable-next-line
      console.log( `\x1b[34m[${topic}]\x1b[0m`, msg );
  },

}};