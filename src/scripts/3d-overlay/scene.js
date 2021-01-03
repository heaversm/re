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
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";

import Ragdoll from './ragdoll';

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

  const camera = new FreeCamera('camera', new Vector3(0, 4.91, -18), scene); // PERSPECTIVE HORIZONTAL
  camera.fovMode = Camera.FOVMODE_HORIZONTAL_FIXED; // resize the scene based on canvas width instead of height

  // floor

  const floorBox = MeshBuilder.CreateGround('floor', { width: 40, height: 20 }, scene);
  floorBox.position = new Vector3(0, 0, 0);
  floorBox.physicsImpostor = new PhysicsImpostor(floorBox, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0 }, scene);

  const floorColor = 128 / 255;
  const floorMaterial = new StandardMaterial('floorMaterial', scene);
  floorMaterial.disableLighting = true;
  floorMaterial.emissiveColor = new Color3(floorColor, 0, 0);
  floorBox.material = floorMaterial;

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

  function pinGroundPlaneToFooter() {
    const $footer = document.getElementById('footer');
    const footerRect = $footer.getBoundingClientRect();
    const floorBoundingBox = floorBox.getBoundingInfo().boundingBox;
    // references:
    // - https://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z
    // - https://forum.babylonjs.com/t/how-do-i-tie-an-object-to-the-mouse-with-playground-example/7799
    const topCenter = Vector3.Unproject(
      new Vector3((footerRect.right - footerRect.left) / 2, footerRect.top, 0.5),
      engine.getRenderWidth(),
      engine.getRenderHeight(),
      Matrix.Identity(),
      camera.getViewMatrix(),
      camera.getProjectionMatrix()
    );
    const dir = topCenter.subtract(camera.position).normalize();
    const distance = (floorBoundingBox.maximumWorld.z - camera.position.z) / dir.z;
    const cameraDelta = camera.position.clone().add(dir.scale(distance));
    camera.position.y -= cameraDelta.y;
  }
  pinGroundPlaneToFooter();
  scene.onBeforeRenderObservable.add(pinGroundPlaneToFooter);

  return scene;
}
