/**
 * Creates a Mesh Phong Material, which can be extended with GL nodes.
 *
 * @remarks
 * This node can create children, which will be GL nodes. The GLSL code generated by the nodes will extend the Material.
 *
 */
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {UniformsTransparencyParamConfig, UniformsTransparencyController} from './utils/UniformsTransparencyController';
import {AdvancedCommonController, AdvancedCommonParamConfig} from './utils/AdvancedCommonController';
import {MapParamConfig, TextureMapController} from './utils/TextureMapController';
import {AlphaMapParamConfig, TextureAlphaMapController} from './utils/TextureAlphaMapController';
import {BaseBuilderParamConfig, TypedBuilderMatNode} from './_BaseBuilder';
import {ShaderAssemblerPhong} from '../gl/code/assemblers/materials/Phong';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {Poly} from '../../Poly';
import {FogParamConfig, FogController} from './utils/UniformsFogController';
import {
	WireframeShaderMaterialController,
	WireframeShaderMaterialParamsConfig,
} from './utils/WireframeShaderMaterialController';
import {TextureAOMapController, AOMapParamConfig} from './utils/TextureAOMapController';
import {TextureEnvMapSimpleController, EnvMapSimpleParamConfig} from './utils/TextureEnvMapSimpleController';
import {TextureLightMapController, LightMapParamConfig} from './utils/TextureLightMapController';
import {TextureEmissiveMapController, EmissiveMapParamConfig} from './utils/TextureEmissiveMapController';

import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';
import {TextureBumpMapController, BumpMapParamConfig} from './utils/TextureBumpMapController';
import {TextureDisplacementMapController, DisplacementMapParamConfig} from './utils/TextureDisplacementMapController';
import {TextureNormalMapController, NormalMapParamConfig} from './utils/TextureNormalMapController';
import {TextureSpecularMapController, SpecularMapParamConfig} from './utils/TextureSpecularMapController';
import {PCSSController, PCSSParamConfig} from './utils/PCSSController';
import {CustomMaterialName, IUniforms} from '../../../core/geometry/Material';
import {Material} from 'three';
import {MeshPhongMaterial} from 'three';
// import {
// 	CustomMaterialMeshParamConfig,
// 	materialMeshAssemblerCustomMaterialRequested,
// } from './utils/customMaterials/CustomMaterialMesh';
interface MeshPhongBuilderMaterial extends MeshPhongMaterial {
	vertexShader: string;
	fragmentShader: string;
	uniforms: IUniforms;
	customMaterials: {
		[key in CustomMaterialName]?: Material;
	};
}
interface MeshPhongBuilderControllers {
	advancedCommon: AdvancedCommonController;
	alphaMap: TextureAlphaMapController;
	aoMap: TextureAOMapController;
	bumpMap: TextureBumpMapController;
	displacementMap: TextureDisplacementMapController;
	emissiveMap: TextureEmissiveMapController;
	envMap: TextureEnvMapSimpleController;
	lightMap: TextureLightMapController;
	map: TextureMapController;
	normalMap: TextureNormalMapController;
	specularMap: TextureSpecularMapController;
	PCSS: PCSSController;
}
class MeshPhongBuilderMatParamsConfig extends PCSSParamConfig(
	FogParamConfig(
		WireframeShaderMaterialParamsConfig(
			AdvancedCommonParamConfig(
				BaseBuilderParamConfig(
					/* advanced */
					AdvancedFolderParamConfig(
						SpecularMapParamConfig(
							NormalMapParamConfig(
								LightMapParamConfig(
									EnvMapSimpleParamConfig(
										EmissiveMapParamConfig(
											DisplacementMapParamConfig(
												BumpMapParamConfig(
													AOMapParamConfig(
														AlphaMapParamConfig(
															MapParamConfig(
																/* textures */
																TexturesFolderParamConfig(
																	UniformsTransparencyParamConfig(
																		DefaultFolderParamConfig(NodeParamsConfig)
																	)
																)
															)
														)
													)
												)
											)
										)
									)
								)
							)
						)
					)
				)
			)
		)
	)
) {}
const ParamsConfig = new MeshPhongBuilderMatParamsConfig();

export class MeshPhongBuilderMatNode extends TypedBuilderMatNode<
	MeshPhongBuilderMaterial,
	ShaderAssemblerPhong,
	MeshPhongBuilderMatParamsConfig
> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'meshPhongBuilder';
	}
	public override usedAssembler(): Readonly<AssemblerName.GL_MESH_PHONG> {
		return AssemblerName.GL_MESH_PHONG;
	}
	protected _createAssemblerController() {
		return Poly.assemblersRegister.assembler(this, this.usedAssembler());
	}
	// public override customMaterialRequested(customName: CustomMaterialName): boolean {
	// 	return materialMeshAssemblerCustomMaterialRequested(this, customName);
	// }
	readonly controllers: MeshPhongBuilderControllers = {
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this),
		aoMap: new TextureAOMapController(this),
		bumpMap: new TextureBumpMapController(this),
		displacementMap: new TextureDisplacementMapController(this),
		emissiveMap: new TextureEmissiveMapController(this),
		envMap: new TextureEnvMapSimpleController(this),
		lightMap: new TextureLightMapController(this),
		map: new TextureMapController(this),
		normalMap: new TextureNormalMapController(this),
		specularMap: new TextureSpecularMapController(this),
		PCSS: new PCSSController(this),
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof MeshPhongBuilderControllers>;
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
		FogController.update(this);
		WireframeShaderMaterialController.update(this);

		this.compileIfRequired();

		this.setMaterial(this.material);
	}
}
