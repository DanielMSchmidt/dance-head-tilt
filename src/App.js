import React from "react";
import Webcam from "react-webcam";
import { map } from "rxjs/operators";
import "./App.css";

import positionsStream from "./positionsStream";

const WEBCAM_HEIGHT = 500;
const WEBCAM_WIDTH = 500;

const interval = 300;

function calculateTilt(left, right) {
  return (
    (Math.atan2(
      left.position.y - right.position.y,
      left.position.x - right.position.x
    ) *
      180) /
    Math.PI
  );
}

class App extends React.Component {
  setRef = webcam => {
    this.webcam = webcam;

    const tiltDifference$ = positionsStream(webcam, interval).pipe(
      map(
        ({
          leftEar,
          leftEye,
          leftShoulder,
          rightEar,
          rightEye,
          rightShoulder
        }) => {
          // TODO: chek why head scales twice as fast
          const earTilt = calculateTilt(leftEar, rightEar);
          const eyeTilt = calculateTilt(leftEye, rightEye);
          const headAxisTilt = (earTilt + eyeTilt) / 2; // TODO: include score

          const shoulderTilt = calculateTilt(leftShoulder, rightShoulder);
          const bodyAxisTilt = shoulderTilt; // TODO: add elbows

          return { headAxisTilt, bodyAxisTilt };
        }
      )
    );

    tiltDifference$.subscribe({
      next({ headAxisTilt, bodyAxisTilt }) {
        console.log("Head", headAxisTilt);
        console.log("Body", bodyAxisTilt);
      },
      error(e) {
        console.error(e);
      }
    });
  };

  render() {
    return (
      <div className="App">
        <Webcam
          audio={false}
          height={WEBCAM_HEIGHT}
          width={WEBCAM_WIDTH}
          ref={this.setRef}
          screenshotFormat="image/jpeg"
        />
        <img
          height={WEBCAM_HEIGHT}
          width={WEBCAM_WIDTH}
          ref={image => (this.image = image)}
          id="image"
        />
      </div>
    );
  }
}

export default App;
