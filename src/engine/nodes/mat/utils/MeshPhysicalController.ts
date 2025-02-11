import {Constructor} from '../../../../types/GlobalTypes';
import {MeshPhysicalMaterial} from 'three';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {Color} from 'three';
import {isBooleanTrue} from '../../../../core/BooleanValue';

export function MeshPhysicalParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param Represents the thickness of the clear coat layer, from 0.0 to 1.0 */
		clearcoat = ParamConfig.FLOAT(0, {separatorBefore: true});
		/** @param toggle if you want to use a roughness map */
		useClearCoatMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(MeshPhysicalController));
		/** @param specify the roughness map COP node */
		clearcoatMap = ParamConfig.NODE_PATH('', NodePathOptions(MeshPhysicalController, 'useClearCoatMap'));
		/** @param toggle if you want to use a clear coat normal map */
		useClearCoatNormalMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(MeshPhysicalController));
		/** @param specify the roughness map COP node */
		clearcoatNormalMap = ParamConfig.NODE_PATH(
			'',
			NodePathOptions(MeshPhysicalController, 'useClearCoatNormalMap')
		);
		/** @param How much the normal map affects the material. Typical ranges are 0-1 */
		clearcoatNormalScale = ParamConfig.VECTOR2([1, 1], {visibleIf: {useClearCoatNormalMap: 1}});
		/** @param clearcoatRoughness */
		clearcoatRoughness = ParamConfig.FLOAT(0);
		/** @param toggle if you want to use a clear cloat map */
		useClearCoatRoughnessMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(MeshPhysicalController));
		/** @param specify the roughness map COP node */
		clearcoatRoughnessMap = ParamConfig.NODE_PATH(
			'',
			NodePathOptions(MeshPhysicalController, 'useClearCoatRoughnessMap')
		);

		/** @param toggle if you want to use sheen */
		useSheen = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
		});
		/** @param The intensity of the sheen layer, from 0.0 to 1.0. Default is 0.0. */
		sheen = ParamConfig.FLOAT(0, {
			range: [0, 1],
			rangeLocked: [true, false],
			visibleIf: {useSheen: 1},
		});
		/** @param If a color is assigned to this property, the material will use a special sheen BRDF intended for rendering cloth materials such as velvet. The sheen color provides the ability to create two-tone specular materials. null by default */
		sheenRoughness = ParamConfig.FLOAT(1, {
			range: [0, 1],
			rangeLocked: [true, false],
			visibleIf: {useSheen: 1},
		});
		/** @param If a color is assigned to this property, the material will use a special sheen BRDF intended for rendering cloth materials such as velvet. The sheen color provides the ability to create two-tone specular materials. null by default */
		sheenColor = ParamConfig.COLOR([1, 1, 1], {
			visibleIf: {useSheen: 1},
		});

		/** @param toggle if you want to use iridescence */
		// useIridescence = ParamConfig.BOOLEAN(0, {
		// 	separatorBefore: true,
		// });
		// /** @param iridescence index of refraction */
		// iridescenceIOR = ParamConfig.FLOAT(1.3, {
		// 	range: [0, 2],
		// 	rangeLocked: [true, false],
		// 	visibleIf: {useIridescence: 1},
		// });
		// /** @param toggle if you want to use an iridescence map */
		// useIridescenceMap = ParamConfig.BOOLEAN(0, {
		// 	...BooleanParamOptions(MeshPhysicalController),
		// 	visibleIf: {useIridescence: 1},
		// });
		// /** @param specify the iridescence map COP node */
		// iridescenceMap = ParamConfig.NODE_PATH('', {
		// 	...NodePathOptions(MeshPhysicalController, 'useIridescenceMap'),
		// 	visibleIf: {useIridescence: 1, useIridescenceMap: 1},
		// });

		/** @param Degree of transmission (or optical transparency), from 0.0 to 1.0. Default is 0.0.
Thin, transparent or semitransparent, plastic or glass materials remain largely reflective even if they are fully transmissive. The transmission property can be used to model these materials.
When transmission is non-zero, opacity should be set to 1.  */
		transmission = ParamConfig.FLOAT(0, {
			separatorBefore: true,
			range: [0, 1],
		});
		/** @param toggle if you want to use a transmission map */
		useTransmissionMap = ParamConfig.BOOLEAN(0);
		/** @param specify the roughness map COP node */
		transmissionMap = ParamConfig.NODE_PATH('', {visibleIf: {useTransmissionMap: 1}});
		/** @param Index-of-refraction for non-metallic materials */
		ior = ParamConfig.FLOAT(1.5, {
			range: [1, 2.3333],
			rangeLocked: [true, true],
		});

		/** @param thickness  */
		thickness = ParamConfig.FLOAT(0.01, {
			range: [0, 10],
			rangeLocked: [true, false],
		});
		/** @param toggle if you want to use a thickness map */
		useThicknessMap = ParamConfig.BOOLEAN(0);
		/** @param specify the roughness map COP node */
		thicknessMap = ParamConfig.NODE_PATH('', {visibleIf: {useThicknessMap: 1}});
		/** @param attenuation distance */
		attenuationDistance = ParamConfig.FLOAT(0, {
			range: [0, 10],
			rangeLocked: [true, false],
		});
		/** @param attenuation color */
		attenuationColor = ParamConfig.COLOR([1, 1, 1]);
	};
}

type MeshPhysicalControllerCurrentMaterial = MeshPhysicalMaterial;
class TextureClearCoatMapParamsConfig extends MeshPhysicalParamConfig(NodeParamsConfig) {}
interface MeshPhysicalControllers {
	physical: MeshPhysicalController;
}
abstract class TextureClearCoatMapMatNode extends TypedMatNode<
	MeshPhysicalControllerCurrentMaterial,
	TextureClearCoatMapParamsConfig
> {
	controllers!: MeshPhysicalControllers;
	abstract override createMaterial(): MeshPhysicalControllerCurrentMaterial;
}

const tmpMeshPhysicalForIOR = new MeshPhysicalMaterial();

export class MeshPhysicalController extends BaseTextureMapController {
	constructor(protected override node: TextureClearCoatMapMatNode) {
		super(node);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useClearCoatMap, this.node.p.clearcoatMap);
		this.add_hooks(this.node.p.useClearCoatNormalMap, this.node.p.clearcoatNormalMap);
		this.add_hooks(this.node.p.useClearCoatRoughnessMap, this.node.p.clearcoatRoughnessMap);
		this.add_hooks(this.node.p.useTransmissionMap, this.node.p.transmissionMap);
		this.add_hooks(this.node.p.useThicknessMap, this.node.p.thicknessMap);
		// this.add_hooks(this.node.p.useIridescenceMap, this.node.p.iridescenceMap);
	}
	private _sheenColorClone = new Color();
	override async update() {
		this._update(this.node.material, 'clearcoatMap', this.node.p.useClearCoatMap, this.node.p.clearcoatMap);
		this._update(
			this.node.material,
			'clearcoatNormalMap',
			this.node.p.useClearCoatNormalMap,
			this.node.p.clearcoatNormalMap
		);
		this._update(
			this.node.material,
			'clearcoatRoughnessMap',
			this.node.p.useClearCoatRoughnessMap,
			this.node.p.clearcoatRoughnessMap
		);
		this._update(
			this.node.material,
			'transmissionMap',
			this.node.p.useTransmissionMap,
			this.node.p.transmissionMap
		);
		this._update(this.node.material, 'thicknessMap', this.node.p.useThicknessMap, this.node.p.thicknessMap);
		// this._update(this.node.material, 'iridescenceMap', this.node.p.useIridescenceMap, this.node.p.iridescenceMap);
		const pv = this.node.pv;

		// this is to get the reflectivity value
		tmpMeshPhysicalForIOR.ior = pv.ior;
		const reflectivity = tmpMeshPhysicalForIOR.reflectivity;

		const mat = this.node.material as MeshPhysicalMaterial;
		mat.clearcoat = pv.clearcoat;
		if (mat.clearcoatNormalScale != null) {
			mat.clearcoatNormalScale.copy(pv.clearcoatNormalScale);
		}
		mat.clearcoatRoughness = pv.clearcoatRoughness;
		mat.reflectivity = reflectivity;
		// ior is currently a getter/setter wrapper to set reflectivity, so currently conflicts with 'mat.reflectivity ='
		// mat.ior = this.node.pv.ior;
		if (isBooleanTrue(pv.useSheen)) {
			this._sheenColorClone.copy(pv.sheenColor);
			mat.sheen = pv.sheen;
			mat.sheenRoughness = pv.sheenRoughness;
			mat.sheenColor = this._sheenColorClone;
		} else {
			mat.sheen = 0;
		}
		// if (isBooleanTrue(pv.useIridescence)) {
		// 	(mat as any).iridescence = 1;
		// 	mat.iridescenceIOR = pv.iridescenceIOR;
		// } else {
		// 	(mat as any).iridescence = 0;
		// }

		mat.transmission = pv.transmission;
		mat.thickness = pv.thickness;
		mat.attenuationDistance = pv.attenuationDistance;
		mat.attenuationColor = pv.attenuationColor;
		// }
	}
	static override async update(node: TextureClearCoatMapMatNode) {
		node.controllers.physical.update();
	}
}
