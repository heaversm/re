import { Vector3, Matrix } from '@babylonjs/core/Maths/math';

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
