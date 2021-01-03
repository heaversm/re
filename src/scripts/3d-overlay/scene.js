// import * as BABYLON from "@babylonjs/core/Legacy/legacy";

import * as OIMO from 'oimo';
import { Scene } from '@babylonjs/core/scene';
import { Vector3, Color3, Color4, Angle, Axis, Matrix } from '@babylonjs/core/Maths/math';
import { OimoJSPlugin } from '@babylonjs/core/Physics/Plugins/oimoJSPlugin';
import { Animation } from '@babylonjs/core/Animations/animation';
import { AnimationPropertiesOverride } from '@babylonjs/core/Animations/animationPropertiesOverride';
import { Camera } from '@babylonjs/core/Cameras/camera';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { PhysicsImpostor } from '@babylonjs/core/Physics/physicsImpostor';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { MultiMaterial } from '@babylonjs/core/Materials/multiMaterial';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { RecastJSPlugin } from '@babylonjs/core/Navigation/Plugins/recastJSPlugin';
import Recast from 'recast-detour';

// this has to be a require or Node complains
// const Recast = require('recast-detour');

import '@babylonjs/core/Physics/physicsEngineComponent';
import '@babylonjs/core/Loading/Plugins/babylonFileLoader';
import '@babylonjs/loaders';
// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";

import Ragdoll from './ragdoll';
import { getClosestAspectRatio } from './utils';

export default async function createScene(engine) {
  const scene = new Scene(engine);

  // scene settings

  scene.enablePhysics(new Vector3(0, -9, 0), new OimoJSPlugin(true, undefined, OIMO));

  // this is really important to tell Babylon.js to use decomposeLerp and matrix interpolation
  Animation.AllowMatricesInterpolation = true;

  // could also assign animationPropertiesOverride to an individual skeleton, but might as well assign it to the whole scene
  scene.animationPropertiesOverride = new AnimationPropertiesOverride();
  scene.animationPropertiesOverride.loopMode = Animation.ANIMATIONLOOPMODE_CYCLE;
  scene.animationPropertiesOverride.enableBlending = true;
  scene.animationPropertiesOverride.blendingSpeed = 0.075;

  scene.clearColor = new Color4(0, 0, 0, 0);

  // camera

  // const camera = new FreeCamera('camera', new Vector3(0, 4.91, -6), scene); // PERSPECTIVE VERTICAL
  // const camera = new FreeCamera('camera', new Vector3(0, 4.91, -18), scene); // PERSPECTIVE HORIZONTAL
  const camera = new FreeCamera('camera', new Vector3(0, 3, 0), scene); // ORTHO HORIZONTAL
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
  camera.fovMode = Camera.FOVMODE_HORIZONTAL_FIXED; // resize the scene based on canvas width instead of height
  camera.rotation = new Vector3(0.3, 0, 0);

  const [widthRatio, heightRatio] = getClosestAspectRatio(engine.getRenderWidth() / engine.getRenderHeight(), 20);
  const scaleFactor = 0.5;
  camera.orthoTop = heightRatio * scaleFactor;
  camera.orthoBottom = -heightRatio * scaleFactor;
  camera.orthoLeft = -widthRatio * scaleFactor;
  camera.orthoRight = widthRatio * scaleFactor;

  const startW = engine.getRenderWidth();
  const startH = engine.getRenderHeight();
  engine.onResizeObservable.add(function () {
    camera.orthoTop = heightRatio * scaleFactor * (engine.getRenderHeight() / startH);
    camera.orthoBottom = -heightRatio * scaleFactor * (engine.getRenderHeight() / startH);
    camera.orthoLeft = -widthRatio * scaleFactor * (engine.getRenderWidth() / startW);
    camera.orthoRight = widthRatio * scaleFactor * (engine.getRenderWidth() / startW);
  });

  // floor

  const floorBox = MeshBuilder.CreateGround('floor', { width: 1, height: 1 }, scene);
  floorBox.position = new Vector3(0, -1, 0);
  // floorBox.physicsImpostor = new PhysicsImpostor(floorBox, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0 }, scene);

  const floorColor = 128 / 255;
  const floorMaterial = new StandardMaterial('floorMaterial', scene);
  floorMaterial.disableLighting = true;
  floorMaterial.emissiveColor = new Color3(floorColor, 0, 0);
  floorBox.material = floorMaterial;

  function resizeGround() {
    const $footer = document.getElementById('footer');
    const footerRect = $footer.getBoundingClientRect();
    const footerCorners = [
      [footerRect.left, footerRect.top],
      [footerRect.right, footerRect.top],
      [footerRect.left, footerRect.bottom],
      [footerRect.right, footerRect.bottom]
    ];
    const [topLeft, topRight, bottomLeft, bottomRight] = footerCorners.map(([x, y]) => Vector3.Unproject(
      new Vector3(x, y, 0.00001),
      engine.getRenderWidth(),
      engine.getRenderHeight(),
      Matrix.Identity(),
      camera.getViewMatrix(),
      camera.getProjectionMatrix()
    ));

    // floorBox.position = new Vector3(0, -6.37, 0);
    floorBox.scaling = new Vector3(topRight.x - topLeft.x, 1, -15.39);

    floorBox.refreshBoundingInfo();
    const floorBoundingInfo = floorBox.getBoundingInfo();
    floorBoundingInfo.update(floorBox._worldMatrix);
    const floorBoundingBox = floorBoundingInfo.boundingBox;

    const temp = Vector3.Project(
      new Vector3(floorBoundingBox.minimumWorld.x, floorBox.position.y, floorBoundingBox.minimumWorld.z),
      Matrix.IdentityReadOnly,
      camera.getTransformationMatrix(),
      camera.viewport.toGlobal(
        engine.getRenderWidth(),
        engine.getRenderHeight(),
      ),
    );
    const temp2 = Vector3.Project(
      new Vector3(floorBoundingBox.minimumWorld.x, floorBox.position.y, floorBoundingBox.maximumWorld.z),
      Matrix.IdentityReadOnly,
      camera.getTransformationMatrix(),
      camera.viewport.toGlobal(
        engine.getRenderWidth(),
        engine.getRenderHeight(),
      ),
    );
  }
  resizeGround();
  engine.onResizeObservable.add(resizeGround);

  // character

  const { meshes, skeletons } = await SceneLoader.ImportMeshAsync('', 'assets/models/', 'agent0.babylon', scene);

  const [mesh] = meshes;
  const [skeleton] = skeletons;

  mesh.position = new Vector3(-6, 0, 8.9);
  mesh.rotation = new Vector3(Angle.FromDegrees(-90).radians(), Angle.FromDegrees(180).radians(), 0);
  mesh.scaling = new Vector3(0.01, 0.01, 0.01);

  const lightGrayMaterial = new StandardMaterial('lightGrayMaterial', scene);
  lightGrayMaterial.disableLighting = true;
  lightGrayMaterial.emissiveColor = new Color3(0.8, 0.8, 0.8);

  const greenMaterial = new StandardMaterial('greenMaterial', scene);
  greenMaterial.disableLighting = true;
  greenMaterial.emissiveColor = new Color3(0, 1, 0);

  const redMaterial = new StandardMaterial('redMaterial', scene);
  redMaterial.disableLighting = true;
  redMaterial.emissiveColor = new Color3(1, 0, 0);

  const agentMaterial = new MultiMaterial('agentMaterial', scene);
  agentMaterial.subMaterials.push(lightGrayMaterial);
  agentMaterial.subMaterials.push(lightGrayMaterial);
  agentMaterial.subMaterials.push(greenMaterial);
  agentMaterial.subMaterials.push(redMaterial);
  mesh.material = agentMaterial;

  skeleton.beginAnimation('Idle', true); // true means loop

  // ragdoll

  const config = [
    { bones: ["mixamorig_Hips"], size: 0.2, boxOffset: -0.05 },
    { bones: ["mixamorig_Spine1"], size: 0.2, boxOffset: 0.1, min: -10, max: 10 },
    { bones: ["mixamorig_HeadTop_End"], size: 0.225, boxOffset: -0.115, min: -10, max: 10 },
    { bones: ["mixamorig_RightArm"], size: 0.1, height: 0.2, rotationAxis: Axis.Z, min: -45, max: 90, boxOffset: 0.1 },
    { bones: ["mixamorig_LeftArm"], size: 0.1, height: 0.2, rotationAxis: Axis.Z, min: -45, max: 90, boxOffset: 0.1  },
    { bones: ["mixamorig_RightForeArm"], size: 0.1, height: 0.2, rotationAxis: Axis.Y, min: -90, max: 90, boxOffset: 0.1 },
    { bones: ["mixamorig_LeftForeArm"], size: 0.1, height: 0.2, rotationAxis: Axis.Y, min: -90, max: 90, boxOffset: 0.1 },
    { bones: ['mixamorig_RightHand', 'mixamorig_LeftHand'], size: 0.1, height: 0.15, min: -10, max: 10, boxOffset: 0.05 },
    { bones: ["mixamorig_RightUpLeg", "mixamorig_LeftUpLeg"], size: 0.15, height: 0.25, rotationAxis: Axis.Z, min: -90, max: 90, boxOffset: 0.25 },
    { bones: ["mixamorig_RightLeg", "mixamorig_LeftLeg"], size: 0.15, height: 0.25, min: -45, max: 90, boxOffset: 0.15 },
    { bones: ["mixamorig_RightFoot", "mixamorig_LeftFoot"], size: 0.15, min: -10, max: 10 },
  ];
  const jointCollisions = false;
  const showBoxes = false;
  const mainPivotSphereSize = 0;
  const disableBoxBoneSync = false;
  const ragdoll = new Ragdoll(skeleton, mesh, config, jointCollisions, showBoxes, mainPivotSphereSize, disableBoxBoneSync);
  ragdoll.init();

  // crowd navigation

  const navigationPlugin = new RecastJSPlugin(Recast);
  navigationPlugin.createNavMesh([floorBox], {
    cs: 0.2,
    ch: 0.2,
    walkableSlopeAngle: 35,
    walkableHeight: 1,
    walkableClimb: 1,
    walkableRadius: 1,
    maxEdgeLen: 12.,
    maxSimplificationError: 1.3,
    minRegionArea: 8,
    mergeRegionArea: 20,
    maxVertsPerPoly: 6,
    detailSampleDist: 6,
    detailSampleMaxError: 1,
  });

  // resizing logic

  // engine.onResizeObservable.add(function () {
  //   const screenWidth = engine.getRenderWidth(true);
  //   const screenHeight = engine.getRenderHeight(true);
  // });

  // let screenPos = new Vector3();
  // let firstRender = true;
  // let yDistFromBottomInPixels = -1;
  // scene.onAfterRenderObservable.add(() => {
  //   if (firstRender) {
  //     screenPos = Vector3.Project(
  //       mesh.getAbsolutePosition(),
  //       Matrix.IdentityReadOnly,
  //       scene.getTransformMatrix(),
  //       camera.viewport.toGlobal(
  //         engine.getRenderWidth(),
  //         engine.getRenderHeight(),
  //       ),
  //     );

  //     yDistFromBottomInPixels = engine.getRenderHeight() - screenPos.y;
  //     console.log(yDistFromBottomInPixels);

  //     screenPos = screenPos.multiply(new Vector3(1 / engine.getRenderWidth(), 1 / engine.getRenderHeight(), 1));

  //     firstRender = false;
  //   }
  // });

  const initialHeight = engine.getRenderHeight();
  let prevHeight = initialHeight;
  engine.onResizeObservable.add(() => {
    if (engine.getRenderHeight() === prevHeight) {
      return;
    }

    mesh.position = Vector3.Unproject(
      new Vector3(engine.getRenderWidth() * 0.25, engine.getRenderHeight() - 100, 0.96), // 0.94455
      // screenPos.multiply(new Vector3(engine.getRenderWidth(), engine.getRenderHeight(), 1)),
      engine.getRenderWidth(),
      engine.getRenderHeight(),
      Matrix.Identity(),
      scene.getViewMatrix(),
      scene.getProjectionMatrix()
    );

    // floorBox.position = Vector3.Unproject(
    //   new Vector3(engine.getRenderWidth() * 0.5, engine.getRenderHeight() - 100, 0.95),
    //   engine.getRenderWidth(),
    //   engine.getRenderHeight(),
    //   Matrix.Identity(),
    //   scene.getViewMatrix(),
    //   scene.getProjectionMatrix()
    // );

    prevHeight = engine.getRenderHeight();
  });

  // scene.debugLayer.show({
    // overlay: true
  // });

  return scene;
}
