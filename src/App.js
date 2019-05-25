import React from "react";
import Webcam from "react-webcam";
import "./App.css";

import positionsStream from "./positionsStream";
import positionsToTilt from "./positionsToTilt";

const WEBCAM_HEIGHT = 500;
const WEBCAM_WIDTH = 500;

function getCameraAspectRatio() {
  return null;
}

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      interval: 300,
      accuracy: 0.75,
      ready: false,
      started: false,
      positionSubscription: null,
      tiltSubscription: null
    };
  }
  setWebcamRef = webcam => {
    this.webcam = webcam;

    if (this.image) {
      this.setState({ ready: true });
    }
  };

  setCanvasRef = canvas => {
    this.canvas = canvas;

    if (this.webcam) {
      this.setState({ ready: true });
    }
  };

  setImageRef = image => {
    this.image = image;

    if (this.webcam) {
      this.setState({ ready: true });
    }
  };

  start = () => {
    this.setState({ started: true });
    const { accuracy, interval } = this.state;

    this.setState({
      webcamHeight: this.webcam.video.videoHeight,
      webcamWidth: this.webcam.video.videoWidth
    });

    const positions$ = positionsStream(
      this.webcam,
      this.image,
      this.canvas,
      interval,
      accuracy
    );

    const positionSubscription = positions$.subscribe(() => {
      // TODO: draw lines in image
    });

    const tiltDifference$ = positions$.pipe(positionsToTilt());

    const tiltSubscription = tiltDifference$.subscribe({
      error(e) {
        console.error(e);
      }
    });

    this.setState({ positionSubscription, tiltSubscription });
  };

  stop = () => {
    const { positionSubscription, tiltSubscription } = this.state;
    positionSubscription.unsubscribe();
    tiltSubscription.unsubscribe();
  };

  restart = () => {
    this.stop();
    this.start();
  };

  render() {
    return (
      <div className="App">
        <label htmlFor="interval">Interval: {this.state.interval}</label>
        <input
          id="interval"
          onChange={event => this.setState({ interval: event.target.value })}
          value={this.state.interval}
          type="range"
          min={100}
          step={10}
          max={2000}
        />

        <label htmlFor="accuracy">
          Detection Accuracy {this.state.accuracy}
        </label>
        <input
          id="accuracy"
          type="range"
          onChange={event => this.setState({ accuracy: event.target.value })}
          value={this.state.accuracy}
          min={0.5}
          max={1}
          step={0.1}
        />

        {this.state.ready ? (
          !this.state.started ? (
            <button onClick={this.start}>Start</button>
          ) : (
            <button onClick={this.restart}>Restart</button>
          )
        ) : null}

        <Webcam
          audio={false}
          height={WEBCAM_HEIGHT}
          width={WEBCAM_WIDTH}
          ref={this.setWebcamRef}
        />
        <img
          height={this.state.webcamHeight}
          width={this.state.webcamWidth}
          style={{ display: "none" }}
          ref={this.setImageRef}
          id="image"
        />
        <canvas
          height={this.state.webcamHeight}
          width={this.state.webcamWidth}
          ref={this.setCanvasRef}
          id="canvas"
        />
      </div>
    );
  }
}

export default App;
