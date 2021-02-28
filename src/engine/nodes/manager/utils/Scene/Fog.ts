import {Constructor} from '../../../../../types/GlobalTypes';
import {BaseNodeType, TypedNode} from '../../../_Base';

import {NodeParamsConfig, ParamConfig} from '../../../utils/params/ParamsConfig';
import {Scene} from 'three/src/scenes/Scene';
import {isBooleanTrue} from '../../../../../core/BooleanValue';
import {Fog} from 'three/src/scenes/Fog';
import {FogExp2} from 'three/src/scenes/FogExp2';
import {ParamsValueAccessorType} from '../../../utils/params/ParamsValueAccessor';

const CallbackOptions = {
	computeOnDirty: false,
	callback: (node: BaseNodeType) => {
		SceneFogController.update(node as SceneFogNode);
	},
};

export enum FogType {
	LINEAR = 'linear',
	EXPONENTIAL = 'exponential',
}
export const FOG_TYPES: FogType[] = [FogType.LINEAR, FogType.EXPONENTIAL];

export function SceneFogParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on to use fog */
		useFog = ParamConfig.BOOLEAN(0, CallbackOptions);
		/** @param fog type */
		fogType = ParamConfig.INTEGER(FOG_TYPES.indexOf(FogType.EXPONENTIAL), {
			visibleIf: {useFog: 1},
			menu: {
				entries: FOG_TYPES.map((mode, i) => {
					return {name: mode, value: i};
				}),
			},
			...CallbackOptions,
		});
		/** @param fog color */
		fogColor = ParamConfig.COLOR([1, 1, 1], {
			visibleIf: {useFog: 1},
			...CallbackOptions,
		});
		/** @param fog near */
		fogNear = ParamConfig.FLOAT(1, {
			range: [0, 100],
			rangeLocked: [true, false],
			visibleIf: {useFog: 1, fogType: FOG_TYPES.indexOf(FogType.LINEAR)},
			...CallbackOptions,
		});
		/** @param fog far */
		fogFar = ParamConfig.FLOAT(100, {
			range: [0, 100],
			rangeLocked: [true, false],
			visibleIf: {useFog: 1, fogType: FOG_TYPES.indexOf(FogType.LINEAR)},
			...CallbackOptions,
		});
		/** @param fog density */
		fogDensity = ParamConfig.FLOAT(0.00025, {
			visibleIf: {useFog: 1, fogType: FOG_TYPES.indexOf(FogType.EXPONENTIAL)},
			...CallbackOptions,
		});
	};
}
class SceneFogParamsConfig extends SceneFogParamConfig(NodeParamsConfig) {}
abstract class SceneFogNode extends TypedNode<any, SceneFogParamsConfig> {
	readonly SceneFogController = new SceneFogController(this);
	protected _object = new Scene();
	get object() {
		return this._object;
	}
}

export class SceneFogController {
	constructor(protected node: SceneFogNode) {}
	private _fog: Fog | undefined;
	private _fogExp2: FogExp2 | undefined;

	async update() {
		const scene = this.node.object;
		const pv = this.node.pv;

		if (isBooleanTrue(pv.useFog)) {
			if (pv.fogType == FOG_TYPES.indexOf(FogType.LINEAR)) {
				const fog = this.fog2(pv);
				scene.fog = fog;
				fog.color = pv.fogColor;
				fog.near = pv.fogNear;
				fog.far = pv.fogFar;
			} else {
				const fogExp2 = this.fogExp2(pv);
				scene.fog = this.fogExp2(pv);
				fogExp2.color = pv.fogColor;
				fogExp2.density = pv.fogDensity;
			}
		} else {
			const current_fog = scene.fog;
			if (current_fog) {
				scene.fog = null;
			}
		}
	}
	fog2(pv: ParamsValueAccessorType<SceneFogParamsConfig>) {
		return (this._fog = this._fog || new Fog(0xffffff, pv.fogNear, pv.fogFar));
	}
	fogExp2(pv: ParamsValueAccessorType<SceneFogParamsConfig>) {
		return (this._fogExp2 = this._fogExp2 || new FogExp2(0xffffff, pv.fogDensity));
	}

	static async update(node: SceneFogNode) {
		node.SceneFogController.update();
	}
}
