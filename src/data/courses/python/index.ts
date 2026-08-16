import manifest from "./manifest.json";

// Chapter 1
import ch1Meta from "./chapters/ch-1-hello-world/meta.json";
import ch1Theory from "./chapters/ch-1-hello-world/theory.json";
import ch1Exercises from "./chapters/ch-1-hello-world/exercises.json";

// Chapter 2
import ch2Meta from "./chapters/ch-2-variables/meta.json";
import ch2Theory from "./chapters/ch-2-variables/theory.json";
import ch2Exercises from "./chapters/ch-2-variables/exercises.json";

// Chapter 3
import ch3Meta from "./chapters/ch-3-control-flow/meta.json";
import ch3Theory from "./chapters/ch-3-control-flow/theory.json";
import ch3Exercises from "./chapters/ch-3-control-flow/exercises.json";

// Chapter 4
import ch4Meta from "./chapters/ch-4-loops/meta.json";
import ch4Theory from "./chapters/ch-4-loops/theory.json";
import ch4Exercises from "./chapters/ch-4-loops/exercises.json";

// Milestone 1
import ms1Meta from "./chapters/milestone-1-space-adventure/meta.json";
import ms1Theory from "./chapters/milestone-1-space-adventure/theory.json";
import ms1Exercises from "./chapters/milestone-1-space-adventure/exercises.json";

// Chapter 5
import ch5Meta from "./chapters/ch-5-lists/meta.json";
import ch5Theory from "./chapters/ch-5-lists/theory.json";
import ch5Exercises from "./chapters/ch-5-lists/exercises.json";

// Chapter 6
import ch6Meta from "./chapters/ch-6-functions/meta.json";
import ch6Theory from "./chapters/ch-6-functions/theory.json";
import ch6Exercises from "./chapters/ch-6-functions/exercises.json";

// Chapter 7
import ch7Meta from "./chapters/ch-7-classes/meta.json";
import ch7Theory from "./chapters/ch-7-classes/theory.json";
import ch7Exercises from "./chapters/ch-7-classes/exercises.json";

// Chapter 8
import ch8Meta from "./chapters/ch-8-modules/meta.json";
import ch8Theory from "./chapters/ch-8-modules/theory.json";
import ch8Exercises from "./chapters/ch-8-modules/exercises.json";

// Milestone 2
import ms2Meta from "./chapters/milestone-2-capstone/meta.json";
import ms2Theory from "./chapters/milestone-2-capstone/theory.json";
import ms2Exercises from "./chapters/milestone-2-capstone/exercises.json";

export const PYTHON_COURSE_CHAPTERS = [
  { ...ch1Meta, documentation: ch1Theory, exercises: ch1Exercises },
  { ...ch2Meta, documentation: ch2Theory, exercises: ch2Exercises },
  { ...ch3Meta, documentation: ch3Theory, exercises: ch3Exercises },
  { ...ch4Meta, documentation: ch4Theory, exercises: ch4Exercises },
  { ...ms1Meta, documentation: ms1Theory, exercises: ms1Exercises },
  { ...ch5Meta, documentation: ch5Theory, exercises: ch5Exercises },
  { ...ch6Meta, documentation: ch6Theory, exercises: ch6Exercises },
  { ...ch7Meta, documentation: ch7Theory, exercises: ch7Exercises },
  { ...ch8Meta, documentation: ch8Theory, exercises: ch8Exercises },
  { ...ms2Meta, documentation: ms2Theory, exercises: ms2Exercises },
];

export const PYTHON_COURSE_MANIFEST = manifest;
