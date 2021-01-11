import { Vector3, Matrix } from '@babylonjs/core/Maths/math';
import { Scalar } from '@babylonjs/core/Maths/math.scalar';

// references:
// - https://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z
// - https://forum.babylonjs.com/t/how-do-i-tie-an-object-to-the-mouse-with-playground-example/7799
export function viewportToWorldPoint(viewportX, viewportY, targetWorldZ, camera) {
  const worldPoint = Vector3.Unproject(
    new Vector3(viewportX, viewportY, 0.5),
    1,
    1,
    Matrix.Identity(),
    camera.getViewMatrix(),
    camera.getProjectionMatrix()
  );
  const dir = worldPoint.subtract(camera.position).normalize();
  const distance = (targetWorldZ - camera.position.z) / dir.z;
  return camera.position.clone().add(dir.scale(distance));
}

export function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function map(n, start1, stop1, start2, stop2, withinBounds) {
  const newval = ((n - start1)/(stop1 - start1)) * (stop2 - start2) + start2;
  if (!withinBounds) {
    return newval;
  }
  return Scalar.Clamp(newval, start2, stop2);
}
