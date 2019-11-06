// Imports

import zmq from 'zeromq';
import Request, { ProcessCallback } from './request';
import logFactory from './log';
import Subscriber from './subscriber';

const log = logFactory( 'REQR' );


// Variables

const _requester = zmq.socket( 'req' );
_requester.monitor();     // enables "connect", "disconnect" and other messages

const _queue: Request[] = [];        // queue of requests

let _busy = false;        // true if still processing a request
let _isConnected = false; // true if the requester is connected
let _host = '127.0.0.1';  // host IP
let _port = 0;

const makeURL = (port: string | number) => `tcp://${_host}:${port}`;   // creates URL given the port


/// Handles request sending and partially handles respond from the Pupil
class Requester {

  /// Constructor. Sets event callbacks
  constructor() {

    _requester.on( 'connect', (delay: string | number) => {
      log.debug( `  connected in ${delay} ms` );
      _isConnected = true;
      this._checkQueue();
    });

    _requester.on( 'disconnect', _ => {
      log.debug( 'Disconnected' );
      _isConnected = false;
      });

    _requester.on( 'connect_retry', _ => {
      log.debug( `Retry connecting: ${_}` );
    });

    _requester.on( 'close', _ => {
      log.debug( 'Closed' );
      _isConnected = false;
    });

    _requester.on( 'message', (reply: any) => {
      log.debug( `  got reply "${reply}"` );

      const request = _queue.shift();
      if (request && request.process) {
        const cb = request.process as ProcessCallback;
        setImmediate( () => cb( reply ) ); // using setImmediate here to fire the callback after the network communication ends
      }

      _busy = false;

      this._checkQueue();
    });

  }


  /// Opens the requester communication channel. Should be called prior sending any requests.
  connect( host: string, port: number ) {
    _host = host;
    const url = makeURL( port );
    _requester.connect( url );
  }


  /// Closes the requester communication channel
  close() {
    _requester.close();
  }


  /// Connects subscribers after receiving the subscribers' port
  subscribe( subscribers: Subscriber[] ) {

    this._getPort().then( port => {
      const url = makeURL( port as number );

      log.debug( `  starting ${subscribers.length} subscribers` );
      subscribers.forEach( subscriber => {
        subscriber.connect( url );
      });
    }).catch( (reason: any) => {
      log.debug( reason );
    });
  }


  /// Sends (or puts to a queue) requests
  send( req: Request ) {
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
      setImmediate( _ => _requester.send( req.data ) );    // using setImmediate here to unbind the request sending from the current routine which may be called from the Pupil reply callback

      log.debug( `  sending next request "${Array.isArray(req.data) ? req.data[0] : req.data}"` );
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
            return reject( `  invalid subscription port "${port}".` );
          }

          log.debug( `  subscription port is "${port}".` );

          _port = port;

          setTimeout( () => resolve( port ), 0 ); // allow the callback to be finished before we return the port number
                                                  // to the procedure when a new connection may be requested immediately
        });

        this.send( subPortRequest );
      });
    }
  }

}


// the requester is a singleton
const requester = new Requester();

export default requester;
