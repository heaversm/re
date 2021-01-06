import { Color3, Axis } from '@babylonjs/core/Maths/math';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { MultiMaterial } from '@babylonjs/core/Materials/multiMaterial';

import Ragdoll from './ragdoll';

export class AgentPool {
  constructor(assetContainer, scene) {
    this.assetContainer = assetContainer;
    this.scene = scene;

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
    this.agentMaterial = agentMaterial;
  }

  instantiate(position, rotation, scaling) {
    const { rootNodes: meshes, skeletons } = this.assetContainer.instantiateModelsToScene();

    const [mesh] = meshes;
    const [skeleton] = skeletons;

    mesh.material = this.agentMaterial;
    mesh.position = position;
    mesh.rotation = rotation;
    mesh.scaling = scaling;

    return new Agent(mesh, skeleton);
  }
}

export class Agent {
  constructor(mesh, skeleton) {
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

    this.mesh = mesh;
    this.skeleton = skeleton;
    this.ragdoll = ragdoll;
  }
}
