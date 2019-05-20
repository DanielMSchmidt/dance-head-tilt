import * as Rx from "rxjs";
import { map, tap, switchMap, filter } from "rxjs/operators";
import * as posenet from "@tensorflow-models/posenet";

function findPart(keypoints, name) {
  return keypoints.find(({ part }) => part === name);
}

export default function positionsStream(webcam, imageRef, interval, accuracy) {
  const model$ = Rx.from(posenet.load(accuracy));
  const image$ = Rx.interval(interval).pipe(
    map(() => webcam.getScreenshot()),
    filter(src => src !== null),
    tap(imageSrc => {
      imageRef.src = imageSrc;
    })
  );

  return Rx.combineLatest(model$, image$).pipe(
    switchMap(([net, _imageSrc]) => {
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

      return {
        leftEar,
        leftEye,
        leftShoulder,
        rightEar,
        rightEye,
        rightShoulder
      };
    })
  );
}
