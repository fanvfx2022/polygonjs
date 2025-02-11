/**
 * Creates an ellipsoid.
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import jscad from '@jscad/modeling';
import {vector3ToCsgVec3} from '../../../core/geometry/csg/CsgVecToVector';
const {ellipsoid} = jscad.primitives;

class EllipsoidCsgParamsConfig extends NodeParamsConfig {
	/** @param center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param radius */
	radius = ParamConfig.VECTOR3([1, 1, 1]);
	/** @param segments */
	segments = ParamConfig.INTEGER(32, {
		range: [4, 128],
		rangeLocked: [true, false],
	});
	/** @param axes */
	// axes = ParamConfig.VECTOR3([0, 1, 0]);
}
const ParamsConfig = new EllipsoidCsgParamsConfig();

export class EllipsoidCsgNode extends TypedCsgNode<EllipsoidCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'ellipsoid';
	}

	private _center: jscad.maths.vec3.Vec3 = [0, 0, 0];
	private _radius: jscad.maths.vec3.Vec3 = [0, 0, 0];
	// private _axes: jscad.maths.vec3.Vec3 = [0, 0, 0];
	override cook(inputCoreGroups: CsgCoreGroup[]) {
		vector3ToCsgVec3(this.pv.center, this._center);
		vector3ToCsgVec3(this.pv.radius, this._radius);
		// vector3ToCsgVec3(this.pv.axes, this._axes);
		const geo = ellipsoid({
			center: this._center,
			radius: this._radius,
			segments: this.pv.segments,
			// axes: this._axes,
		});

		this.setCsgCoreObject(geo);
	}
}
