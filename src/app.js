// Imports

const zmq = require('zeromq');
const process = require('process');
const serializer = require('msgpack-lite');

const log = require('./log')( 'APPC' );
const requester = require('./requester');
const { REQUESTS } = require('./pupil');
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
  
  request( id, cb ) {
    requester.send( new Request( id, cb) );
  },
  
  command( payload, cb ) {
    const payloadEnc = serializer.encode( payload);
    const req = new Request( [ payload.topic, payloadEnc ], cb );
    requester.send( req );
  },
  
  notify( notification ) {
    const topic = 'notify.' + notification.subject;
    notification.topic = topic;
    
    const payload = serializer.encode( notification );
    const notificationRequest = new Request( [ topic, payload ] );
    
    requester.send( notificationRequest );
  },
};


module.exports = app;