import { Animation } from '@babylonjs/core/Animations/animation';
import { EasingFunction, CubicEase } from '@babylonjs/core/Animations/easing';
import { Color3, Vector3, Quaternion, Axis, Angle } from '@babylonjs/core/Maths/math';
import { Scalar } from '@babylonjs/core/Maths/math.scalar';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { MultiMaterial } from '@babylonjs/core/Materials/multiMaterial';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { AssetsManager } from '@babylonjs/core/Misc/assetsManager';

import '@babylonjs/core/Loading/loadingScreen';
import '@babylonjs/core/Loading/Plugins/babylonFileLoader';
import '@babylonjs/loaders';

import Ragdoll from './ragdoll';
import { randomItem } from './utils';

const black = new Color3(0, 0, 0);
const darkGray = new Color3(0.2, 0.2, 0.2);
const mediumGray = new Color3(0.4, 0.4, 0.4);
const lightGray = new Color3(0.6, 0.6, 0.6);
const red = new Color3(1, 0, 0);
const green = new Color3(0, 1, 0);
const blue = new Color3(0, 0, 1);
const yellow = new Color3(1, 1, 0);
const magenta = new Color3(1, 0, 1);
const cyan = new Color3(0, 1, 1);
const grays = [darkGray, mediumGray, lightGray];
const colors = [red, green, blue, yellow, magenta, cyan];
const colorPairs = pairs(colors);

function pairs(arr) {
  return arr.map((v, i) => arr.slice(i + 1).map(w => [v, w]) ).flat();
}

export function generateVariantColors(hairIndex, skinIndex, legsIndex, torsoIndex, useSkinColorForHairIndex = false) {
  const variants = [];
  for (const gray of grays) {
    for (const colorPair of colorPairs) {
      for (let i = 0; i < 2; i++) {
        const variant = new Array(4);
        variant[hairIndex] = useSkinColorForHairIndex ? gray : black;
        variant[skinIndex] = gray;
        if (i === 0) {
          variant[legsIndex] = colorPair[0];
          variant[torsoIndex] = colorPair[1];
        } else {
          variant[legsIndex] = colorPair[1];
          variant[torsoIndex] = colorPair[0];
        }
        variants.push(variant);
      }
    }
  }

  return variants;
}

export class AgentPool {
  static agents = {
    AGENT_0: 'agent0',
    AGENT_3: 'agent3',
    AGENT_4: 'agent4',
    AGENT_5: 'agent5',
    AGENT_7: 'agent7',
  };

  static agentModelDirectory = 'assets/models/';

  static agentModelFileNames = {
    [AgentPool.agents.AGENT_0]: 'agent0.babylon',
    [AgentPool.agents.AGENT_3]: 'agent3.babylon',
    [AgentPool.agents.AGENT_4]: 'agent4.babylon',
    [AgentPool.agents.AGENT_5]: 'agent5.babylon',
    [AgentPool.agents.AGENT_7]: 'agent7.babylon',
  };

  static agentAnimationNames = {
    [AgentPool.agents.AGENT_0]: {
      idle: 'Idle',
      walk: 'Walk'
    },
    [AgentPool.agents.AGENT_3]: {
      idle: 'idle',
      walk: 'walk'
    },
    [AgentPool.agents.AGENT_4]: {
      idle: 'idle',
      walk: 'walk'
    },
    [AgentPool.agents.AGENT_5]: {
      idle: 'idle',
      walk: 'walk'
    },
    [AgentPool.agents.AGENT_7]: {
      idle: 'idle',
      walk: 'walk'
    },
  }

  static agentMaterialVariantColors = {
    [AgentPool.agents.AGENT_0]: generateVariantColors(0, 1, 2, 3, true),
    [AgentPool.agents.AGENT_3]: generateVariantColors(2, 0, 1, 3),
    [AgentPool.agents.AGENT_4]: generateVariantColors(0, 1, 2, 3),
    [AgentPool.agents.AGENT_5]: generateVariantColors(0, 1, 2, 3),
    [AgentPool.agents.AGENT_7]: generateVariantColors(0, 1, 2, 3),
  };

  static agentRagdollConfig = [
    { bones: ["mixamorig_Hips"], size: 0.2, boxOffset: -0.05 },
    // { bones: ["mixamorig_Spine1"], size: 0.2, boxOffset: 0.1, min: -10, max: 10 },
    { bones: ["mixamorig_HeadTop_End"], size: 0.225, boxOffset: -0.115, min: -10, max: 10 },
    { bones: ["mixamorig_RightArm", "mixamorig_LeftArm"], size: 0.1, height: 0.2, rotationAxis: Axis.Z, min: -45, max: 90, boxOffset: 0.1 },
    { bones: ["mixamorig_RightForeArm", "mixamorig_LeftForeArm"], size: 0.1, height: 0.2, rotationAxis: Axis.Y, min: -90, max: 90, boxOffset: 0.1 },
    // { bones: ['mixamorig_RightHand', 'mixamorig_LeftHand'], size: 0.1, height: 0.15, min: -10, max: 10, boxOffset: 0.05 },
    { bones: ["mixamorig_RightUpLeg", "mixamorig_LeftUpLeg"], size: 0.15, height: 0.25, rotationAxis: Axis.Z, min: -90, max: 90, boxOffset: 0.25 },
    { bones: ["mixamorig_RightLeg", "mixamorig_LeftLeg"], size: 0.15, height: 0.25, min: -45, max: 90, boxOffset: 0.15 },
    { bones: ["mixamorig_RightFoot", "mixamorig_LeftFoot"], size: 0.15, min: -10, max: 10 },
  ]

  static crowd = null;
  static navigationPlugin = null;

  static defaultCrowdAgentParameters = {
    radius: 0.1,
    maxAcceleration: 200.0,
    maxSpeed: 0.9,
    collisionQueryRange: 1,
    pathOptimizationRange: 0.0,
    separationWeight: 1.0
  };

  static async initializeAgentPools(models, navigationPlugin, scene, maxAgents = 100) {
    this.navigationPlugin = navigationPlugin;
    if (this.navigationPlugin) {
      this.crowd = navigationPlugin.createCrowd(maxAgents, 1, scene);
    }

    const assetsManager = new AssetsManager(scene);
    assetsManager.useDefaultLoadingScreen = false;
    const agentPoolPromises = Object.values(this.agents).map(agentEnum => new Promise(resolve => {
      const agentTask = assetsManager.addContainerTask(`${agentEnum}Task`, '', '', models[agentEnum])
      agentTask.onSuccess = ({ loadedContainer }) => resolve(new AgentPool(loadedContainer, agentEnum, scene));
    }));

    assetsManager.loadAsync();

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
        colorMaterial.freeze();
        multiMaterial.subMaterials.push(colorMaterial);
      }
      multiMaterial.freeze();
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

    mesh.material = variant === -1 ? randomItem(this.materialVariants) : this.materialVariants[variant];

    const config = this.constructor.agentRagdollConfig;
    const jointCollisions = false;
    const showBoxes = false;
    const mainPivotSphereSize = 0;
    const disableBoxBoneSync = true;
    const ragdoll = new Ragdoll(skeleton, mesh, config, jointCollisions, showBoxes, mainPivotSphereSize, disableBoxBoneSync);

    let crowdAgentIndex = null;
    const size = mesh.getBoundingInfo().boundingBox.extendSizeWorld;
    if (this.constructor.crowd) {
      const crowdAgentParameters = {
        ...this.constructor.defaultCrowdAgentParameters,
        height: size.y
      };
      crowdAgentIndex = this.constructor.crowd.addAgent(position, crowdAgentParameters, new TransformNode());
    }

    skeleton.beginAnimation(this.constructor.agentAnimationNames[this.agentEnum].idle, true);

    return new Agent(mesh, skeleton, ragdoll, crowdAgentIndex, this.agentEnum, this.scene);
  }
}

const NOOP = () => {};

export class Agent {
  static arrivalDistanceThreshold = 0.01;

  static freezeVelocityThreshold = 0.001;
  static consecutiveFramesBeforeFreeze = 20;

  static ragdollPoses = [
    {
      yPosition: -0.7302830926091568,
      boneQuaternions: [
        new Quaternion(-0.4223824189293565, 0.5387931211207342, 0.45128670959833916, 0.5723944354662142),
        new Quaternion(-0.002923694836522663, -0.022647432759222413, 0.08671853731570715, 0.9959711410758517),
        new Quaternion(0.5076048083296916, 0.35956194233752375, -0.5351326914524819, 0.5715550365946197),
        new Quaternion(0.48419894460263985, 0.36708997084477374, -0.15330238488646708, 0.7792990691648872),
        new Quaternion(0.3250726615580648, -0.6023086485194654, -0.25305806688502847, 0.6837494958839964),
        new Quaternion(0.014397387323104237, -0.6431941775944776, -0.002480814316159893, 0.7655637239730883),
        new Quaternion(-0.0684370559307375, 0.08501361259450628, 0.9938702993333358, -0.017631968585119364),
        new Quaternion(0.0901722996504608, 0.4151399805604079, 0.9033450891344481, -0.05912152073657732),
        new Quaternion(-0.32249194373259144, 0.03483322111772611, 0.20673644240159633, 0.9230631752205409),
        new Quaternion(-0.137506654098428, -0.09359418791569603, -0.04464697665914606, 0.9850576924720499),
        new Quaternion(0.6708900090737446, 0.010245308292076021, -0.07907591487128285, 0.7372574898474188),
        new Quaternion(0.4920702234747887, -0.02420351028801338, -0.007140253095896099, 0.8701895652663745),
      ]
    },
    {
      yPosition: -0.8013577446037957,
      boneQuaternions: [
        new Quaternion(0.2805151269335413, 0.19981574382905615, -0.7927923441858692, 0.5028570770883478),
        new Quaternion(0.03017436937971154, -0.025771462256600562, 0.07842354437878976, 0.9961300488010268),
        new Quaternion(0.13006938521976907, -0.3894469652896441, 0.30736227967171825, 0.8584530393140395),
        new Quaternion(0.2968701731596914, -0.12744751021140843, 0.5760314220130297, 0.7508773415725685),
        new Quaternion(-0.057529584482184794, 0.6659071249385952, 0.1336030649761142, 0.7317159849644514),
        new Quaternion(0.16260763782831245, 0.5431408702284528, 0.24540538850355176, 0.7863413895361335),
        new Quaternion(-0.08732657025438224, 0.8390525018106985, 0.4982098570959706, -0.20037937782286291),
        new Quaternion(0.1455562936558551, 0.283487161066997, 0.947045322245058, -0.039415189994217024),
        new Quaternion(-0.530768670205269, 0.21880288678927418, 0.5956484037843915, 0.5617944577520124),
        new Quaternion(-0.2506332624448391, -0.045196757440106226, 0.14434843576730508, 0.9561923262089534),
        new Quaternion(0.47567755685614743, 0.12768734062683035, 0.058113204314841634, 0.8683602934097603),
        new Quaternion(0.6591492876863129, 0.005950878509300445, -0.011788488465533323, 0.7518961575219493)
      ]
    }, {
      yPosition: -0.7799367220077866,
      boneQuaternions: [
        new Quaternion(-0.33618637861871536, -0.39717930854065603, -0.580626674080078, 0.6261788644254807),
        new Quaternion(-0.00465349402025497, 0.023252006528141904, -0.08427983435203394, 0.9961599215799362),
        new Quaternion(0.5798931952988484, 0.07798076567496962, -0.3446952661505179, 0.734049732633943),
        new Quaternion(0.39321791571670056, 0.5836870487553489, -0.3772116787697961, 0.6020074031684309),
        new Quaternion(-0.19289202375600054, 0.3786820500172987, 0.041246191659492504, 0.9042628716487913),
        new Quaternion(0.010484761360787711, 0.01629248556483858, 0.17083851040863537, 0.9851085336671815),
        new Quaternion(-0.06399217396961955, 0.0033549617139338422, 0.9978779315731008, 0.011548652055660497),
        new Quaternion(0.09471860453035867, 0.0596353878039145, 0.9937160837035783, -0.0005949491660452698),
        new Quaternion(-0.36924315947249725, 0.024485484142362297, 0.25306179992868855, 0.8938790071520567),
        new Quaternion(-0.15992249199973868, -0.15117101798310234, -0.23906643804397573, 0.9457374437321976),
        new Quaternion(0.5885147776018878, 0.044569485876346196, 0.05586639941785555, 0.8053216056101709),
        new Quaternion(0.48906004703389894, -0.06343774390366104, -0.07945611980180428, 0.8663035690511073),
      ]
    }, {
      yPosition: -0.8359964978272364,
      boneQuaternions: [
        new Quaternion(-0.10168513926647874, -0.15356548326183236, -0.7365470689833454, 0.6508273084926294),
        new Quaternion(-0.018085653135299237, 0.022726343176885773, -0.07899639718814698, 0.9964516688549425),
        new Quaternion(0.6059306954106667, 0.05073544377075022, -0.21384489899803194, 0.76455563679994),
        new Quaternion(0.5320021461128076, 0.1664165546640841, 0.12498867172358287, 0.8207657560900942),
        new Quaternion(-0.21928019631954906, 0.6583398529488794, 0.07481318641572585, 0.7161758516985026),
        new Quaternion(-0.013510077400749424, -0.6668944730943813, -0.04743809681721289, 0.743517910483951),
        new Quaternion(-0.03298876866049806, 0.33214315545804973, 0.9425444943577713, 0.014231404974564899),
        new Quaternion(0.11474072648449414, 0.09296400178013128, 0.987057369056283, 0.0625300376625045),
        new Quaternion(-0.703107899774981, -0.017528597381195797, 0.15906739743156073, 0.6928417012739386),
        new Quaternion(-0.26686584819363296, -0.08480925544737432, -0.3262011386337652, 0.9028746046609131),
        new Quaternion(0.5219776226755037, 0.0869611597140883, -0.06553388959258952, 0.8459801253285023),
        new Quaternion(0.5825639066430548, -0.053062498106786274, -0.04841255288427203, 0.8096048465076823),
      ]
    }, {
      yPosition: -0.8123184000307988,
      boneQuaternions: [
        new Quaternion(0.9633816981480587, 0.009209589991249406, 0.2677989223056401, -0.009728086181888149),
        new Quaternion(-0.019769293536963117, -0.005786058484039905, 0.030386812872331574, 0.9993259423139321),
        new Quaternion(0.6617394095250566, -0.1952558239585479, -0.2030884329282301, 0.6947847684864992),
        new Quaternion(0.6713545105277406, 0.004068198480392424, 0.30620745623969253, 0.674907621270025),
        new Quaternion(-0.21657515239038563, 0.6308600679235451, 0.037931228594156076, 0.7440912913692401),
        new Quaternion(0.011788670438856445, -0.006341165178944681, 0.225634183982705, 0.9741201376850532),
        new Quaternion(-0.09866550335737452, 0.033247150647070726, 0.9927697913541749, 0.05973195443513855),
        new Quaternion(0.0691041772620136, 0.19085067876369297, 0.9788485663026699, -0.025614857309853856),
        new Quaternion(-0.13884424723084302, 0.015065640889538011, 0.3489746176854078, 0.9266671557448033),
        new Quaternion(-0.00810127838805377, -0.04821279879686217, 0.21376866167650335, 0.9756602124415679),
        new Quaternion(0.5959807603068787, 0.06259320552890378, 0.10828332202031898, 0.7931985146395957),
        new Quaternion(0.5204240310574373, -0.05559317555160875, -0.011195584560346009, 0.8520228252907305),
      ]
    }, {
      yPosition: -0.7822460811595346,
      boneQuaternions: [
        new Quaternion(-0.2963759741923643, -0.3939905541804718, -0.5006788009649076, 0.7115149039616199),
        new Quaternion(-0.004769373876243056, 0.02433156061314103, -0.08418945477331038, 0.9961412007118651),
        new Quaternion(0.6109271653019935, 0.14041627474048335, -0.2900636218462668, 0.7231251973536823),
        new Quaternion(0.40580657214648036, 0.6167928400586606, -0.34897722312165186, 0.5771380824363902),
        new Quaternion(-0.11576358352180545, 0.35093232925959755, -0.004568402699804152, 0.9292063469746166),
        new Quaternion(0.026313375624889307, 0.6296982127471528, 0.26866014711925656, 0.728429465785534),
        new Quaternion(-0.03019034945633144, 0.3686115027026147, 0.9280291440380882, 0.044452317470464096),
        new Quaternion(0.10047812030396898, -0.04669388891258591, 0.9915056363694369, 0.06812052664506325),
        new Quaternion(-0.6806185901056306, -0.048771161865572114, 0.24995670559473077, 0.6869513031640261),
        new Quaternion(-0.2815479239676969, -0.06567516223520022, 0.3364338933086944, 0.8962308487781299),
        new Quaternion(0.5082065211966215, 0.08766182214691508, -0.07612307151728685, 0.8533736837630335),
        new Quaternion(0.5720773150425791, -0.04710078884707806, -0.03628227399431602, 0.8180419561205253),
      ]
    }, {
      yPosition: -0.7267900423388889,
      boneQuaternions: [
        new Quaternion(-0.47259463230088455, -0.5756509652393007, -0.4262404957231287, 0.5134192369440825),
        new Quaternion(-0.019651524338612076, 0.02489893929576197, -0.08190653718291864, 0.9961351647836717),
        new Quaternion(0.6366245025275773, 0.131224521810911, -0.32986253023418033, 0.6846002213043416),
        new Quaternion(0.49183564942994995, 0.5321127093337674, -0.3158367204515642, 0.6125484700694127),
        new Quaternion(0.1327343521180576, -0.2856728515369817, -0.2312604146644692, 0.9204842373204419),
        new Quaternion(0.06759437245626126, -0.6921988892388252, 0.013771129313478606, 0.718402408562743),
        new Quaternion(-0.04273946689702587, 0.3834999538216849, 0.9193987644788462, -0.07620380647035589),
        new Quaternion(0.10515918851150069, -0.2734194126957442, 0.924009381955167, 0.2457438750671569),
        new Quaternion(-0.3797058129603686, 0.19218514063284003, -0.19252405824629992, 0.8842075937568016),
        new Quaternion(-0.367723397714218, -0.04839236799997192, 0.18469943210152154, 0.910122964929821),
        new Quaternion(0.4431077756059932, 0.020739252402562844, -0.017378704461473157, 0.8960599039831324),
        new Quaternion(0.5307912859573665, -0.07380828094694261, 0.03793212848296646, 0.843430237754716),
      ]
    }, {
      yPosition: -0.7754654175644856,
      boneQuaternions: [
        new Quaternion(0.9954636394661146, -0.08439503057804833, -0.04187100065976029, -0.01328321167316838),
        new Quaternion(-0.003457583293857478, 0.019914785920754054, -0.06963132174334337, 0.9973679713780721),
        new Quaternion(0.5998512031628681, 0.12272228891012318, -0.23634639026666718, 0.7544896260296314),
        new Quaternion(0.5115322635306974, 0.07093111261657477, 0.3069361672759572, 0.7994372789715009),
        new Quaternion(0.005944223560036993, -0.011098612541657987, -0.08174783984964948, 0.9965735233734324),
        new Quaternion(-0.07919982128389584, -0.6590856329255975, -0.13908788338533712, 0.7348387818672453),
        new Quaternion(-0.03831862451871503, 0.2418233737879415, 0.9669565781747949, 0.0710499969136382),
        new Quaternion(0.11259912889266131, 0.14724483557228182, 0.9822189622039968, 0.029770889871004312),
        new Quaternion(-0.5774837074464967, -0.0424375035040981, 0.6443775976426521, 0.4994902283893785),
        new Quaternion(-0.2704340067056286, -0.06907936599794393, 0.16094125513287783, 0.9466738317208958),
        new Quaternion(0.5023840306300641, 0.0510979698371447, 0.030101448604642086, 0.8626083625570409),
        new Quaternion(0.6312680088955108, 0.02245249546466305, 0.056912124206516375, 0.7731480080758983),
      ]
    }, {
      yPosition: -0.7160732593718286,
      boneQuaternions: [
        new Quaternion(-0.5054796563963007, 0.47694375259079863, 0.5190153025980981, 0.49763246326578625),
        new Quaternion(0.010456688500008656, -0.027576109469146404, 0.08252424107158066, 0.9961525993166588),
        new Quaternion(0.47964793816330165, -0.2281755513284453, 0.12443353619866386, 0.8380886190740907),
        new Quaternion(0.6029920690923817, 0.5178935979226854, -0.09740745745268078, 0.5989258999266943),
        new Quaternion(0.13386397541526948, -0.6828964275071336, -0.17634216446612927, 0.6961583118242032),
        new Quaternion(-0.004622337897851424, -0.028799364583744342, 0.1090347963590769, 0.9936099106634717),
        new Quaternion(-0.023836281525142198, -0.19630637039665458, 0.9799164588144128, 0.02567836747972066),
        new Quaternion(0.04167797613605356, -0.44403638477852375, 0.8925437336312417, -0.06678554966894674),
        new Quaternion(-0.41088826579637766, 0.11609830331539832, 0.20741422929528688, 0.8801541518665987),
        new Quaternion(-0.5476853389320572, -0.03553714960915489, 0.0009696027562048569, 0.8359287921059806),
        new Quaternion(0.5720629140272188, 0.09225705691129156, -0.14299252560852418, 0.8023626204577293),
        new Quaternion(0.45708662037036574, -0.03301185422083337, 0.12387680934617151, 0.8801344703215731),
      ]
    }
  ];

  constructor(mesh, skeleton, ragdoll, crowdAgentIndex, agentEnum, scene) {
    this.mesh = mesh;
    this.skeleton = skeleton;
    this.ragdoll = ragdoll;
    this.crowdAgentIndex = crowdAgentIndex;
    this.agentEnum = agentEnum;
    this.scene = scene;

    this.destination = null;
    this.onArrival = NOOP;
    this.onArrivalDistanceOffset = 0;
    this.isMoving = false;
    this.freezeObservable = null;
    this.onFreeze = NOOP;
    this.rotationAnimation = null;

    this.walk = this.walk.bind(this);
  }

  get isRagdoll() {
    return this.ragdoll.ragdollMode;
  }

  get isFrozen() {
    return this.ragdoll.frozen;
  }

  moveTo(targetPosition, onArrival = NOOP, onArrivalDistanceOffset = 0) {
    if (!AgentPool.navigationPlugin || !AgentPool.crowd || this.crowdAgentIndex === null) {
      return;
    }
    this.isMoving = true;

    this.destination = AgentPool.navigationPlugin.getClosestPoint(targetPosition);
    AgentPool.crowd.agentGoto(this.crowdAgentIndex, this.destination);

    this.skeleton.beginAnimation(AgentPool.agentAnimationNames[this.agentEnum].walk, true);

    this.mesh.onBeforeRenderObservable.clear();
    this.mesh.onBeforeRenderObservable.add(this.walk);

    this.onArrival = onArrival;
    this.onArrivalDistanceOffset = onArrivalDistanceOffset;
  }

  stopWalking() {
    if (this.crowdAgentIndex !== null) {
      AgentPool.crowd.removeAgent(this.crowdAgentIndex);
      this.mesh.onBeforeRenderObservable.clear();
      this.crowdAgentIndex = null;
      this.onArrival = NOOP;
      this.onArrivalDistanceOffset = 0;
      this.isMoving = false;
    }
  }

  fall(freezeOnStop = false, onFreeze = NOOP) {
    if (this.ragdoll.ragdollMode) {
      return;
    }

    this.stopWalking();
    this.stopRotation();

    this.ragdoll.init();

    if (freezeOnStop) {
      this.onFreeze = onFreeze;
      const impostor = this.ragdoll.impostors[0];
      let consecutiveFramesBelowThreshold = 0;
      this.freezeObservable = this.scene.onBeforeRenderObservable.add(() => {
        const velocity = impostor.getLinearVelocity();
        const speedSquared = velocity.lengthSquared();

        if (speedSquared < this.constructor.freezeVelocityThreshold) {
          consecutiveFramesBelowThreshold++;
        } else {
          consecutiveFramesBelowThreshold = 0;
        }

        if (consecutiveFramesBelowThreshold >= this.constructor.consecutiveFramesBeforeFreeze) {
          this.scene.onBeforeRenderObservable.remove(this.freezeObservable);
          this.freeze();
        }
      });
    }

    this.ragdoll.ragdoll();
    this.scene.stopAnimation(this.skeleton);
  }

  freeze() {
    this.ragdoll.freeze();
    this.onFreeze();
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
      this.onArrival = NOOP;
      this.onArrivalDistanceOffset = 0;
    }

    if (distance <= this.constructor.arrivalDistanceThreshold) {
      this.skeleton.beginAnimation(AgentPool.agentAnimationNames[this.agentEnum].idle, true);
      this.mesh.onBeforeRenderObservable.clear();
      this.destination = null;
      AgentPool.crowd.agentTeleport(this.crowdAgentIndex, AgentPool.navigationPlugin.getClosestPoint(this.mesh.position));

      if (this.onArrival) {
        this.onArrival(this);
      }
      this.onArrival = NOOP;
      this.onArrivalDistanceOffset = 0;
      this.isMoving = false;
    }
  }

  rotateTo(targetAngleRadians, speed, easingMode = EasingFunction.EASINGMODE_EASEINOUT) {
    if (speed === null || speed === undefined) {
      this.mesh.rotation.y = targetAngleRadians;
      return;
    }
    const targetAngleDegrees = Angle.FromRadians(targetAngleRadians).degrees();
    const obs = this.scene.onBeforeRenderObservable.add(() => {
      const currentAngleDegrees = Angle.FromRadians(this.mesh.rotation.y).degrees();
      const rotationDirection = (currentAngleDegrees - targetAngleDegrees + 360) % 360 > 180 ? 1 : -1;
      if (Scalar.WithinEpsilon(currentAngleDegrees, targetAngleDegrees, 2)) {
        this.scene.onBeforeRenderObservable.remove(obs);
        return;
      }
      const deltaTime = this.scene.getEngine().getDeltaTime() * 0.001;
      this.mesh.rotation.y += speed * rotationDirection * deltaTime;
    })
  }

  stopRotation() {
    if (this.rotationAnimation) {
      this.rotationAnimation.stop();
      this.rotationAnimation = null;
    }
  }

  setPose(pose) {
    this.ragdoll.initBones();
    this.stopWalking();
    this.scene.stopAnimation(this.skeleton);
    this.ragdoll.setPose(pose.yPosition, pose.boneQuaternions);
  }

  setRandomRagdollPose() {
    this.stopRotation();
    this.setPose(randomItem(this.constructor.ragdollPoses))
    this.mesh.rotation.y = Angle.FromDegrees(Math.random() * 360).radians()
  }
}
