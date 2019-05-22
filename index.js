// Imports

const app = require('./src/app');
const Request = require('./src/request');
const Subscriber = require('./src/subscriber');
const Messages = require('./src/messages');     // currently not used, see message format there


// Uncomment required subscribers and modify their callbacks
const subscribers = [
  //Subscriber.create.pupil( pupil => console.log(`[PUPL] ${pupil.id}: ${pupil.norm_pos.x} ${pupil.norm_pos.y}`) ),
  //Subscriber.create.gaze( gaze => console.log(`[GAZE] ${gaze.norm_pos.x} ${gaze.norm_pos.y}`) ),
  //Subscriber.create.fixation( fixation => console.log(`[FIXN] ${fixation.norm_pos.x} ${fixation.norm_pos.y}`) ),
  //Subscriber.create.surfaces( surface => console.log(`[SURF] ${surface.name} ${JSON.stringify( surface.gaze_on_srf[0].on_srf )}`) ),
  //Subscriber.create.blinks( blink => console.log(`[BLNK] ${blink.timestamp} blink ${blink.type}`) ),
  //Subscriber.create.annotation( annotation => console.log(`[ANNT] ${annotation.timestamp} ${annotation.label}`) ),
  //Subscriber.create.frame( (frame, image) => {
    //const camera = frame.topic.split('.')[1];
    //if (camera === 'world') {
      // do something with "image" here, it is of type "Buffer"
    //}
  //}),
  //Subscriber.create.logging( log => console.log( `[LOGS] ${JSON.stringify( log )}` ) ),
  Subscriber.create.notify( notification => console.log( `[NTFY] ${JSON.stringify( notification )}` ) ),
  Subscriber.create.other( (data, extras) => console.log( `[OTHR] -- ${JSON.stringify( data )}${extras ? ', has extras' : ''}` ) ),
];

app.start( subscribers );



// Examples

// Example of sending notification to Pupil to enabled Log_History plugin

setTimeout( _ => {
  console.log( '[MAIN] send request to start LogHistory' );
  app.notify({ 'subject': 'start_plugin', 'name': 'Log_History' });
}, 1000);

// Example of how to get timestamp and send logging info into Pupil

setTimeout( _ => {
  
  console.log( '[MAIN] send timestamp request' );
  app.request( REQUESTS.timestamp, timestamp => {

    // upon receiving a timestamp, send some logging info into Pupil
    const payload = { 
      levelname: 'INFO', 
      name: 'NODEJS', 
      msg: 'Log message from NodeJS', 
      timestamp, 
      topic: 'logging.info' 
    };
  
    console.log( `[MAIN] send info "${ payload.msg }" to Pupil` );
    app.command( payload );
  });
  
}, 2000 );


// Adding a new subscriber

const annotationTracker = Subscriber.create.annotation( annotation => {
  console.log( `[MAIN] -- got annotation "${annotation.label}" at ${annotation.timestamp} --` );
});

setTimeout( _ => {
  console.log( '[MAIN] add annotation tracker' );
  app.start( annotationTracker );
}, 3000);

// Removing this subscriber

setTimeout( _ => {
  console.log( '[MAIN] removing annotation tracker' );
  app.stop( annotationTracker );
}, 10000);

