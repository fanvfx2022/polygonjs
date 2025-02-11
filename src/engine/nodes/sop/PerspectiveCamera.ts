/**
 * Creates a perspective camera.
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {PerspectiveCameraSopOperation} from '../../operations/sop/PerspectiveCamera';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CameraNodeType} from '../../poly/NodeContext';
import {PERSPECTIVE_CAMERA_DEFAULT, registerPerspectiveCamera} from '../../../core/camera/CorePerspectiveCamera';
import {BaseNodeType} from '../_Base';
import {setSopMainCamera} from './utils/camera/setSopMainCamera';
const DEFAULT = PerspectiveCameraSopOperation.DEFAULT_PARAMS;
class PerspectiveCameraSopParamsConfig extends NodeParamsConfig {
	/** @param camera fov */
	fov = ParamConfig.FLOAT(DEFAULT.fov, {
		range: PERSPECTIVE_CAMERA_DEFAULT.fovRange,
		rangeLocked: [true, false],
	});
	/** @param camera near */
	near = ParamConfig.FLOAT(DEFAULT.near, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param camera far */
	far = ParamConfig.FLOAT(DEFAULT.far, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param camera position */
	position = ParamConfig.VECTOR3(DEFAULT.position);
	/** @param camera rotation */
	rotation = ParamConfig.VECTOR3(DEFAULT.rotation);
	/** @param show helper */
	showHelper = ParamConfig.BOOLEAN(DEFAULT.showHelper);
	/** @param matrixAutoUpdate */
	matrixAutoUpdate = ParamConfig.BOOLEAN(DEFAULT.matrixAutoUpdate);
	/** @param camera name */
	name = ParamConfig.STRING('`$OS`');
	/** @param set main camera */
	setMainCamera = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			setSopMainCamera(node as PerspectiveCameraSopNode);
		},
	});
}
const ParamsConfig = new PerspectiveCameraSopParamsConfig();

export class PerspectiveCameraSopNode extends TypedSopNode<PerspectiveCameraSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return CameraNodeType.PERSPECTIVE;
	}
	static override onRegister = registerPerspectiveCamera;

	protected override initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _operation: PerspectiveCameraSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new PerspectiveCameraSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
