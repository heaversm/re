// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

import * as OIMO from 'oimo';
import { Scene } from '@babylonjs/core/scene';
import { Vector3, Color3, Color4, Angle, Axis } from '@babylonjs/core/Maths/math';
import { OimoJSPlugin } from '@babylonjs/core/Physics/Plugins/oimoJSPlugin';
import { Animation } from '@babylonjs/core/Animations/animation';
import { AnimationPropertiesOverride } from '@babylonjs/core/Animations/animationPropertiesOverride';
import { EasingFunction, BezierCurveEase } from '@babylonjs/core/Animations/easing';
import { Camera } from '@babylonjs/core/Cameras/camera';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { PhysicsImpostor } from '@babylonjs/core/Physics/physicsImpostor';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { MultiMaterial } from '@babylonjs/core/Materials/multiMaterial';
import { AssetsManager } from '@babylonjs/core/Misc/assetsManager';
import { RecastJSPlugin } from '@babylonjs/core/Navigation/Plugins/recastJSPlugin';
import Recast from 'recast-detour';

import '@babylonjs/core/Animations/animatable';
import '@babylonjs/core/Cameras/universalCamera';
import '@babylonjs/core/Engines/Extensions/engine.occlusionQuery';
import '@babylonjs/core/Physics/physicsEngineComponent';
import '@babylonjs/core/Loading/loadingScreen';
import '@babylonjs/core/Loading/Plugins/babylonFileLoader';
import '@babylonjs/loaders';
// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";

import Ragdoll from './ragdoll';
import { viewportToWorldPoint } from './utils';

export default async function createScene(engine, events) {
  const scene = new Scene(engine);

  // parameters

  let showFooter = false;

  // scene settings

  scene.enablePhysics(new Vector3(0, -9.8, 0), new OimoJSPlugin(true, 8, OIMO));
  // add extra physics iterations per-frame to avoid ragdolls falling through the ground
  scene.getPhysicsEngine().setSubTimeStep(1);

  // this is really important to tell Babylon.js to use decomposeLerp and matrix interpolation
  Animation.AllowMatricesInterpolation = true;

  // could also assign animationPropertiesOverride to an individual skeleton, but might as well assign it to the whole scene
  scene.animationPropertiesOverride = new AnimationPropertiesOverride();
  scene.animationPropertiesOverride.loopMode = Animation.ANIMATIONLOOPMODE_CYCLE;
  scene.animationPropertiesOverride.enableBlending = true;
  scene.animationPropertiesOverride.blendingSpeed = 0.075;

  scene.clearColor = new Color4(0, 0, 0, 0);

  // load assets

  const assetsManager = new AssetsManager(scene);
  const assetContainerPromises = [
    new Promise((resolve, reject) => {
      const agent0Task = assetsManager.addContainerTask('agent0Task', '', 'assets/models/', 'agent0.babylon');
      agent0Task.onSuccess = ({ loadedContainer }) => resolve(loadedContainer);
      agent0Task.onError = (t, m, exception) => reject(exception);
    })
  ];

  assetsManager.load();
  const assetContainers = await Promise.all(assetContainerPromises);

  // camera

  const camera = new FreeCamera('camera', new Vector3(0, 4.91, -18), scene);
  camera.fovMode = Camera.FOVMODE_HORIZONTAL_FIXED; // resize the scene based on canvas width instead of height

  // floor

  const floorHeight = 20;
  const floor = MeshBuilder.CreateBox('floor', { width: 40, height: floorHeight, depth: 20 }, scene);
  floor.physicsImpostor = new PhysicsImpostor(floor, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, scene);
  floor.physicsImpostor.physicsBody.isKinematic = true; // specific to oimo.js
  floor.position.y = -floorHeight / 2;
  floor.isVisible = false;

  const floorColor = 128 / 255;
  const floorMaterial = new StandardMaterial('floorMaterial', scene);
  floorMaterial.disableLighting = true;
  floorMaterial.emissiveColor = new Color3(floorColor, 0, 0);
  floor.material = floorMaterial;

  // character

  const { rootNodes: meshes, skeletons } = assetContainers[0].instantiateModelsToScene();

  const [mesh] = meshes;
  const [skeleton] = skeletons;

  mesh.position = new Vector3(-6, 0, 8.9);
  mesh.rotation = new Vector3(Angle.FromDegrees(-90).radians(), Angle.FromDegrees(180).radians(), 0);
  mesh.scaling = new Vector3(0.01, 0.01, 0.01);
  mesh.isVisible = false;

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

  // ragdoll.ragdoll();

  // crowd navigation

  const navigationPlugin = new RecastJSPlugin(Recast);
  navigationPlugin.createNavMesh([floor], {
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

  let targetFooterBottomCenterWorld = new Vector3(0, 0, 0);
  function pinGroundPlaneToFooter() {
    if (!showFooter) {
      return;
    }
    const $footer = document.getElementById('footer');
    const footerRect = $footer.getBoundingClientRect();
    const floorBoundingBox = floor.getBoundingInfo().boundingBox;
    // find the world-space location of the top center of the footer element
    // at the Z position of the far edge of the ground plane
    const targetFooterTopCenterWorld = viewportToWorldPoint(
      ((footerRect.right - footerRect.left) / 2) / engine.getRenderWidth(),
      footerRect.top / engine.getRenderHeight(),
      floorBoundingBox.maximumWorld.z,
      camera
    );
    camera.position.y -= targetFooterTopCenterWorld.y;

    targetFooterBottomCenterWorld = viewportToWorldPoint(
      ((footerRect.right - footerRect.left) / 2) / engine.getRenderWidth(),
      (footerRect.bottom + 200) / engine.getRenderHeight(), // add a little extra vertical buffer to hide any ragdolls
      floorBoundingBox.maximumWorld.z,
      camera
    );
  }
  pinGroundPlaneToFooter();
  scene.onBeforeRenderObservable.add(pinGroundPlaneToFooter);

  const animationFrameRate = 60;
  const floorAnimationDuration = 0.5;
  const floorEasingFunction = new BezierCurveEase(0.42, 0, 1, 1);
  floorEasingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEIN);
  const originalFloorPosition = floor.position;

  events.onNavigateOnline.add(() => {
    if (showFooter) {
      return;
    }
    showFooter = true;
    floor.isVisible = true;
    mesh.isVisible = true;
    Animation.CreateAndStartAnimation(
      'floorYIn',
      floor,
      'position',
      animationFrameRate,
      animationFrameRate * floorAnimationDuration,
      floor.position,
      originalFloorPosition,
      Animation.ANIMATIONLOOPMODE_RELATIVE,
      floorEasingFunction
    );
  });

  events.onNavigateIRL.add(() => {
    if (!showFooter) {
      return;
    }
    showFooter = false;
    Animation.CreateAndStartAnimation(
      'floorYOut',
      floor,
      'position',
      animationFrameRate,
      animationFrameRate * floorAnimationDuration,
      originalFloorPosition,
      new Vector3(0, (-floorHeight / 2) + targetFooterBottomCenterWorld.y, 0),
      Animation.ANIMATIONLOOPMODE_RELATIVE,
      floorEasingFunction,
      () => {
        floor.isVisible = false;
      }
    );
    ragdoll.ragdoll();
    const hideMeshObservable = scene.onBeforeRenderObservable.add(() => {
      if (!camera.isInFrustum(mesh)) {
        mesh.isVisible = false;
        scene.onBeforeRenderObservable.remove(hideMeshObservable);
      }
    });
  });

  // scene.debugLayer.show({
  //   overlay: true
  // });

  return scene;
}
