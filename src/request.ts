import REQUESTS from './pupil'

export type RequestData = string | [string, Buffer];
export type ProcessCallback = ( reply: any ) => void;

/// Request with data to send to Pupil and a callback to process the reply.
export default class Request {

  data: RequestData;
  process?: ProcessCallback;

  /// Constructor
  /// Args
  ///  - data: <any value from pupil.js/REQUESTS> | [topic: String, payload: Buffer] - payload should be encoded with MsgPack
  ///  - process: Function( reply ) - a callback to be called when the reply is recevied
  constructor( data: RequestData, process?: ProcessCallback ) {
    this.data = data;
    this.process = process;
  }

}
