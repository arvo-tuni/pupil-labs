/// Request with data to send to Pupil and a callback to process the reply.
class Request {

  /// Constructor
  /// Args
  ///  - data: <any value from pupil.js/REQUESTS> | [topic: String, payload: Buffer] - payload should be encoded with MsgPack
  ///  - process: Function( reply ) - a callback to be called when the reply is recevied
  constructor( data, process ) {
    this.data = data;
    this.process = process;
  }

}

module.exports = Request;