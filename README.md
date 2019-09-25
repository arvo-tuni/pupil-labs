# PupilLabs client application intended to use in ARVO

## Requirements

Download and install the following applications:

- [Git](https://git-scm.com/)
- [NodeJS](https://nodejs.org/en/download/current/)

## Install

Open a console in some folder. Run the following commands:

```bash
git clone https://github.com/arvo-tuni/pupil-labs.git
cd pupil-labs
npm install
```

## Usage and API

Create a JS file in the project root folder that will be a starting point of your application. You can also modify the existing index.js file that serves as a template for you application.

In the JS file, import the app:

`const app = require('./src/app');`

Also, import *Subscriber* class definition:

`const Subscriber = require('./src/subscriber');`

Then:
 - Create and connect subscribers for the topics you wish to monitor the data. 
 - Request information from Pupil
 - Send commands and notifications to the Pupil

See the index.js file that comes with the package to get overview of what subscribers are available.

**API**

### app.start( subscribers )

Connects subscribers to Pupil.

Arguments:
 - `subscribers: [Subscriber] | Subscriber`
 
Example:

```js
const annotationTracker = Subscriber.create.annotation( annotation => {
  // do something with annotation that comes from Pupil
});
app.start( annotationTracker );
```

Available subscribers are listed next. See the `/src/mesages.js` file to get an overview of that kind of data each subscriber delivers: 
 - pupil
 - gaze (sample)
 - fixation
 - surfaces (surfaces, a plain mapped onto a scene camera, must be created in Pupil Capture)
 - blinks (IMPORTANT: unreliable event, offset may be missing, onset comes with delays)
 - annotation (annotations are user-defined events triggered manually by pressing a certain key in Pupil Capture)
 - frame (contains image data that may be accessed as follow:)
    ```js
    const camera = frame.topic.split('.')[1];
    if (camera === 'world') {
      // do something with "frame.image" here, it is of type "Buffer"
    }
    ```
 - logging (all log events that Pupil Capture produces)
 - notify (receives notifications about various events happened internally in Pupil Capture:
    - StartPlugin
    - StartCalibration
    - CalibrationStarted
    - CalibrationStopped
    - CalibrationSuccessful
    - CalibrationFailed
    - CalibrationData
    - WorldProcessStopped
    - StopEyeProcess
    - EyeProcessStopped
    - ... the list not full, the `subject` member of the notification data may have other values
    )

### app.stop( subscribers )
  
Disconnects subscribers to Pupil.

Arguments:
 - `subscribers: [Subscriber] | Subscriber`

Example:

```js
app.stop( annotationTracker );
```

### app.request( id, cb )

Sends a request to Pupil and fires callback function upon receiving response

Arguments:
 - `id: string | [string, Buffer]` - a value from the `/src/pupil.js:REQUESTS` list, or, if the request requires a parameter, an array with a value from the `/src/pupil.js:REQUESTS` list and the parameters encoded with MsgPack
 - `cb: function( resp )` - a callback that receives the response; if a callback is not provided, the function returns a promise

Returns:
 - `Promise` if a callback is not provided, `undefined` otherwise
 
Example:

```js
const { REQUESTS } = require('./src/pupil');

app.request( REQUESTS.timestamp, timestamp => {
  // do something with the timestamp, but first convert it to a number
});

// or

app.request( REQUESTS.timestamp ).then( timestamp => {
  // do something with the timestamp, but first convert it to a number
});

```

The following requests are available:
 - *startRecording*: starts recording with auto generated session name
 - *startRecordingAs( name )*: starts recording and name new session as "<name>"
 - *stopRecording:*
 - *startCalibration*: starts a calibration of a currently selected (in Pupil Capture) type
 - *stopCalibration*: stops/terminates the calibration
 - *sync( time )*: sets the Pupil Capture internal timer
 - *timestamp*: gets Pupil Capture current timestamp used internally (NOTE: a floating-type number is returned as a string!)

Notice that two requests in REQUESTS are functions, so call them when submitting a request, for example:

```js
app.request( REQUESTS.startRecordingAs( 'test' ) ).then( resp => {
  // do something with the "resp" is needed
});
```

### app.command( cmd, cb )

Sends a command to Pupil and fires callback function upon receiving response

Arguments:
 - `cmd: { topic: string, ... }` - an object with *topic* field at least
 - `cb: function( resp )` - a callback that receives the response; if a callback is not provided, the function returns a promise

Returns:
 - `Promise` if a callback is not provided, `undefined` otherwise

Example:

```js
const cmd = { 
  levelname: 'INFO',
  name: 'NODEJS',
  msg: 'Log message from NodeJS',
  topic: 'logging.info',
};
  
app.command( cmd, resp => {
  console.log( resp );
});

// or   

app.command( cmd ).then( resp => {
  console.log( resp );
});
```

See Pupil documentation to figure out what values are valid for the `topic` field and what other fields are required.

### app.notify( notification )

Sends a notification to Pupil. Similar to `command` but do not return any response.

Arguments:
 - `notification: { subject: String, ... }` - must have *subject* field

Example:

```js
app.notify({ subject: 'start_plugin', name: 'Log_History' });
```

See Pupil documentation to figure out what values are valid for the `subject` field and what other fields are required.

## Run an example app

Pupil Capture application must be running before you run the application.

Run the example application in console as

```bash
node index.js
```