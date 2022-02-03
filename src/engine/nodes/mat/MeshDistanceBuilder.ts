/**
 * Creates a Mesh Depth Material, which can be extended with GL nodes.
 *
 * @remarks
 * This node can create children, which will be GL nodes. The GLSL code generated by the nodes will extend the Material.
 *
 */
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {UniformsTransparencyParamConfig, UniformsTransparencyController} from './utils/UniformsTransparencyController';
import {AdvancedCommonController, AdvancedCommonParamConfig} from './utils/AdvancedCommonController';
import {BaseBuilderParamConfig, TypedBuilderMatNode} from './_BaseBuilder';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {Poly} from '../../Poly';
import {Material} from 'three/src/materials/Material';
import {MeshDistanceMaterial} from 'three/src/materials/MeshDistanceMaterial';
import {CustomMaterialName, IUniforms} from '../../../core/geometry/Material';
import {ShaderAssemblerCustomMeshDistance} from '../gl/code/assemblers/materials/custom/mesh/CustomMeshDistance';
interface Controllers {
	advancedCommon: AdvancedCommonController;
}
interface MeshDistanceBuilderMaterial extends MeshDistanceMaterial {
	vertexShader: string;
	fragmentShader: string;
	uniforms: IUniforms;
	customMaterials: {
		[key in CustomMaterialName]?: Material;
	};
}

class MeshDistanceMatParamsConfig extends AdvancedCommonParamConfig(
	BaseBuilderParamConfig(UniformsTransparencyParamConfig(NodeParamsConfig))
) {}
const ParamsConfig = new MeshDistanceMatParamsConfig();

export class MeshDistanceBuilderMatNode extends TypedBuilderMatNode<
	MeshDistanceBuilderMaterial,
	ShaderAssemblerCustomMeshDistance,
	MeshDistanceMatParamsConfig
> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'meshDistanceBuilder';
	}
	public override usedAssembler(): Readonly<AssemblerName.GL_MESH_DISTANCE> {
		return AssemblerName.GL_MESH_DISTANCE;
	}
	protected _createAssemblerController() {
		return Poly.assemblersRegister.assembler(this, this.usedAssembler());
	}

	readonly controllers: Controllers = {
		advancedCommon: new AdvancedCommonController(this),
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof Controllers>;
	override initializeNode() {
		this.params.onParamsCreated('init controllers', () => {
			for (let controllerName of this.controllerNames) {
				this.controllers[controllerName].initializeNode();
			}
		});
	}

	override async cook() {
		for (let controllerName of this.controllerNames) {
			this.controllers[controllerName].update();
		}
		UniformsTransparencyController.update(this);

		this.compileIfRequired();

		this.setMaterial(this.material);
	}
}
