import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshStandardMaterial} from 'three';
import {MeshPhysicalMaterial} from 'three';

export function MetalnessRoughnessMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a metalness map */
		useMetalnessMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			...BooleanParamOptions(TextureMetalnessRoughnessMapController),
		});
		/** @param specify the metalness map COP node */
		metalnessMap = ParamConfig.NODE_PATH(
			'',
			NodePathOptions(TextureMetalnessRoughnessMapController, 'useMetalnessMap')
		);
		/** @param metalness. It's recommended to either set this value to 0 or to 1, as objects are either metallic or not. Any value in between tends to look like an alien plastic */
		metalness = ParamConfig.FLOAT(0); // a default of 0 is good to non builder materials, but 1 should be better for builders, in case metalness is multiplied with this param from its child output node
		/** @param toggle if you want to use a roughness map */
		useRoughnessMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			...BooleanParamOptions(TextureMetalnessRoughnessMapController),
		});
		/** @param specify the roughness map COP node */
		roughnessMap = ParamConfig.NODE_PATH(
			'',
			NodePathOptions(TextureMetalnessRoughnessMapController, 'useRoughnessMap')
		);
		/** @param roughness. When set to 0, reflections from environment maps will be very sharp, or blurred when 1. Any value between 0 and 1 can help modulate this. */
		roughness = ParamConfig.FLOAT(1);
	};
}

type TextureMetalnessRoughnessCurrentMaterial = MeshStandardMaterial | MeshPhysicalMaterial;
class TextureMetalnessMapParamsConfig extends MetalnessRoughnessMapParamConfig(NodeParamsConfig) {}
interface MetalnessRoughnessControllers {
	metalnessRoughnessMap: TextureMetalnessRoughnessMapController;
}
abstract class TextureMetalnessMapMatNode extends TypedMatNode<
	TextureMetalnessRoughnessCurrentMaterial,
	TextureMetalnessMapParamsConfig
> {
	controllers!: MetalnessRoughnessControllers;
	abstract override createMaterial(): TextureMetalnessRoughnessCurrentMaterial;
}

export class TextureMetalnessRoughnessMapController extends BaseTextureMapController {
	constructor(protected override node: TextureMetalnessMapMatNode) {
		super(node);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useMetalnessMap, this.node.p.metalnessMap);
	}
	override async update() {
		this._update(this.node.material, 'metalnessMap', this.node.p.useMetalnessMap, this.node.p.metalnessMap);

		const mat = this.node.material as MeshStandardMaterial;
		mat.metalness = this.node.pv.metalness;

		this._update(this.node.material, 'roughnessMap', this.node.p.useRoughnessMap, this.node.p.roughnessMap);

		mat.roughness = this.node.pv.roughness;
	}
	static override async update(node: TextureMetalnessMapMatNode) {
		node.controllers.metalnessRoughnessMap.update();
	}
}
