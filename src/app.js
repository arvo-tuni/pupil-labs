// Imports

const zmq = require('zeromq');
const process = require('process');
const serializer = require('msgpack-lite');

const log = require('./log')( 'APPC' );
const requester = require('./requester');
const Request = require('./request');


// Constants

const HOST_ADDRESS = '127.0.0.1';
const REQUEST_PORT = 50020;

// Main routine
let _subscribers = [];

log.debug( 'Started' );
requester.connect( HOST_ADDRESS, REQUEST_PORT );

// finilizing when Ctrl+C is pressed
process.on( 'SIGINT', () => {
  _subscribers.forEach( subscriber => subscriber.close() );
  requester.close();
  log.debug( 'Closed' );
});

/// Exported API
const app = {
  
  /// Connects subscribers to Pupil
  /// Args:
  ///  - subscribers: [Subscriber] | Subscriber
  start( subscribers ) {
    if (Array.isArray( subscribers )) {
      _subscribers = _subscribers.concat( subscribers );
      requester.subscribe( subscribers );
    }
    else {
      _subscribers.push( subscribers );
      requester.subscribe( [ subscribers ] );
    }
  },
  
  /// Disconnects subscribers to Pupil
  /// Args:
  ///  - subscribers: [Subscriber] | Subscriber
  stop( subscribers ) {
    if (Array.isArray( subscribers )) {
      _subscribers = _subscribers.filter( sub => !subscribers.includes( sub ) );
      subscribers.forEach( subscriber => subscriber.close() );
    }
    else {
      _subscribers = _subscribers.filter( sub => sub !== subscribers );
      subscribers.close();
    }
  },

  /// Sends a request to Pupil and fires callback function upon receiving response
  /// Args:
  ///  - id: String - a value from pupil.js/REQUESTS list
  ///  - cb: Function( reply ) - a callback that receives the response
  request( id, cb ) {
    requester.send( new Request( id, cb) );
  },
  
  /// Sends a command to Pupil and fires callback function upon receiving response
  /// Args:
  ///  - cmd: { topic: String, ... } - an object with "topic" field at least
  ///  - cb: Function( reply ) - a callback that receives the response
  command( cmd, cb ) {
    const payload = serializer.encode( cmd );
    const req = new Request( [ cmd.topic, payload ], cb );
    requester.send( req );
  },
  
  /// Sends a notification to Pupil
  /// Args:
  ///  - notification: { subject: String, ... } - must have "subject" field
  notify( notification ) {
    const topic = 'notify.' + notification.subject;
    notification.topic = topic;
    
    const payload = serializer.encode( notification );
    const notificationRequest = new Request( [ topic, payload ] );
    
    requester.send( notificationRequest );
  },
  
};


module.exports = app;