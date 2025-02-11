/**
 * Creates a triangle.
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import jscad from '@jscad/modeling';
import {MathUtils} from 'three';
const {degToRad} = MathUtils;
const {triangle} = jscad.primitives;

enum TriangleType {
	AAA = 'AAA',
	AAS = 'AAS',
	ASA = 'ASA',
	SAS = 'SAS',
	SSA = 'SSA',
	SSS = 'SSS',
}
const TRIANGLE_TYPES: TriangleType[] = [
	TriangleType.AAA,
	TriangleType.AAS,
	TriangleType.ASA,
	TriangleType.SAS,
	TriangleType.SSA,
	TriangleType.SSS,
];

class TriangleCsgParamsConfig extends NodeParamsConfig {
	/** @param type */
	type = ParamConfig.INTEGER(TRIANGLE_TYPES.indexOf(TriangleType.AAA), {
		menu: {entries: TRIANGLE_TYPES.map((name, value) => ({name, value}))},
	});
	/** @param angles */
	angles = ParamConfig.VECTOR2([60, 60]);
}
const ParamsConfig = new TriangleCsgParamsConfig();

export class TriangleCsgNode extends TypedCsgNode<TriangleCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'triangle';
	}

	private _angles: jscad.maths.vec3.Vec3 = [0, 0, 0];
	override cook(inputCoreGroups: CsgCoreGroup[]) {
		try {
			const angles = this.pv.angles;
			const angle0 = degToRad(angles.x);
			const angle1 = degToRad(angles.y);
			const angle2 = Math.PI - (angle0 + angle1);
			this._angles[0] = angle0;
			this._angles[1] = angle1;
			this._angles[2] = angle2;
			const geo = triangle({
				type: TRIANGLE_TYPES[this.pv.type],
				values: this._angles,
			});
			this.setCsgCoreObject(geo);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'failed to create geometry';
			this.states.error.set(message);
			this.setCsgCoreObjects([]);
		}
	}
}
