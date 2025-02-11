import {Constructor} from '../../../../types/GlobalTypes';
import {BaseController} from './_BaseController';
import {TypedMatNode} from '../_Base';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../../core/BooleanValue';
import {MeshBasicMaterial} from 'three';
import {MeshStandardMaterial} from 'three';
import {MeshPhysicalMaterial} from 'three';
import {MeshToonMaterial} from 'three';

enum LineCapType {
	ROUND = 'round',
	BUTT = 'butt',
	SQUARE = 'square',
}
const LINE_CAP_TYPES: LineCapType[] = [LineCapType.ROUND, LineCapType.BUTT, LineCapType.SQUARE];

enum LineJoinType {
	ROUND = 'round',
	BEVEL = 'bevel',
	MITER = 'miter',
}
const LINE_JOIN_TYPES: LineJoinType[] = [LineJoinType.ROUND, LineJoinType.BEVEL, LineJoinType.MITER];

export function WireframeParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on to set material to wireframe */
		wireframe = ParamConfig.BOOLEAN(0, {separatorBefore: true});
		/** @param wireframe line width */
		wireframeLinewidth = ParamConfig.FLOAT(1, {
			range: [0, 5],
			rangeLocked: [true, false],
			visibleIf: {wireframe: 1},
		});
		/** @param define appearance of line ends */
		wireframeLinecap = ParamConfig.INTEGER(0, {
			menu: {
				entries: LINE_CAP_TYPES.map((name, value) => {
					return {name, value};
				}),
			},
			visibleIf: {wireframe: 1},
		});
		/** @param Define appearance of line joints */
		wireframeLinejoin = ParamConfig.INTEGER(0, {
			menu: {
				entries: LINE_JOIN_TYPES.map((name, value) => {
					return {name, value};
				}),
			},
			visibleIf: {wireframe: 1},
			separatorAfter: true,
		});
	};
}
type WireframedMaterial = MeshToonMaterial | MeshBasicMaterial | MeshStandardMaterial | MeshPhysicalMaterial;
// class WireframedMaterial extends Material {
// 	wireframe!: boolean;
// 	wireframeLinecap!: string;
// 	wireframeLinejoin!: string;
// }
class WireframeParamsConfig extends WireframeParamConfig(NodeParamsConfig) {}
class WireframedMatNode extends TypedMatNode<WireframedMaterial, WireframeParamsConfig> {
	createMaterial(): WireframedMaterial {
		return new MeshBasicMaterial();
	}
}

export class WireframeController extends BaseController {
	constructor(protected override node: WireframedMatNode) {
		super(node);
	}
	static update(node: WireframedMatNode) {
		const material = node.material;
		const pv = node.pv;

		material.wireframe = isBooleanTrue(pv.wireframe);
		material.wireframeLinewidth = pv.wireframeLinewidth;
		material.wireframeLinecap = LINE_CAP_TYPES[pv.wireframeLinecap];
		material.wireframeLinejoin = LINE_JOIN_TYPES[pv.wireframeLinejoin];
		material.needsUpdate = true;
	}
}
