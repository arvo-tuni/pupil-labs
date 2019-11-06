import commandLineArgs from 'command-line-args';

const CMD_OPT_DEFS = [
  { name: 'verbose', alias: 'v', type: Boolean, defaultValue: false, description: 'outputs debug information' },
  { name: 'help', alias: 'h', type: Boolean, defaultValue: false, description: 'prints this help info' },
];

const options = commandLineArgs( CMD_OPT_DEFS );

if (options.help) {
  // tslint:disable-next-line
  console.log( `
  Usage: node index.js [parameters]

  parameters:
  `);

  // tslint:disable-next-line
  CMD_OPT_DEFS.forEach( def => console.log( `    - ${def.name}: ${def.description}` ) );

  // tslint:disable-next-line
  console.log( '\n' );
}

export default options;
