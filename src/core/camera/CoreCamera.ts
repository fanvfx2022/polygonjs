import {Camera} from 'three';
import {ArrayUtils} from '../ArrayUtils';
import {CoreObject} from '../geometry/Object';

export const CORE_CAMERA_DEFAULT = {
	near: 0.1,
	far: 100.0,
};

export enum CameraAttribute {
	NODE_ID = '_Camera_nodeGeneratorId__',
	CONTROLS_NODE_ID = '_Camera_controlsNodeId',
	CSS_RENDERER_NODE_ID = '_Camera_CSSRendererNodeId',
	FRAME_MODE = '_Camera_frameMode',
	FRAME_MODE_EXPECTED_ASPECT_RATIO = '_Camera_frameModeExpectedAspectRatio',
	POST_PROCESS_NODE_ID = '_Camera_postProcessNodeId',
	RENDER_SCENE_NODE_ID = '_Camera_renderSceneNodeId',
	RENDERER_NODE_ID = '_Camera_rendererNodeId',
}
export const CAMERA_ATTRIBUTES: CameraAttribute[] = [
	CameraAttribute.NODE_ID,
	CameraAttribute.CONTROLS_NODE_ID,
	CameraAttribute.CSS_RENDERER_NODE_ID,
	CameraAttribute.FRAME_MODE,
	CameraAttribute.FRAME_MODE_EXPECTED_ASPECT_RATIO,
	CameraAttribute.POST_PROCESS_NODE_ID,
	CameraAttribute.RENDER_SCENE_NODE_ID,
	CameraAttribute.RENDERER_NODE_ID,
];
export enum PerspectiveCameraAttribute {
	FOV = '_PerspectiveCamera_fov',
}
export const PERSPECTIVE_CAMERA_ATTRIBUTES: PerspectiveCameraAttribute[] = [PerspectiveCameraAttribute.FOV];
export enum OrthographicCameraAttribute {
	SIZE = '_OrthographicCamera_size',
}
export const ORTHOGRAPHIC_CAMERA_ATTRIBUTES: OrthographicCameraAttribute[] = [OrthographicCameraAttribute.SIZE];

export function serializeCamera<C extends Camera>(camera: C, attributeNames: string[]) {
	return JSON.stringify({
		uuid: camera.uuid,
		attributes: ArrayUtils.compact(
			attributeNames.map((attribName) => {
				const value = CoreObject.attribValue(camera, attribName);
				if (value != null) {
					return {[attribName]: value};
				}
			})
		),
	});
}
