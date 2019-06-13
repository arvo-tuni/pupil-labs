/*
 * This is incomplete list of messages that can be received from Pupil.
 * The class definitions only indicate what data fields are available and 
 * of what type they are. Some fields has fixed values, these are described
 * in comments. Units are also described in comments whenever appropriate.
 *
 * IMPORTANT!
 * Starting from June 2019, 2D and 3D points in Gaze are of type "Number[]" rahter than {x: Number, y: Number}
 * Probably, type of points was also changed in other definitions.
 * THESE CHANGES SHOULD BE REFLECTED IN THIS FILE!
 */

// Inner types

class Vector2D { constructor() {
  this.x = Number;
  this.y = Number;
}}

class Vector3D { constructor() {
  this.x = Number;
  this.y = Number;
  this.z = Number;
}}

class Circle3D { constructor() {
  this.center = Vector3D;
  this.normal = Vector3D;
  this.radius = Number;
}}

class Ellipse { constructor() {
  this.center = Vector2D;
  this.axes = Vector2D;
  this.angle = Number;          // degrees
}}

class Sphere { constructor() {
  this.center = Vector3D;
  this.radius = Number;
}}

class ProjectedSphere { constructor() {
  this.center = Vector2D;
  this.axes = Vector2D;
  this.angle = Number;          // degrees
}}

class GazeOnSurface { constructor() {
  this.topic = String;          // "gaze.3d.0|1._on_surface",
  this.norm_pos = Vector2D;
  this.confidence = Number;     // 0..1
  this.on_srf = Boolean;
  this.base_data = Gaze;
  this.timestamp = Number;      // seconds
}}

class CalibrationReference { constructor() {
  this.norm_pos = Vector2D;
  this.screen_pos = Vector2D;
  this.timestamp = Number;      // seconds
}}


// Primary types

class Pupil { constructor() {
  this.topic = String;          // "pupil.0|1."
  this.circle_3d = Circle3D;
  this.confidence = Number;     // 0..1
  this.timestamp = Number;      // seconds
  this.diameter_3d = Number;
  this.ellipse = Ellipse;
  this.norm_pos = Vector2D;
  this.diameter = Number;
  this.sphere = Sphere;
  this.projected_sphere = ProjectedSphere;
  this.model_confidence = Number;       // 0..1
  this.model_id = String;
  this.model_birth_timestamp = Number;  // seconds
  this.theta = Number;
  this.phi = Number;
  this.method = String;         // like "3d c++"
  this.id = Number;             // 0|1
}}

class Gaze { constructor() {
  this.topic = String;          // "gaze.3d.0|1."
  this.eye_center_3d = Vector3D;
  this.gaze_normal_3d = Vector3D;
  this.gaze_point_3d = Vector3D;
  this.confidence = Number;     // 0..1,
  this.timestamp = Number;      // seconds
  this.base_data = [ Pupil ];
  this.norm_pos = Vector2D;
}}

class Fixation { constructor() {
  this.topic = String;          // "fixations"
  this.norm_pos = Vector2D;
  this.dispersion = Number;
  this.method = String;         // like "pupil"
  this.base_data = [[ String /*"gaze.3d.01."*/, Number /*seconds*/ ]];
  this.timestamp = Number;      // seconds
  this.duration = Number;       // ms?
  this.confidence = Number;     // 0..1
  this.gaze_point_3d = Vector3D;
  this.id = Number;
}}

class Surface { constructor() {
  this.topic = String;          // "surfaces.<ID>"
  this.name = String;           // "<ID>"
  this.uid = String;            // "<UID>"
  this.m_to_screen = [[ Number ]];
  this.m_from_screen = [[ Number ]];
  this.gaze_on_srf = [ GazeOnSurface ];
  this.fixations_on_srf = [ Fixation ];  // ? please check whether this is indeed a list fo fixations
  this.timestamp = Number;      // seconds
  this.camera_pose_3d = null;
}}

class Blink { constructor() {
  this.topic = String;          // "blinks"
  this.type = String;           // "onset" | "offset"
  this.confidence = Number;     // 0..1
  this.base_data = [ Pupil ];
  this.timestamp = Number;      // seconds
  this.record = Boolean;
}}

class Annotation { constructor() {
  this.topic = String;          // "annotation"
  this.label = String;          // "<msg>"
  this.timestamp = Number;      // seconds
  this.duration = Number;       // seconds
  this.added_in_capture = Boolean;
}}

class Frame { constructor() {
  this.topic = String;          // "frame.eye.0|1"
  this.width = Number;          // 192
  this.height = Number;         // 192
  this.index = Number;          // integer
  this.timestamp = Number;      // seconds
  this.format = String;         // like "jpeg"
}}

// some of notifications
const Notification = { 
  
  StartPlugin: class { constructor() {
    this.subject = String;      // "start_plugin"
    this.name = String;         // plugin name
    this.args = undefined || {};// optional arguments of any type
    this.topic = String;        // "notify.start_plugin"
  }},
  
  StartCalibration: class { constructor() {
    this.subject = String;      // "calibration.should_start"
    this.topic = String;        // "notify.calibration.should_start"
  }},
  
  CalibrationStarted: class { constructor() {
    this.subject = String;      // "calibration.started"
    this.topic = String;        // "notify.calibration.started"
  }},

  CalibrationStopped: class { constructor() {
    this.subject = String;      // "calibration.stopped"
    this.topic = String;        // "notify.calibration.stopped"
  }},
  
  CalibrationSuccessful: class { constructor() {
    this.subject = String;      // "calibration.successful"
    this.method = String;       // like "binocular 3d model"
    this.timestamp = Number;    // seconds
    this.record = Boolean;
    this.topic = String;        // "notify.calibration.successful"
  }},
  
  CalibrationFailed: class { constructor() {
    this.subject = String;      // "calibration.failed",
    this.reason = String;       // like "Not enough ref point or pupil data available for calibration.",
    this.timestamp = Number;    // seconds
    this.record = Boolean;
    this.topic = String;        // "notify.calibration.failed"
  }},
  
  CalibrationData: class { constructor() {
    this.subject = String;      // "calibration.calibration_data"
    this.record = Boolean;
    this.timestamp = Number;    // seconds
    this.pupil_list = [ Pupil ]; 
    this.ref_list = [ CalibrationReference ];
    this.calibration_method = String;   // like "binocular 3d model",
    this.mapper_name = String;          // like "Binocular_Vector_Gaze_Mapper",
    this.mapper_args = {
      eye_camera_to_world_matrix0: [[ Number ]],
      eye_camera_to_world_matrix1: [[ Number ]],
      cal_points_3d: [[ Number ]],
      cal_ref_points_3d: [[ Number ]],
      cal_gaze_points0_3d: [[ Number ]],
      cal_gaze_points1_3d: [[ Number ]]
    };
    this.topic = String;        // "notify.calibration.calibration_data"
  }},
  
  WorldProcessStopped: class { constructor() {
    this.subject = String;      // "world_process.stopped"
    this.topic = String;        // "notify.world_process.stopped"
  }},

  StopEyeProcess: class { constructor() {
    this.subject = String;      // "eye_process.should_stop.0|1",
    this.eye_id = Number;       // 0|1,
    this.topic = String;        // "notify.eye_process.should_stop.0|1"
  }},

  EyeProcessStopped: class { constructor() {
    this.subject = String;      // "eye_process.stopped",
    this.eye_id = Number;       // 0|1,
    this.topic = String;        // "notify.eye_process.stopped"
  }},

  // Other messages:
  // calibration verification subjects:
  //   accuracy_test.should_start
  //   calibration.started
  //   start_plugin
  //   accuracy_test.data
  //   accuracy_test.stopped
 
};

module.exports = {
  Pupil,
  Gaze,
  Fixation,
  Surface,
  Blink,
  Annotation,
  Frame,
  Notification
};