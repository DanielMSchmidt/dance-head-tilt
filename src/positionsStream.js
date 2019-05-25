import * as Rx from "rxjs";
import { map, tap, switchMap, filter } from "rxjs/operators";
import * as posenet from "@tensorflow-models/posenet";

function findPart(keypoints, name) {
  return keypoints.find(({ part }) => part === name);
}

export default function positionsStream(
  webcam,
  imageRef,
  canvasRef,
  interval,
  accuracy
) {
  const model$ = Rx.from(posenet.load(accuracy));
  const image$ = Rx.interval(interval).pipe(
    map(() => webcam.getScreenshot()),
    filter(src => src !== null),
    tap(imageSrc => {
      imageRef.src = imageSrc;

      const img = new Image(imageRef.width, imageRef.height);
      img.onload = () => {
        const ctx = canvasRef.getContext("2d");
        ctx.drawImage(img, 0, 0, imageRef.width, imageRef.height);
      };
      img.src = imageSrc;
    })
  );

  return Rx.combineLatest(model$, image$).pipe(
    switchMap(([net]) => {
      const imageScaleFactor = 0.5;
      const flipHorizontal = false;
      const outputStride = 16;

      return Rx.from(
        net.estimateSinglePose(
          imageRef,
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
        leftElbow,
        rightEar,
        rightEye,
        rightShoulder,
        rightElbow
      ] = [
        "leftEar",
        "leftEye",
        "leftShoulder",
        "leftElbow",
        "rightEar",
        "rightEye",
        "rightShoulder",
        "rightElbow"
      ].map(findThePart);

      return {
        leftEar,
        leftEye,
        leftShoulder,
        leftElbow,
        rightEar,
        rightEye,
        rightShoulder,
        rightElbow
      };
    }),
    tap(
      ({
        leftEar,
        leftEye,
        leftShoulder,
        leftElbow,
        rightEar,
        rightEye,
        rightShoulder,
        rightElbow
      }) => {
        const ctx = canvasRef.getContext("2d");
        function paintPart(color, left, right) {
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.moveTo(left.position.x, left.position.y);
          ctx.lineTo(right.position.x, right.position.y);
          ctx.stroke();
        }

        paintPart("#ea101e", leftEar, rightEar);
        paintPart("#41e8f4", leftEye, rightEye);
        paintPart("#41f456", leftShoulder, rightShoulder);
        paintPart("#f49242", leftElbow, rightElbow);
      }
    )
  );
}
