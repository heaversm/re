import * as OIMO from 'oimo';
import { Animation } from '@babylonjs/core/Animations/animation';
import { AnimationPropertiesOverride } from '@babylonjs/core/Animations/animationPropertiesOverride';
import { Scene } from '@babylonjs/core/scene';
import { Camera } from '@babylonjs/core/Cameras/camera';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { MultiMaterial } from '@babylonjs/core/Materials/multiMaterial';
import { Vector3, Color4, Angle, Axis } from '@babylonjs/core/Maths/math';
import { AssetsManager } from '@babylonjs/core/Misc/assetsManager';
import { OimoJSPlugin } from '@babylonjs/core/Physics/Plugins/oimoJSPlugin';

import '@babylonjs/core/Cameras/universalCamera';
import '@babylonjs/core/Physics/physicsEngineComponent';
import '@babylonjs/core/Loading/loadingScreen';
import '@babylonjs/core/Loading/Plugins/babylonFileLoader';
import '@babylonjs/loaders'

import Ragdoll from './ragdoll.js';
import { generateVariantColors } from './agent.js';

export default async function createScene(engine) {
  const scene = new Scene(engine);

  scene.enablePhysics(new Vector3(0, -9.8, 0), new OimoJSPlugin(true, 8, OIMO));

  // this is really important to tell Babylon.js to use decomposeLerp and matrix interpolation
  Animation.AllowMatricesInterpolation = true;

  // could also assign animationPropertiesOverride to an individual skeleton, but might as well assign it to the whole scene
  scene.animationPropertiesOverride = new AnimationPropertiesOverride();
  scene.animationPropertiesOverride.loopMode = Animation.ANIMATIONLOOPMODE_CYCLE;
  scene.animationPropertiesOverride.enableBlending = true;
  scene.animationPropertiesOverride.blendingSpeed = 0.075;

  scene.clearColor = new Color4(0, 0, 0, 0);

  const camera = new FreeCamera('camera', new Vector3(0, 1, -3), scene);
  camera.fovMode = Camera.FOVMODE_HORIZONTAL_FIXED; // resize the scene based on canvas width instead of height

  const assetsManager = new AssetsManager(scene);
  assetsManager.useDefaultLoadingScreen = false;
  const characterFileNames = [
    'agent0.babylon',
    'agent3.babylon',
    'agent4.babylon',
    'agent5.babylon',
    'agent7.babylon'
  ];
  const characterPromises = characterFileNames.map(characterFileName => new Promise(resolve => {
    const agentTask = assetsManager.addContainerTask(`${characterFileName}Task`, '', 'assets/models/', characterFileName)
    agentTask.onSuccess = ({ loadedContainer }) => resolve(loadedContainer);
  }));

  assetsManager.loadAsync();

  const characterContainers = await Promise.all(characterPromises);

  const { rootNodes: meshes, skeletons } = characterContainers[0].instantiateModelsToScene();
  const [mesh] = meshes;
  const [skeleton] = skeletons;
  mesh.rotation = new Vector3(Angle.FromDegrees(-90).radians(), 0, 0),
  mesh.scaling = new Vector3(0.01, 0.01, 0.01);

  const colorVariants = generateVariantColors(0, 1, 2, 3, true);
  const colors = colorVariants[0];
  const multiMaterial = new MultiMaterial('characterMaterial', scene);
  for (const [j, color] of colors.entries()) {
    const colorMaterial = new StandardMaterial(`characterMaterialSubMaterial${j}`, scene);
    colorMaterial.disableLighting = true;
    colorMaterial.emissiveColor = color;
    colorMaterial.freeze();
    multiMaterial.subMaterials.push(colorMaterial);
  }
  multiMaterial.freeze();
  mesh.material = multiMaterial;

  const ragdollConfig = [
    { bones: ["mixamorig_Hips"], size: 0.2, boxOffset: -0.05 },
    { bones: ["mixamorig_Spine1"], size: 0.2, boxOffset: 0.1, min: -10, max: 10 },
    { bones: ["mixamorig_HeadTop_End"], size: 0.225, boxOffset: -0.115, min: -10, max: 10 },
    { bones: ["mixamorig_RightArm", "mixamorig_LeftArm"], size: 0.1, height: 0.2, rotationAxis: Axis.Z, min: -45, max: 90, boxOffset: 0.1 },
    { bones: ["mixamorig_RightForeArm", "mixamorig_LeftForeArm"], size: 0.1, height: 0.2, rotationAxis: Axis.Y, min: -90, max: 90, boxOffset: 0.1 },
    { bones: ['mixamorig_RightHand', 'mixamorig_LeftHand'], size: 0.1, height: 0.15, min: -10, max: 10, boxOffset: 0.05 },
    { bones: ["mixamorig_RightUpLeg", "mixamorig_LeftUpLeg"], size: 0.15, height: 0.25, rotationAxis: Axis.Z, min: -90, max: 90, boxOffset: 0.25 },
    { bones: ["mixamorig_RightLeg", "mixamorig_LeftLeg"], size: 0.15, height: 0.25, min: -45, max: 90, boxOffset: 0.15 },
    { bones: ["mixamorig_RightFoot", "mixamorig_LeftFoot"], size: 0.15, min: -10, max: 10 },
  ];
  const jointCollisions = false;
  const showBoxes = false;
  const mainPivotSphereSize = 0;
  const disableBoxBoneSync = false;
  const isKinematic = true;
  const ragdoll = new Ragdoll(skeleton, mesh, ragdollConfig, jointCollisions, showBoxes, mainPivotSphereSize, disableBoxBoneSync, isKinematic);
  ragdoll.init();
  ragdoll.ragdoll();

  return scene;
}
