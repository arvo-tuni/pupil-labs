// Imports

const zmq = require('zeromq');
const Request = require('./request');

const log = require('./log')( 'REQR' );


// Variables

const _requester = zmq.socket('req');
_requester.monitor();     // enables "connect", "disconnect" and other messages

const _queue = [];        // queue of requests

let _busy = false;        // true if still processing a request
let _isConnected = false; // true if the requester is connected
let _host = '127.0.0.1';  // host IP
let _port = 0;

const makeURL = port => `tcp://${_host}:${port}`;   // creates URL given the port


/// Handles request sending and partialy handles respond from the Pupil
class Requester {

  /// Constgructor. Sets event callbacks
  constructor() {

    _requester.on( 'connect', delay => {
      log.debug( `connected in ${delay} ms` );
      _isConnected = true;
      this._checkQueue();
    });
    
    _requester.on( 'disconnect', _ => {
      log.debug( 'disconnected' );
      _isConnected = false;
      });
 
    _requester.on( 'connect_retry', _ => {
      log.debug( `retry connecting: ${_}` );
    });
    
    _requester.on( 'close', _ => {
      log.debug( 'closed' );
      _isConnected = false;
    });
    
    _requester.on( 'message', reply => {
      log.debug( `got reply "${reply}"` );
      
      const request = _queue.shift();
      if (request.process) {
        setTimeout( _ => request.process( reply ), 0); // using setTimeout here to fire the callback after network communication ends
      }
    
      _busy = false;

      this._checkQueue();
    });
    
  }

  
  /// Opens the requester communication channel. Shoud be called prior sending any requests.
  /// Args
  ///  - host: String - host IP address
  ///  - port: Number - port to send requests to
  connect( host, port ) {
    _host = host;
    const url = makeURL( port ); 
    _requester.connect( url );
  }
  
  
  /// Closes the requester communication channel
  close() {
    _requester.close();   
  }
  
  
  /// Connects subscribers after receiving the subscribers' port
  /// Args:
  ///  - subscribers: [Subscriber]
  subscribe( subscribers ) {

    this._getPort().then( port => {
      const url = makeURL( port );

      log.debug( `Starting ${subscribers.length} subscribers` );
      subscribers.forEach( subscriber => {
        subscriber.connect( url );
      });
    }).catch( reason => {
      log.debug( reason );
    });
  }

  
  /// Sends (or puts to a queue) requests
  /// Args:
  ///  - req: Request
  send( req ) {
    _queue.push( req );
  
    if (!_busy && _isConnected) {
      _busy = true;
      log.debug( `  sending request "${Array.isArray(req.data) ? req.data[0] : req.data}"` );
      _requester.send( req.data );   
    }
    else {
      log.debug( `  busy... request "${Array.isArray(req.data) ? req.data[0] : req.data}" queued` );
    }
  }

  
  // Internal methods

  _checkQueue() {
    if (_queue.length > 0) {
      _busy = true;
      
      const req = _queue[0];
      setTimeout( _ => _requester.send( req.data ), 0);    // using setTimeout here to unbind the request sending from the curernt routine which may be called from the Pupil reply callback

      log.debug( `sending next request "${Array.isArray(req.data) ? req.data[0] : req.data}"` );
    }
  }
  
  _getPort() {
    if (_port) {
      return Promise.resolve( _port );
    }
    else {
      return new Promise( (resolve, reject) => {
        const subPortRequest = new Request( 'SUB_PORT', reply => {

          const port = +reply;

          if (port <= 0 || 65355 < port) {
            return reject( `Invalid subscription port "${port}".` );
          }
          
          log.debug( `Subscription port is "${port}".` );

          _port = port;
          resolve( port );
        });
        
        this.send( subPortRequest );
      });
    }
  }
  
}


// the requester is a singlton
const requester = new Requester();

module.exports = requester;