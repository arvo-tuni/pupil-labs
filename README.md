# PupilLabs client application intended to use in ARVO

## Requirements

- [Git](https://git-scm.com/)
- [NodeJS](https://nodejs.org/)

## Install

```bash
git clone https://github.com/lexasss/arvo-pupil-labs.git

npm install
```

## Usage and API

Create an JS file in the project root folder (for example *index.js*).

In the JS file, import the app:

`const app = require('./src/app');`

Also, import *Subscriber* class definition:

`const Subscriber = require('./src/subscriber');`

Then:
 - Create and connect subscribers for the topics you wish to monitor the data. 
 - Request information from Pupil
 - Send commands and notifications to the Pupil

### app.start( subscribers )

Connects subscribers to Pupil.

Arguments:
 - `subscribers: [Subscriber] | Subscriber`
 
Example:

```js
const annotationTracker = Subscriber.create.annotation( annotation => {
  // do something with annotation
});
app.start( annotationTracker );
```

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
 - `id: String` - a value from *pupil.js/REQUESTS* list
 - `cb: Function( resp )` - a callback that receives the response; if a callback is not provided, the function returns a promise

Returns:
 - `Promise` if a callback is not provided, `undefined` otherwise
 
Example:

```js
const { REQUESTS } = require('./pupil');

app.request( REQUESTS.timestamp, timestamp => {
  // do something with the timestamp
});

// or

app.request( REQUESTS.timestamp ).then( timestamp => {
  // do something with the timestamp
});

```

### app.command( cmd, cb )

Sends a command to Pupil and fires callback function upon receiving response

Arguments:
 - `cmd: { topic: String, ... }` - an object with *topic* field at least
 - `cb: Function( resp )` - a callback that receives the response; if a callback is not provided, the function returns a promise

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

### app.notify( notification )

Sends a notification to Pupil

Arguments:
 - `notification: { subject: String, ... }` - must have *subject* field

Example:

```js
app.notify({ 'subject': 'start_plugin', 'name': 'Log_History' });
```

## Run an example app

Pupil Capture application must be running before you run the application.

Run the example application in console as

```bash
node index.js
```