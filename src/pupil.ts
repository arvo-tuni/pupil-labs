export default {

  /// Requests supported by Pupil
  REQUESTS: {
    startRecording: 'R',        //  start recording with auto generated session name
    startRecordingAs: (name: string) => `R ${name}`,   // start recording and name new session as "<name>"
    stopRecording: 'r',
    startCalibration: 'C',      //  start currently selected calibration
    stopCalibration: 'c',       //  stop currently selected calibration
    sync: (time: string | number) => `T ${time}`,  // Timesync: make timestamps count form <time> from now on.
    timestamp: 't',             // get pupil capture timestamp; returns a float as string.
  },

};
