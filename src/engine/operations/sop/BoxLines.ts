import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector3} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {BufferGeometry} from 'three';
import {Float32BufferAttribute} from 'three';
import {ObjectType} from '../../../core/geometry/Constant';
import {isBooleanTrue} from '../../../core/Type';
import {CoreGeometryBuilderMerge} from '../../../core/geometry/builders/Merge';

interface BoxLinesSopParams extends DefaultOperationParams {
	size: number;
	sizes: Vector3;
	center: Vector3;
	mergeLines: boolean;
}

const POSITIONS = {
	xm: {
		ym: {
			zm: new Vector3(-1, -1, -1),
			zp: new Vector3(-1, -1, +1),
		},
		yp: {
			zm: new Vector3(-1, +1, -1),
			zp: new Vector3(-1, +1, +1),
		},
	},
	xp: {
		ym: {
			zm: new Vector3(+1, -1, -1),
			zp: new Vector3(+1, -1, +1),
		},
		yp: {
			zm: new Vector3(+1, +1, -1),
			zp: new Vector3(+1, +1, +1),
		},
	},
};

const _sizes = new Vector3();
const _center = new Vector3();
export class BoxLinesSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: BoxLinesSopParams = {
		size: 1,
		sizes: new Vector3(1, 1, 1),
		center: new Vector3(0, 0, 0),
		mergeLines: true,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'boxLines'> {
		return 'boxLines';
	}
	override cook(inputCoreGroups: CoreGroup[], params: BoxLinesSopParams) {
		const inputCoreGroup = inputCoreGroups[0];
		const objects = inputCoreGroup ? this._cookWithInput(inputCoreGroup, params) : this._cookWithoutInput(params);

		if (this._node) {
			let i = 0;
			for (let object of objects) {
				object.name = `${this._node.name()}-${i}`;
				i++;
			}
		}

		return this.createCoreGroupFromObjects(objects);
	}
	private _cookWithoutInput(params: BoxLinesSopParams) {
		return this._createLines(params);
	}

	private _cookWithInput(coreGroup: CoreGroup, params: BoxLinesSopParams) {
		const bbox = coreGroup.boundingBox();
		bbox.getSize(_sizes);
		bbox.getCenter(_center);

		return this._createLines({
			size: 1,
			sizes: _sizes,
			center: _center,
			mergeLines: params.mergeLines,
		});
	}

	private _createLines(params: BoxLinesSopParams) {
		const geometries: BufferGeometry[] = [
			// xm
			this._createLine(POSITIONS.xm.ym.zm, POSITIONS.xm.ym.zp, params),
			this._createLine(POSITIONS.xm.ym.zm, POSITIONS.xm.yp.zm, params),
			this._createLine(POSITIONS.xm.yp.zm, POSITIONS.xm.yp.zp, params),
			this._createLine(POSITIONS.xm.ym.zp, POSITIONS.xm.yp.zp, params),

			// between x faces
			this._createLine(POSITIONS.xm.ym.zp, POSITIONS.xp.ym.zp, params),
			this._createLine(POSITIONS.xm.yp.zp, POSITIONS.xp.yp.zp, params),
			this._createLine(POSITIONS.xm.ym.zm, POSITIONS.xp.ym.zm, params),
			this._createLine(POSITIONS.xm.yp.zm, POSITIONS.xp.yp.zm, params),

			// xp
			this._createLine(POSITIONS.xp.ym.zm, POSITIONS.xp.ym.zp, params),
			this._createLine(POSITIONS.xp.ym.zm, POSITIONS.xp.yp.zm, params),
			this._createLine(POSITIONS.xp.yp.zm, POSITIONS.xp.yp.zp, params),
			this._createLine(POSITIONS.xp.ym.zp, POSITIONS.xp.yp.zp, params),
		];

		if (isBooleanTrue(params.mergeLines)) {
			const mergedGeometry = CoreGeometryBuilderMerge.merge(geometries);
			if (mergedGeometry) {
				const object = this.createObject(mergedGeometry, ObjectType.LINE_SEGMENTS);
				return [object];
			}
		} else {
			const objects = geometries.map((geometry) => this.createObject(geometry, ObjectType.LINE_SEGMENTS));
			return objects;
		}
		return [];
	}

	private _tmpV = new Vector3();
	private _createLine(start: Vector3, end: Vector3, params: BoxLinesSopParams) {
		const pointsCount = 2;
		const positions: number[] = new Array(pointsCount * 3);
		const indices: number[] = new Array(pointsCount);

		this._setTmpVec(start, params);
		this._tmpV.toArray(positions, 0);
		this._setTmpVec(end, params);
		this._tmpV.toArray(positions, 3);
		indices[0] = 0;
		indices[1] = 1;

		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		geometry.setIndex(indices);
		geometry.translate(params.center.x, params.center.y, params.center.z);
		return geometry;
	}
	private _setTmpVec(vec: Vector3, params: BoxLinesSopParams) {
		this._tmpV.copy(vec);
		this._tmpV.x *= 0.5 * params.size * params.sizes.x;
		this._tmpV.y *= 0.5 * params.size * params.sizes.y;
		this._tmpV.z *= 0.5 * params.size * params.sizes.z;
	}
}
