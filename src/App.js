import React from "react";
import Webcam from "react-webcam";
import * as Rx from "rxjs";
import { map, tap, switchMap, filter, catchError } from "rxjs/operators";
import "./App.css";
import * as posenet from "@tensorflow-models/posenet";

const WEBCAM_HEIGHT = 500;
const WEBCAM_WIDTH = 500;

const interval = 300;

const model$ = Rx.from(posenet.load());

function findPart(keypoints, name) {
  return keypoints.find(({ part }) => part === name);
}

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

    this.image$ = Rx.interval(interval).pipe(
      map(() => webcam.getScreenshot()),
      filter(src => src !== null),
      tap(imageSrc => {
        this.image.src = imageSrc;
      })
    );
    const tiltDifference$ = Rx.combineLatest(model$, this.image$).pipe(
      switchMap(([net, imageSrc]) => {
        // TODO: get real aspect ratio of camera
        // TODO: try to not use DOM
        // const imageElement = new Image(WEBCAM_WIDTH, WEBCAM_HEIGHT);
        // imageElement.src = imageSrc;
        const imageScaleFactor = 0.5;
        const flipHorizontal = true;
        const outputStride = 16;

        return Rx.from(
          net.estimateSinglePose(
            document.getElementById("image"),
            imageScaleFactor,
            flipHorizontal,
            outputStride
          )
        );
      }),
      filter(pose => pose.score > 0.3),
      map(pose => {
        const findThePart = findPart.bind(null, pose.keypoints);
        const [
          leftEar,
          leftEye,
          leftShoulder,
          rightEar,
          rightEye,
          rightShoulder
        ] = [
          "leftEar",
          "leftEye",
          "leftShoulder",
          "rightEar",
          "rightEye",
          "rightShoulder"
        ].map(findThePart);

        console.log(
          ...[leftEar, leftEye, leftShoulder, rightEar, rightEye, rightShoulder]
        );

        // TODO: chek why head scales twice as fast
        const earTilt = calculateTilt(leftEar, rightEar);
        const eyeTilt = calculateTilt(leftEye, rightEye);
        const headAxisTilt = (earTilt + eyeTilt) / 2; // TODO: include score

        const shoulderTilt = calculateTilt(leftShoulder, rightShoulder);
        const bodyAxisTilt = shoulderTilt; // TODO: add elbows

        return { headAxisTilt, bodyAxisTilt };
      })
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
