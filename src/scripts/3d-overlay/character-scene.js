import * as OIMO from 'oimo';
import { Animation } from '@babylonjs/core/Animations/animation';
import { AnimationPropertiesOverride } from '@babylonjs/core/Animations/animationPropertiesOverride';
import { Scene } from '@babylonjs/core/scene';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { Vector3, Color4, Angle, Axis } from '@babylonjs/core/Maths/math';
import { AssetsManager } from '@babylonjs/core/Misc/assetsManager';
import { OimoJSPlugin } from '@babylonjs/core/Physics/Plugins/oimoJSPlugin';

import '@babylonjs/core/Cameras/universalCamera';
import '@babylonjs/core/Physics/physicsEngineComponent';
import '@babylonjs/core/Loading/loadingScreen';
import '@babylonjs/core/Loading/Plugins/babylonFileLoader';
import '@babylonjs/loaders'

import Ragdoll from './ragdoll.js';
import { AGENTS, generateMaterialVariants } from './agent.js';
import { randomItem, map } from './utils';

export default async function createScene(engine, models, events) {
  const scene = new Scene(engine);

  scene.enablePhysics(new Vector3(0, 0, 0), new OimoJSPlugin(true, 8, OIMO));

  // this is really important to tell Babylon.js to use decomposeLerp and matrix interpolation
  Animation.AllowMatricesInterpolation = true;

  // could also assign animationPropertiesOverride to an individual skeleton, but might as well assign it to the whole scene
  scene.animationPropertiesOverride = new AnimationPropertiesOverride();
  scene.animationPropertiesOverride.loopMode = Animation.ANIMATIONLOOPMODE_CYCLE;
  scene.animationPropertiesOverride.enableBlending = true;
  scene.animationPropertiesOverride.blendingSpeed = 0.075;

  scene.clearColor = new Color4(0, 0, 0, 0);

  const camera = new FreeCamera('camera', new Vector3(0, 0.9, -3), scene);

  const assetsManager = new AssetsManager(scene);
  assetsManager.useDefaultLoadingScreen = false;
  const characterPromises = Object.entries(models).map(([characterName, modelURL]) => new Promise(resolve => {
    const agentTask = assetsManager.addContainerTask(`${characterName}Task`, '', '', modelURL)
    agentTask.onSuccess = ({ loadedContainer }) => resolve([characterName, loadedContainer]);
  }));

  assetsManager.loadAsync();

  const characterContainers = (await Promise.all(characterPromises)).reduce((acc, [characterName, assetContainer]) => ({
    ...acc,
    [characterName]: assetContainer
  }), {});

  let character = null;
  function instantiateRandomCharacter() {
    if (character) {
      disposeCharacter();
    }
    character = {};
    const agentEnum = randomItem(Object.values(AGENTS));
    const agentMaterialVariants = generateMaterialVariants(agentEnum, scene);

    const { rootNodes: meshes, skeletons } = characterContainers[agentEnum].instantiateModelsToScene();
    const [mesh] = meshes;
    const [skeleton] = skeletons;
    mesh.rotation = new Vector3(Angle.FromDegrees(-90).radians(), 0, 0),
    mesh.scaling = new Vector3(0.01, 0.01, 0.01);
    mesh.material = randomItem(agentMaterialVariants);

    character.mesh = mesh;

    const ragdollConfig = [
      { bones: ["mixamorig_Hips"], size: 0.2, boxOffset: -0.05 },
      { bones: ["mixamorig_Spine1"], size: 0.2, boxOffset: 0.1, min: -10, max: 10 },
      { bones: ["mixamorig_HeadTop_End"], size: 0.225, boxOffset: -0.115, min: -10, max: 10 },
      { bones: ["mixamorig_RightArm", "mixamorig_LeftArm"], size: 0.1, height: 0.2, rotationAxis: Axis.Z, min: -90, max: 90, boxOffset: 0.1 },
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

    character.ragdoll = ragdoll;

    const spineIndex = ragdoll.boneNames.indexOf('mixamorig_Spine1');
    const spineImpostor = ragdoll.impostors[spineIndex];
    spineImpostor.physicsBody.isKinematic = true;

    const leftHandIndex = ragdoll.boneNames.indexOf('mixamorig_LeftHand');
    const leftHandImpostor = ragdoll.impostors[leftHandIndex];
    const leftHandTransform = leftHandImpostor.object;
    leftHandImpostor.physicsBody.isKinematic = true;
    leftHandImpostor.physicsBody.position = new OIMO.Vec3(1, 1.5, -0.15);
    leftHandImpostor.physicsBody.isKinematic = false;

    const rightHandIndex = ragdoll.boneNames.indexOf('mixamorig_RightHand');
    const rightHandImpostor = ragdoll.impostors[rightHandIndex];
    const rightHandTransform = rightHandImpostor.object;

    const leftFootIndex = ragdoll.boneNames.indexOf('mixamorig_LeftFoot');
    const leftFootImpostor = ragdoll.impostors[leftFootIndex];
    const leftFootTransform = leftFootImpostor.object;
    leftFootImpostor.physicsBody.isKinematic = true;

    const rightFootIndex = ragdoll.boneNames.indexOf('mixamorig_RightFoot');
    const rightFootImpostor = ragdoll.impostors[rightFootIndex];
    const rightFootTransform = rightFootImpostor.object;
    rightFootImpostor.physicsBody.isKinematic = true;

    // doesn't seem to be working...
    character.mouseObserver = events.onMouseMove.add(({ x, y }) => {
      if (x > 0.5) {
        rightHandImpostor.physicsBody.isKinematic = false;
        leftHandImpostor.physicsBody.isKinematic = true;
        leftHandTransform.position.x = map(x, 0.5, 1, 0, 2, true);
      } else {
        leftHandImpostor.physicsBody.isKinematic = false;
        rightHandImpostor.physicsBody.isKinematic = true;
        rightHandTransform.position.x = map(x, 0, 0.5, -2, 0, true);
      }
    });
  }

  function disposeCharacter() {
    if (!character) {
      return;
    }
    if (character.ragdoll) {
      character.ragdoll.dispose();
    }
    if (character.mesh) {
      character.mesh.dispose();
    }
    if (character.mouseObserver) {
      events.onMouseMove.remove(character.mouseObserver);
    }
    character = null;
  }


  function setCameraZPosition() {
    if (!character) {
      return;
    }
    const boundingBox = character.mesh.getBoundingInfo().boundingBox;
    const extents = boundingBox.extendSizeWorld;
    const height = extents.y * 2;
    const cameraDist = ((height / Math.tan((Angle.FromRadians(camera.fov).degrees() / 2) / ( 180 / Math.PI ))) / 2) + extents.z;
    camera.position.z = -cameraDist;
  }
  events.onResizeSketchContainer.add(setCameraZPosition);

  events.onViewOnlineArtwork.add(() => {
    instantiateRandomCharacter();
    setCameraZPosition();
  })

  events.onNavigateOnline.add(() => {
    disposeCharacter();
  });

  events.onNavigateIRL.add(() => {
    disposeCharacter();
  })

  return scene;
}
