import { map } from "rxjs/operators";

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

export default function positionsToTilt() {
  return map(
    ({ leftEar, leftEye, leftShoulder, rightEar, rightEye, rightShoulder }) => {
      // TODO: check why head scales twice as fast
      const earTilt = calculateTilt(leftEar, rightEar);
      const eyeTilt = calculateTilt(leftEye, rightEye);
      const headAxisTilt = (earTilt + eyeTilt) / 2; // TODO: include score

      const shoulderTilt = calculateTilt(leftShoulder, rightShoulder);
      const bodyAxisTilt = shoulderTilt; // TODO: add elbows

      return { headAxisTilt, bodyAxisTilt };
    }
  );
}
