/* globals BABYLON dat */

import Ragdoll from "./ragdoll.js";

export default async function createScene(engine) {
  const scene = new BABYLON.Scene(engine);
  const canvas = engine.getRenderingCanvas();

  scene.enablePhysics(
    new BABYLON.Vector3(0, -9, 0),
    new BABYLON.OimoJSPlugin()
  );

  // this is really important to tell Babylon.js to use decomposeLerp and matrix interpolation
  BABYLON.Animation.AllowMatricesInterpolation = true;

  // could also assign animationPropertiesOverride to an individual skeleton, but might as well assign it to the whole scene
  scene.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
  scene.animationPropertiesOverride.loopMode =
    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE;
  scene.animationPropertiesOverride.enableBlending = true;
  scene.animationPropertiesOverride.blendingSpeed = 0.075;

  scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

  // camera

  const camera = new BABYLON.ArcRotateCamera(
    "Camera",
    -Math.PI / 2,
    Math.PI / 2,
    155,
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  camera.lowerRadiusLimit = 2;
  camera.upperRadiusLimit = 4;
  camera.wheelDeltaPercentage = 0.01;

  //
  /*
  //MH - stationary camera
  const camera = new BABYLON.UniversalCamera(
    "Camera",
    new BABYLON.Vector3(0, 0, -3),
    scene
  );
  camera.setTarget(BABYLON.Vector3.Zero());
  */

  camera.attachControl(canvas, true);

  // floor

  const floorBoxSize = 200;
  const floorBox = BABYLON.MeshBuilder.CreateBox(
    "FLOOR",
    { size: floorBoxSize },
    scene
  );
  floorBox.position.y = -floorBoxSize / 2;
  floorBox.physicsImpostor = new BABYLON.PhysicsImpostor(
    floorBox,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0, restitution: 0 },
    scene
  );

  const floorMaterial = new BABYLON.StandardMaterial("floorMaterial", scene);
  floorMaterial.disableLighting = true;
  floorMaterial.emissiveColor = new BABYLON.Color3(0.4, 0.4, 0.4);
  floorBox.material = floorMaterial;

  // character

  const {
    animationGroups,
    meshes,
    skeletons,
  } = await BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "https://cdn.glitch.com/a5a2873e-3b23-409b-be70-ed2ad0fb1a93%2Fagent0.babylon?v=1608602556112",
    "",
    scene
  );

  const [mesh] = meshes;
  const [skeleton] = skeletons;

  meshes[0].rotation = new BABYLON.Vector3(
    BABYLON.Angle.FromDegrees(-90).radians(),
    BABYLON.Angle.FromDegrees(-90).radians(),
    0
  );
  meshes[0].scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);

  const lightGrayMaterial = new BABYLON.StandardMaterial(
    "lightGrayMaterial",
    scene
  );
  lightGrayMaterial.disableLighting = true;
  lightGrayMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);

  const greenMaterial = new BABYLON.StandardMaterial("greenMaterial", scene);
  greenMaterial.disableLighting = true;
  greenMaterial.emissiveColor = new BABYLON.Color3(0, 1, 0);

  const redMaterial = new BABYLON.StandardMaterial("redMaterial", scene);
  redMaterial.disableLighting = true;
  redMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0);

  const agentMaterial = new BABYLON.MultiMaterial("agentMaterial", scene);
  agentMaterial.subMaterials.push(lightGrayMaterial);
  agentMaterial.subMaterials.push(lightGrayMaterial);
  agentMaterial.subMaterials.push(greenMaterial);
  agentMaterial.subMaterials.push(redMaterial);
  mesh.material = agentMaterial;

  //skeleton.beginAnimation("Idle", true); // true means loop
  skeleton.beginAnimation("Walk", true);

  // ragdoll

  const config = [
    { bones: ["mixamorig_Hips"], size: 0.2, boxOffset: -0.05 },
    {
      bones: ["mixamorig_Spine1"],
      size: 0.2,
      boxOffset: 0.1,
      min: -10,
      max: 10,
    },
    {
      bones: ["mixamorig_HeadTop_End"],
      size: 0.225,
      boxOffset: -0.115,
      min: -10,
      max: 10,
    },
    {
      bones: ["mixamorig_RightArm"],
      size: 0.1,
      height: 0.2,
      rotationAxis: BABYLON.Axis.Z,
      min: -45,
      max: 90,
      boxOffset: 0.1,
    },
    {
      bones: ["mixamorig_LeftArm"],
      size: 0.1,
      height: 0.2,
      rotationAxis: BABYLON.Axis.Z,
      min: -45,
      max: 90,
      boxOffset: 0.1,
    },
    {
      bones: ["mixamorig_RightForeArm"],
      size: 0.1,
      height: 0.2,
      rotationAxis: BABYLON.Axis.Y,
      min: -90,
      max: 90,
      boxOffset: 0.1,
    },
    {
      bones: ["mixamorig_LeftForeArm"],
      size: 0.1,
      height: 0.2,
      rotationAxis: BABYLON.Axis.Y,
      min: -90,
      max: 90,
      boxOffset: 0.1,
    },
    {
      bones: ["mixamorig_RightHand", "mixamorig_LeftHand"],
      size: 0.1,
      height: 0.15,
      min: -10,
      max: 10,
      boxOffset: 0.05,
    },
    {
      bones: ["mixamorig_RightUpLeg", "mixamorig_LeftUpLeg"],
      size: 0.15,
      height: 0.25,
      rotationAxis: BABYLON.Axis.Z,
      min: -90,
      max: 90,
      boxOffset: 0.25,
    },
    {
      bones: ["mixamorig_RightLeg", "mixamorig_LeftLeg"],
      size: 0.15,
      height: 0.25,
      min: -45,
      max: 90,
      boxOffset: 0.15,
    },
    {
      bones: ["mixamorig_RightFoot", "mixamorig_LeftFoot"],
      size: 0.15,
      min: -10,
      max: 10,
    },
  ];

  const jointCollisions = false;
  const showBoxes = false;
  const mainPivotSphereSize = 0;
  const disableBoxBoneSync = false;
  const ragdoll = new Ragdoll(
    skeleton,
    mesh,
    config,
    jointCollisions,
    showBoxes,
    mainPivotSphereSize,
    disableBoxBoneSync
  );

  ragdoll.init();

  const toggleRagdoll = function () {
    if (ragdoll.ragdollMode) {
      skeleton.beginAnimation("Idle", true);
      ragdoll.ragdollOff();
    } else {
      scene.stopAnimation(skeletons[0]);
      ragdoll.ragdoll();
    }
  };

  const controls = {
    Idle: function () {
      skeleton.beginAnimation("Idle", true);
    },
    Walk: function () {
      skeleton.beginAnimation("Walk", true);
    },
    "Toggle Ragdoll": function () {
      if (ragdoll.ragdollMode) {
        skeleton.beginAnimation("Idle", true);
        ragdoll.ragdollOff();
      } else {
        scene.stopAnimation(skeletons[0]);
        ragdoll.ragdoll();
      }
    },
  };

  scene.skeleton = skeleton;
  scene.mesh = mesh;
  scene.camera = camera;
  scene.toggleRagdoll = toggleRagdoll;

  return scene;
}
