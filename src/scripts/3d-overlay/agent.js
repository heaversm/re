import { Animation } from '@babylonjs/core/Animations/animation';
import { EasingFunction, CubicEase } from '@babylonjs/core/Animations/easing';
import { Color3, Vector3, Axis } from '@babylonjs/core/Maths/math';
import { Scalar } from '@babylonjs/core/Maths/math.scalar';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { MultiMaterial } from '@babylonjs/core/Materials/multiMaterial';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { AssetsManager } from '@babylonjs/core/Misc/assetsManager';

import '@babylonjs/core/Loading/loadingScreen';
import '@babylonjs/core/Loading/Plugins/babylonFileLoader';
import '@babylonjs/loaders';

import Ragdoll from './ragdoll';

export class AgentPool {
  static agents = {
    AGENT_0: 'agent0'
  };

  static agentModelDirectory = 'assets/models/';

  static agentModelFileNames = {
    [AgentPool.agents.AGENT_0]: 'agent0.babylon'
  };

  static agentMaterialVariantColors = {
    [AgentPool.agents.AGENT_0]: [
      [new Color3(0.8, 0.8, 0.8), new Color3(0.8, 0.8, 0.8), new Color3(0, 1, 0), new Color3(1, 0, 0)]
    ]
  };

  static agentRagdollConfigs = {
    [AgentPool.agents.AGENT_0]: [
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
    ]
  }

  static crowd = null;
  static navigationPlugin = null;

  static defaultCrowdAgentParameters = {
    radius: 0.1,
    maxAcceleration: 200.0,
    maxSpeed: 0.8,
    collisionQueryRange: 1,
    pathOptimizationRange: 0.0,
    separationWeight: 1.0
  };

  static async initializeAgentPools(navigationPlugin, scene, maxAgents = 100) {
    this.navigationPlugin = navigationPlugin;
    if (this.navigationPlugin) {
      this.crowd = navigationPlugin.createCrowd(maxAgents, 1, scene);
    }

    const assetsManager = new AssetsManager(scene);
    const agentPoolPromises = Object.values(this.agents).map(agentEnum => new Promise(resolve => {
      const agentTask = assetsManager.addContainerTask(`${agentEnum}Task`, '', this.agentModelDirectory, this.agentModelFileNames[agentEnum])
      agentTask.onSuccess = ({ loadedContainer }) => resolve(new AgentPool(loadedContainer, agentEnum, scene));
    }));

    assetsManager.load();

    return await Promise.all(agentPoolPromises);
  }

  constructor(assetContainer, agentEnum, scene) {
    this.assetContainer = assetContainer;
    this.agentEnum = agentEnum;
    this.scene = scene;

    this.materialVariants = (this.constructor.agentMaterialVariantColors[agentEnum] || []).map((colors, i) => {
      const materialName = `${agentEnum}MultiMaterial${i}`;
      const multiMaterial = new MultiMaterial(materialName, scene);
      for (const [j, color] of colors.entries()) {
        const colorMaterial = new StandardMaterial(`${materialName}SubMaterial${j}`, scene);
        colorMaterial.disableLighting = true;
        colorMaterial.emissiveColor = color;
        multiMaterial.subMaterials.push(colorMaterial);
      }
      return multiMaterial;
    });
  }

  instantiate(position, rotation, scaling, variant = -1) {
    const { rootNodes: meshes, skeletons } = this.assetContainer.instantiateModelsToScene();

    const [mesh] = meshes;
    const [skeleton] = skeletons;

    mesh.position = position;
    mesh.rotation = rotation;
    mesh.scaling = scaling;

    mesh.material = variant === -1 ?
      this.materialVariants[Math.floor(Math.random() * this.materialVariants.length)] :
      this.materialVariants[variant];

    const config = this.constructor.agentRagdollConfigs[this.agentEnum];
    const jointCollisions = false;
    const showBoxes = false;
    const mainPivotSphereSize = 0;
    const disableBoxBoneSync = false;
    const ragdoll = new Ragdoll(skeleton, mesh, config, jointCollisions, showBoxes, mainPivotSphereSize, disableBoxBoneSync);
    ragdoll.init();

    let crowdAgentIndex = null;
    const size = mesh.getBoundingInfo().boundingBox.extendSizeWorld;
    if (this.constructor.crowd) {
      const crowdAgentParameters = {
        ...this.constructor.defaultCrowdAgentParameters,
        height: size.y
      };
      crowdAgentIndex = this.constructor.crowd.addAgent(position, crowdAgentParameters, new TransformNode());
    }

    skeleton.beginAnimation('Idle', true);

    return new Agent(mesh, skeleton, ragdoll, crowdAgentIndex);
  }
}

export class Agent {
  static arrivalDistanceThreshold = 0.01;

  constructor(mesh, skeleton, ragdoll, crowdAgentIndex) {
    this.mesh = mesh;
    this.skeleton = skeleton;
    this.crowdAgentIndex = crowdAgentIndex;
    this.ragdoll = ragdoll;
    this.destination = null;
    this.onArrival = () => {};
    this.onArrivalDistanceOffset = 0;

    this.walk = this.walk.bind(this);
  }

  get isRagdoll() {
    return this.ragdoll.ragdollMode;
  }

  moveTo(targetPosition, onArrival = () => {}, onArrivalDistanceOffset = 0) {
    if (!AgentPool.navigationPlugin || !AgentPool.crowd || this.crowdAgentIndex === null) {
      return;
    }
    this.destination = AgentPool.navigationPlugin.getClosestPoint(targetPosition);
    AgentPool.crowd.agentGoto(this.crowdAgentIndex, this.destination);

    this.skeleton.beginAnimation('Walk', true);

    this.mesh.onBeforeRenderObservable.clear();
    this.mesh.onBeforeRenderObservable.add(this.walk);

    this.onArrival = onArrival;
    this.onArrivalDistanceOffset = onArrivalDistanceOffset;
  }

  fall() {
    if (this.crowdAgentIndex !== null) {
      AgentPool.crowd.removeAgent(this.crowdAgentIndex);
      this.mesh.onBeforeRenderObservable.clear();
      this.crowdAgentIndex = null;
    }
    this.ragdoll.ragdoll();
  }

  walk() {
    if (!AgentPool.navigationPlugin || !AgentPool.crowd || this.crowdAgentIndex === null) {
      return;
    }
    this.mesh.position = AgentPool.crowd.getAgentPosition(this.crowdAgentIndex);

    const velocity = AgentPool.crowd.getAgentVelocity(this.crowdAgentIndex);
    const speed = velocity.length();
    if (speed > 0.2) {
      velocity.normalize();
      const desiredRotation = Math.atan2(velocity.x, velocity.z);
      this.mesh.rotation.y = this.mesh.rotation.y + (-desiredRotation - this.mesh.rotation.y) * 0.01;
    }

    const distance = Vector3.Distance(this.mesh.position, this.destination);

    // this lets us run the onArrival callback a little early
    if (this.onArrivalDistanceOffset > 0 && distance <= (this.constructor.arrivalDistanceThreshold + this.onArrivalDistanceOffset)) {
      this.onArrival(this);
      this.onArrival = () => {};
      this.onArrivalDistanceOffset = 0;
    }

    if (distance <= this.constructor.arrivalDistanceThreshold) {
      this.skeleton.beginAnimation('Idle', true);
      this.mesh.onBeforeRenderObservable.clear();
      this.destination = null;
      AgentPool.crowd.agentTeleport(this.crowdAgentIndex, AgentPool.navigationPlugin.getClosestPoint(this.mesh.position));

      if (this.onArrival) {
        this.onArrival(this);
      }
      this.onArrival = () => {};
      this.onArrivalDistanceOffset = 0;
    }
  }

  rotateTo(targetAngle, speed, easingMode = EasingFunction.EASINGMODE_EASEINOUT) {
    const ease = new CubicEase();
    ease.setEasingMode(easingMode);
    Animation.CreateAndStartAnimation(
      `rotateAgent_${Date.now()}`,
      this.mesh,
      'rotation.y',
      60,
      60 * speed,
      Scalar.NormalizeRadians(this.mesh.rotation.y),
      Scalar.NormalizeRadians(targetAngle),
      Animation.ANIMATIONLOOPMODE_RELATIVE,
      ease
    );
  }
}
