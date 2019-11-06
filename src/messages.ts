/*
 * This is incomplete list of messages that can be received from Pupil.
 * The class definitions only indicate what data fields are available and
 * of what type they are. Some fields has fixed values, these are described
 * in comments. Units are also described in comments whenever appropriate.
 *
 * IMPORTANT!
 * This types are valid for Pupil Capture v1.16 and older
 */

export interface Message {
  topic: string;
}

// Inner types

export class Vector2D extends Array {

  constructor( ref?: number[] ) {
    super();

    if (ref) {
      this[0] = ref[0];
      this[1] = ref[1];
    }
    else {
      this[0] = this[1] = 0;
    }
  }

  get x() { return this[0]; }
  get y() { return this[1]; }
}

export class Vector3D extends Array{

  constructor( ref?: number[] ) {
    super();

    if (ref) {
      this[0] = ref[0];
      this[1] = ref[1];
      this[3] = ref[3];
    }
    else {
      this[0] = this[1] = this[2] = 0;
    }
  }

  get x() { return this[0]; }
  get y() { return this[1]; }
  get z() { return this[2]; }
}

export interface Circle {
  center: Vector3D;
  normal: Vector3D;
  radius: number;
}

export interface Ellipse {
  center: Vector2D;
  axes: Vector2D;
  angle: number;          // degrees
}

export interface Sphere {
  center: Vector3D;
  radius: number;
}

export interface GazeOnSurface {
  topic: string;          // "gaze.3d.0|1._on_surface",
  norm_pos: Vector2D;
  confidence: number;     // 0..1
  on_surf: boolean;
  base_data: [ string /* "gaze.3d.0|1" */, number /* timestamp*/ ];
  timestamp: number;      // seconds
}

export interface CalibrationReference {
  norm_pos: Vector2D;
  screen_pos: Vector2D;
  timestamp: number;      // seconds
}


// Primary types

export interface Pupil extends Message { // topic = "pupil.0|1"
  circle_3d: Circle;
  confidence: number;     // 0..1
  timestamp: number;      // seconds
  diameter_3d: number;
  ellipse: Ellipse;
  norm_pos: Vector2D;
  diameter: number;
  sphere: Sphere;
  projected_sphere: Ellipse;
  model_confidence: number;       // 0..1
  model_id: number;
  model_birth_timestamp: number;  // seconds
  theta: number;
  phi: number;
  method: string;         // like "3d c++"
  id: 0 | 1;
}

export interface Gaze extends Message { // topic = "gaze.3d.0|1."
  norm_pos: Vector2D;
  eye_center_3d: Vector3D;
  gaze_normal_3d: Vector3D;
  gaze_point_3d: Vector3D;
  confidence: number;     // 0..1,
  timestamp: number;      // seconds
  base_data: [ Pupil ];
}

export interface Fixation extends Message { // topic = "fixations"
  norm_pos: Vector2D;
  dispersion: number;
  method: string;         // like "pupil"
  base_data: [[ string /*gaze.3d.0|1.*/, number /*seconds*/ ]];
  timestamp: number;      // seconds
  duration: number;       // ms?
  confidence: number;     // 0..1
  gaze_point_3d: Vector3D;
  id: number;
}

export interface Surface extends Message {  // topic = "surfaces.<ID>"
  name: string;           // "<ID>"
  surf_to_img_trans: [[ number ]];
  img_to_surf_trans: [[ number ]];
  gaze_on_surfaces: [ GazeOnSurface ];
  fixations_on_surfaces: [ Fixation ];
  timestamp: number;      // seconds
}

export interface Blink extends Message {  // topic =  "blinks"
  type: 'onset' | 'offset';
  confidence: number;     // 0..1
  base_data: [ Pupil ];
  timestamp: number;      // seconds
  record: boolean;
}

export interface Annotation extends Message { // topic =  "annotation"
  label: string;          // "<msg>"
  timestamp: number;      // seconds
  duration: number;       // seconds
  added_in_capture: boolean;
}

export interface Frame extends Message {  // topic = "frame.eye.0|1" | "frame.world"
                          //  eye | world
  width: number;          //  192 |  1280
  height: number;         //  192 |  720
  index: number;          // integer
  timestamp: number;      // seconds
  format: string;         // like "jpeg"
}

// some of notifications
export interface Notification extends Message {
  subject: string;
}

export interface StartPlugin extends Notification { // subject = "start_plugin", topic = "notify.start_plugin"
  name: string;         // plugin name
  args?: any;           // optional arguments of any type
}

export type StartCalibration = Notification;  // subject = "calibration.should_start", topic = "notify.calibration.should_start"
export type CalibrationStarted = Notification;  // subject = "calibration.started", topic = "notify.calibration.started"
export type CalibrationStopped = Notification;  // subject = "calibration.stopped", topic = "notify.calibration.stopped"

export interface CalibrationResult extends Notification { // subject = "calibration.successful | failed", topic = "notify.calibration.successful | failed"
  method: string;       // like "binocular 3d model" or "Not enough ref point or pupil data available for calibration.",
  timestamp: number;    // seconds
  record: boolean;
}

export interface CalibrationData extends Notification { // subject = "calibration.calibration_data", topic = "notify.calibration.calibration_data"
  record: boolean;
  timestamp: number;    // seconds
  pupil_list: [ Pupil ];
  ref_list: [ CalibrationReference ];
  calibration_method: string;   // like "binocular 3d model",
  mapper_name: string;          // like "Binocular_Vector_Gaze_Mapper",
  mapper_args: {
    eye_camera_to_world_matrix?: [[ number ]],   // single-eye only
    eye_camera_to_world_matrix0?: [[ number ]],  // both-eyes only
    eye_camera_to_world_matrix1?: [[ number ]],  // both-eyes only
    cal_points_3d: [[ number ]],
    cal_ref_points_3d: [[ number ]],
    cal_gaze_points_3d?: [[ number ]],   // single-eye only
    cal_gaze_points0_3d?: [[ number ]],  // both-eyes only
    cal_gaze_points1_3d?: [[ number ]],  // both-eyes only
    gaze_distance?: number | undefined,  // single-eye only
  };
}

export type WorldProcessStopped = Notification; // subject = "world_process.stopped",  topic = "notify.world_process.stopped"

export interface EyeProcess extends Notification {  // subject = "eye_process.should_stop.0|1", topic = "notify.eye_process.should_stop.0|1"
  eye_id: 0 | 1,                                    // subject = "eye_process.stopped", topic = "notify.eye_process.stopped"
}

  // Other messages:
  // calibration verification subjects:
  //   accuracy_test.should_start
  //   calibration.started
  //   start_plugin
  //   accuracy_test.data
  //   accuracy_test.stopped
