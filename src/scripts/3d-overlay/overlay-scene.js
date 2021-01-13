// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

import * as OIMO from 'oimo';
import { Scene } from '@babylonjs/core/scene';
import { Vector3, Color3, Color4, Angle } from '@babylonjs/core/Maths/math';
import { Scalar } from '@babylonjs/core/Maths/math.scalar';
import { OimoJSPlugin } from '@babylonjs/core/Physics/Plugins/oimoJSPlugin';
import { Animation } from '@babylonjs/core/Animations/animation';
import { AnimationPropertiesOverride } from '@babylonjs/core/Animations/animationPropertiesOverride';
import { Camera } from '@babylonjs/core/Cameras/camera';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { RecastJSPlugin } from '@babylonjs/core/Navigation/Plugins/recastJSPlugin';
import { PhysicsImpostor } from '@babylonjs/core/Physics/physicsImpostor';
import Recast from 'recast-detour';

import '@babylonjs/core/Animations/animatable';
import '@babylonjs/core/Cameras/universalCamera';
import '@babylonjs/core/Engines/Extensions/engine.occlusionQuery';
import '@babylonjs/core/Physics/physicsEngineComponent';
// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";

import { AgentPool } from './agent';
import { viewportToWorldPoint, randomItem } from './utils';
import { GROUND, WALLS, RAGDOLLS } from './collision-groups';

export default async function createScene(engine, models, events, isMobile) {
  const scene = new Scene(engine);

  // parameters

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

  // camera

  const camera = new FreeCamera('camera', new Vector3(0, 4.91, -18), scene);
  camera.fovMode = Camera.FOVMODE_HORIZONTAL_FIXED; // resize the scene based on canvas width instead of height

  // floor

  const floorWidth = 40;
  const floorHeight = 20;
  const floorDepth = 20;
  const floor = MeshBuilder.CreateBox('floor', { width: floorWidth, height: floorHeight, depth: floorDepth }, scene);
  floor.physicsImpostor = new PhysicsImpostor(floor, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, scene);
  floor.physicsImpostor.physicsBody.isKinematic = true; // specific to oimo.js
  floor.physicsImpostor.physicsBody.shapes.belongsTo = GROUND;
  floor.physicsImpostor.physicsBody.shapes.collidesWith = RAGDOLLS;
  floor.position.y = -floorHeight / 2;
  floor.isPickable = false;
  floor.isVisible = false;

  const floorColor = 128 / 255;
  const floorMaterial = new StandardMaterial('floorMaterial', scene);
  floorMaterial.disableLighting = true;
  floorMaterial.emissiveColor = new Color3(floorColor, floorColor, floorColor);
  floor.material = floorMaterial;

  const $footer = document.getElementById('footer');

  function pinGroundPlaneToFooter() {
    const footerRect = $footer.getBoundingClientRect();
    const floorBoundingBox = floor.getBoundingInfo().boundingBox;
    // find the world-space location of the top center of the footer element
    // at the Z position of the far edge of the ground plane
    const targetFooterTopCenterWorld = viewportToWorldPoint(
      (((footerRect.right - footerRect.left) / 2) / engine.getRenderWidth()) / engine.getHardwareScalingLevel(),
      (footerRect.top / engine.getRenderHeight()) / engine.getHardwareScalingLevel(),
      floorBoundingBox.maximumWorld.z,
      camera
    );
    camera.position.y -= targetFooterTopCenterWorld.y;
  }
  pinGroundPlaneToFooter();
  scene.onBeforeRenderObservable.add(pinGroundPlaneToFooter);

  if (isMobile) {
    floor.isVisible = true;
    return scene;
  }

  // door

  const doorHeight = 2;
  const door = MeshBuilder.CreatePlane('door', { width: 1.5, height: doorHeight }, scene);
  door.position = new Vector3(8.235, doorHeight / 2, 8.9);
  door.rotation.y = Angle.FromDegrees(88).radians();
  door.setParent(floor);
  door.isPickable = false;
  door.isVisible = false;

  const doorMaterial = new StandardMaterial('doorMaterial', scene);
  doorMaterial.disableLighting = true;
  doorMaterial.emissiveColor = new Color3(0, 0, 0);
  door.material = doorMaterial;

  // reference: https://stackoverflow.com/questions/55982637/is-is-possible-in-babylon-js-to-occlude-an-object-using-a-transparent-object
  const occluderHeight = 3;
  const transparentOccluder = MeshBuilder.CreatePlane('occluder', { width: 5, height: occluderHeight }, scene)
  transparentOccluder.position = new Vector3(10.7, occluderHeight / 2, 8)
  transparentOccluder.setParent(floor);
  transparentOccluder.onBeforeRenderObservable.add(() => engine.setColorWrite(false));
  transparentOccluder.onAfterRenderObservable.add(() => engine.setColorWrite(true));
  transparentOccluder.isPickable = false;
  transparentOccluder.isVisible = false

  // invisible walls

  const wallHeight = 100;
  const wallDepth = 1;

  const frontWall = MeshBuilder.CreateBox('frontWall', { width: floorWidth, height: wallHeight, depth: wallDepth }, scene);
  frontWall.position = new Vector3(0, 0, floorDepth / 2 + wallDepth / 2);
  frontWall.physicsImpostor = new PhysicsImpostor(frontWall, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
  frontWall.physicsImpostor.physicsBody.shapes.belongsTo = WALLS;
  frontWall.physicsImpostor.physicsBody.shapes.collidesWith = RAGDOLLS;
  frontWall.isPickable = false;
  frontWall.isVisible = false;
  frontWall.freezeWorldMatrix();

  const backWall = MeshBuilder.CreateBox('backWall', { width: floorWidth, height: wallHeight, depth: wallDepth }, scene);
  backWall.position = new Vector3(0, 0, -floorDepth / 2 - wallDepth / 2);
  backWall.physicsImpostor = new PhysicsImpostor(backWall, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
  backWall.physicsImpostor.physicsBody.shapes.belongsTo = WALLS;
  backWall.physicsImpostor.physicsBody.shapes.collidesWith = RAGDOLLS;
  backWall.isPickable = false;
  backWall.isVisible = false;
  backWall.freezeWorldMatrix();

  const leftWall = MeshBuilder.CreateBox('leftWall', { width: wallDepth, height: wallHeight, depth: floorDepth }, scene);
  leftWall.position = new Vector3(-12, 0, 0);
  leftWall.physicsImpostor = new PhysicsImpostor(leftWall, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
  leftWall.physicsImpostor.physicsBody.shapes.belongsTo = WALLS;
  leftWall.physicsImpostor.physicsBody.shapes.collidesWith = RAGDOLLS;
  leftWall.isPickable = false;
  leftWall.isVisible = false;
  leftWall.freezeWorldMatrix();

  const rightWall = MeshBuilder.CreateBox('rightWall', { width: wallDepth, height: wallHeight, depth: floorDepth }, scene);
  rightWall.position = new Vector3(12, 0, 0);
  rightWall.physicsImpostor = new PhysicsImpostor(leftWall, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
  rightWall.physicsImpostor.physicsBody.shapes.belongsTo = WALLS;
  rightWall.physicsImpostor.physicsBody.shapes.collidesWith = RAGDOLLS;
  rightWall.isPickable = false;
  rightWall.isVisible = false;
  rightWall.freezeWorldMatrix();

  // crowd navigation

  const navigationPlugin = new RecastJSPlugin(Recast);
  navigationPlugin.createNavMesh([floor], {
    cs: 0.2,
    ch: 0.2,
    walkableSlopeAngle: 0,
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

  // agents

  const agentPools = await AgentPool.initializeAgentPools(models, navigationPlugin, scene);
  const agentsByMesh = new Map();

  function addAgent() {
    const newAgent = randomItem(agentPools).instantiate(
      new Vector3(9, 0, 8.9),
      new Vector3(Angle.FromDegrees(-90).radians(), Angle.FromDegrees(90).radians(), 0),
      new Vector3(0.01, 0.01, 0.01)
    );
    agentsByMesh.set(newAgent.mesh, newAgent);
    const agentDestination = new Vector3(
      Scalar.RandomRange(-7, 7),
      0,
      Scalar.RandomRange(6, 8.9)
    );
    newAgent.moveTo(agentDestination, () => newAgent.rotateTo(Angle.FromDegrees(180).radians(), null), 0);
  }

  // window resizing camera logic

  $footer.addEventListener('transitionend', () => {
    const footerTransform = window.getComputedStyle($footer).getPropertyValue('transform');
    if (footerTransform === 'none')  { // visible
      addAgent();
    } else { // not visible
      floor.isVisible = false;
      door.isVisible = false;
      transparentOccluder.isVisible = false;
      for (const agent of agentsByMesh.values()) {
        agent.mesh.isVisible = false;
        if (!agent.isRagdoll && !agent.isFrozen) {
          agent.setRandomRagdollPose();
        }
      }
    }
  });

  // event handling

  events.onNavigateOnline.add(() => {
    floor.isVisible = true;
    door.isVisible = true;
    transparentOccluder.isVisible = true;
    for (const agent of agentsByMesh.values()) {
      agent.mesh.isVisible = true;
    }
  });

  events.onViewOnlineArtwork.add(() => {
    addAgent();
  });

  scene.onPointerObservable.add(pointerInfo => {
    switch (pointerInfo.type) {
      case PointerEventTypes.POINTERDOWN:
        if (pointerInfo.pickInfo.hit) {
          const agent = agentsByMesh.get(pointerInfo.pickInfo.pickedMesh);
          if (agent && !agent.isRagdoll && !agent.isFrozen) {
            agent.fall(true, () => {
              // TODO: add frozen ragdoll mesh to navmesh
            });
          }
        }
        break;
    }
  });

  // scene.debugLayer.show({
  //   overlay: true
  // });

  return scene;
}
