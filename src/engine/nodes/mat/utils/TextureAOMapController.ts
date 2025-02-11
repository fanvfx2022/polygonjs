import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshBasicMaterial} from 'three';
import {MeshLambertMaterial} from 'three';
import {MeshPhysicalMaterial} from 'three';
import {MeshStandardMaterial} from 'three';
import {MeshToonMaterial} from 'three';
export function AOMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use an ambient occlusion map */
		useAOMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			...BooleanParamOptions(TextureAOMapController),
		});
		/** @param specify the AO map COP node */
		aoMap = ParamConfig.NODE_PATH('', NodePathOptions(TextureAOMapController, 'useAOMap'));
		/** @param ambient occlusion intensity */
		aoMapIntensity = ParamConfig.FLOAT(1, {range: [0, 1], rangeLocked: [false, false], visibleIf: {useAOMap: 1}});
	};
}

type TextureAOMapControllerCurrentMaterial =
	| MeshBasicMaterial
	| MeshLambertMaterial
	| MeshStandardMaterial
	| MeshPhysicalMaterial
	| MeshToonMaterial;
class TextureAOMapParamsConfig extends AOMapParamConfig(NodeParamsConfig) {}
interface TextureAOControllers {
	aoMap: TextureAOMapController;
}
abstract class TextureAOMapMatNode extends TypedMatNode<
	TextureAOMapControllerCurrentMaterial,
	TextureAOMapParamsConfig
> {
	controllers!: TextureAOControllers;
	abstract override createMaterial(): TextureAOMapControllerCurrentMaterial;
}

export class TextureAOMapController extends BaseTextureMapController {
	constructor(protected override node: TextureAOMapMatNode) {
		super(node);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useAOMap, this.node.p.aoMap);
	}
	override async update() {
		this._update(this.node.material, 'aoMap', this.node.p.useAOMap, this.node.p.aoMap);

		const mat = this.node.material as MeshBasicMaterial;
		mat.aoMapIntensity = this.node.pv.aoMapIntensity;
	}
	static override async update(node: TextureAOMapMatNode) {
		node.controllers.aoMap.update();
	}
}
