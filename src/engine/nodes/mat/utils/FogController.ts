import type {ShaderMaterial} from 'three';
import {Constructor} from '../../../../types/GlobalTypes';
import {BaseController} from './_BaseController';
import {TypedMatNode} from '../_Base';
import {
	MeshPhysicalMaterial,
	MeshToonMaterial,
	MeshStandardMaterial,
	MeshPhongMaterial,
	MeshMatcapMaterial,
	MeshLambertMaterial,
	MeshBasicMaterial,
} from 'three';

import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../../core/BooleanValue';

export function FogParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on if you have a fog in the scene and the material should be affected by it */
		useFog = ParamConfig.BOOLEAN(0);
	};
}
type FoggableMaterial =
	| ShaderMaterial
	| MeshToonMaterial
	| MeshStandardMaterial
	| MeshPhysicalMaterial
	| MeshPhongMaterial
	| MeshMatcapMaterial
	| MeshLambertMaterial
	| MeshBasicMaterial;
class FogParamsConfig extends FogParamConfig(NodeParamsConfig) {}
abstract class FogMatNode extends TypedMatNode<FoggableMaterial, FogParamsConfig> {
	// override createMaterial() {
	// 	return new Material();
	// }
}

export class FogController extends BaseController {
	constructor(protected override node: FogMatNode) {
		super(node);
	}
	static update(node: FogMatNode) {
		const material = node.material;
		const pv = node.pv;
		material.fog = isBooleanTrue(pv.useFog);
	}
}
