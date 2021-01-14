/**
 * Creates a directional light.
 *
 *
 */
import {Constructor} from '../../../types/GlobalTypes';
import {DirectionalLight} from 'three/src/lights/DirectionalLight';
import {DirectionalLightHelper} from './utils/helpers/DirectionalLightHelper';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Object3D} from 'three/src/core/Object3D';
import {Mesh} from 'three/src/objects/Mesh';
import {HelperController, HelperConstructor} from './utils/HelperController';
import {BaseLightTransformedObjNode} from './_BaseLightTransformed';
import {TransformedParamConfig} from './utils/TransformController';
import {ColorConversion} from '../../../core/Color';

export function DirectionalLightParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		// transform = ParamConfig.FOLDER();
		// directional
		// position = ParamConfig.VECTOR3([0, 1, 0]);
		// target = ParamConfig.VECTOR3([0, 0, 0]);
		// lookat = ParamConfig.OPERATOR_PATH('', {dependentOnFoundNode: false});

		light = ParamConfig.FOLDER();
		/** @param light color */
		color = ParamConfig.COLOR([1, 1, 1], {
			conversion: ColorConversion.SRGB_TO_LINEAR,
		});
		/** @param light intensity */
		intensity = ParamConfig.FLOAT(1);
		/** @param light distance */
		distance = ParamConfig.FLOAT(100, {range: [0, 100]});
		// shadows
		/** @param toggle on to cast shadows */
		castShadows = ParamConfig.BOOLEAN(1);
		/** @param shadow resolution */
		shadowRes = ParamConfig.VECTOR2([1024, 1024]);
		/** @param shadow bias */
		shadowBias = ParamConfig.FLOAT(0.001);

		// helper
		/** @param toggle to show helper */
		showHelper = ParamConfig.BOOLEAN(0);
		/** @param helper size */
		helperSize = ParamConfig.FLOAT(1, {visibleIf: {showHelper: 1}});
	};
}

class DirectionalLightObjParamsConfig extends DirectionalLightParamConfig(TransformedParamConfig(NodeParamsConfig)) {}
const ParamsConfig = new DirectionalLightObjParamsConfig();

export class DirectionalLightObjNode extends BaseLightTransformedObjNode<
	DirectionalLight,
	DirectionalLightObjParamsConfig
> {
	params_config = ParamsConfig;
	static type() {
		return 'directionalLight';
	}
	private _target_target!: Object3D;
	private _helper_controller = new HelperController<Mesh, DirectionalLight>(
		this,
		(<unknown>DirectionalLightHelper) as HelperConstructor<Mesh, DirectionalLight>,
		'DirectionalLightHelper'
	);
	initialize_node() {
		// this.io.inputs.set_count(0, 1);
		// this.io.inputs.set_depends_on_inputs(false);

		this._helper_controller.initialize_node();
	}

	create_light() {
		const light = new DirectionalLight();
		light.matrixAutoUpdate = false;

		light.castShadow = true;
		light.shadow.bias = -0.001;
		light.shadow.mapSize.x = 1024;
		light.shadow.mapSize.y = 1024;
		light.shadow.camera.near = 0.1;

		this._target_target = light.target;
		this._target_target.name = 'DirectionalLight Default Target';
		this.object.add(this._target_target);

		return light;
	}
	// add_object_to_parent(parent: Object3D) {
	// 	super.add_object_to_parent(parent);
	// 	parent.add(this._target_target);
	// }
	// remove_object_from_parent() {
	// 	super.remove_object_from_parent();
	// 	const parent = this._target_target.parent;
	// 	if (parent) {
	// 		parent.remove(this._target_target);
	// 	}
	// }

	update_light_params() {
		// this.light.position.copy(this.pv.t);
		this.light.color = this.pv.color;
		this.light.intensity = this.pv.intensity;
		this.light.shadow.camera.far = this.pv.distance;

		this._helper_controller.update();
	}
	update_shadow_params() {
		this.light.castShadow = this.pv.castShadows;
		this.light.shadow.mapSize.copy(this.pv.shadowRes);
		// object.shadow.camera.near = this.pv.shadow_near
		// object.shadow.camera.far = this.pv.shadow_far
		this.light.shadow.bias = this.pv.shadowBias;

		// updating the camera matrix is not necessary for point light
		// so probably should not for this
		this.light.shadow.camera.updateProjectionMatrix();
	}
}
