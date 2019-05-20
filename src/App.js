import React from "react";
import Webcam from "react-webcam";
import "./App.css";

import positionsStream from "./positionsStream";
import positionsToTilt from "./positionsToTilt";

const WEBCAM_HEIGHT = 500;
const WEBCAM_WIDTH = 500;

const interval = 300;

class App extends React.Component {
  setWebcamRef = webcam => {
    this.webcam = webcam;

    if (this.image) {
      this.start();
      this.setState({ started: true });
    }
  };

  setImageRef = image => {
    this.image = image;

    if (this.webcam) {
      this.start();
      this.setState({ started: true });
    }
  };

  start = () => {
    const positions$ = positionsStream(this.webcam, this.image, interval);
    positions$.subscribe(() => {
      // TODO: draw lines in image
    });

    const tiltDifference$ = positions$.pipe(positionsToTilt());

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
          ref={this.setWebcamRef}
        />
        <img
          height={WEBCAM_HEIGHT}
          width={WEBCAM_WIDTH}
          ref={this.setImageRef}
          id="image"
        />
      </div>
    );
  }
}

export default App;
