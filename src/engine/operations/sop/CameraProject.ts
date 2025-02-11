import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector3} from 'three';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {TypedNodePathParamValue} from '../../../core/Walker';
import {NodeContext} from '../../poly/NodeContext';
import {BaseCameraObjNodeType} from '../../nodes/obj/_BaseCamera';
import {isBooleanTrue} from '../../../core/Type';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface CameraProjectSopParams extends DefaultOperationParams {
	camera: TypedNodePathParamValue;
	unproject: boolean;
}

export class CameraProjectSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CameraProjectSopParams = {
		camera: new TypedNodePathParamValue(''),
		unproject: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'cameraProject'> {
		return 'cameraProject';
	}
	private _pointPosition = new Vector3();
	override cook(inputCoreGroups: CoreGroup[], params: CameraProjectSopParams) {
		const inputCoreGroup = inputCoreGroups[0];

		const cameraNode = params.camera.nodeWithContext(NodeContext.OBJ, this.states?.error) as BaseCameraObjNodeType;
		if (cameraNode) {
			const cameraObject = cameraNode.object;

			const points = inputCoreGroup.points();
			for (let point of points) {
				point.getPosition(this._pointPosition);
				if (isBooleanTrue(params.unproject)) {
					this._pointPosition.unproject(cameraObject);
				} else {
					this._pointPosition.project(cameraObject);
				}
				point.setPosition(this._pointPosition);
			}
		} else {
			this.states?.error.set(`cameraNode invalid.`);
		}
		return inputCoreGroup;
	}
}
