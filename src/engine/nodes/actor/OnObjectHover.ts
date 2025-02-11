/**
 * sends a trigger when an object is Hovered
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {BaseUserInputActorNode} from './_BaseUserInput';
import {isBooleanTrue} from '../../../core/Type';
import {Intersection} from 'three';
import {Object3D} from 'three';
import {CoreEventEmitter, EVENT_EMITTERS, EVENT_EMITTER_PARAM_MENU_OPTIONS} from '../../../core/event/CoreEventEmitter';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;
class OnObjectHoverActorParamsConfig extends NodeParamsConfig {
	/** @param set which element triggers the event */
	element = ParamConfig.INTEGER(EVENT_EMITTERS.indexOf(CoreEventEmitter.CANVAS), {
		...EVENT_EMITTER_PARAM_MENU_OPTIONS,
		separatorAfter: true,
	});
	/** @param include children */
	traverseChildren = ParamConfig.BOOLEAN(1);
	/** @param pointsThreshold */
	pointsThreshold = ParamConfig.FLOAT(0.1);
	/** @param lineThreshold */
	lineThreshold = ParamConfig.FLOAT(0.1);
}
const ParamsConfig = new OnObjectHoverActorParamsConfig();

export class OnObjectHoverActorNode extends BaseUserInputActorNode<OnObjectHoverActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.ON_OBJECT_HOVER;
	}
	userInputEventNames() {
		return ['pointermove'];
	}
	override eventEmitter() {
		return EVENT_EMITTERS[this.pv.element];
	}
	private _intersections: Intersection[] = [];

	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint('hovered', ActorConnectionPointType.BOOLEAN, CONNECTION_OPTIONS),
		]);
		this.io.connection_points.spare_params.setInputlessParamNames(['pointsThreshold', 'lineThreshold']);
	}

	private _lastIntersectionStateByObject: Map<Object3D, boolean> = new Map();
	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const {Object3D} = context;

		const pointerEventsController = this.scene().eventsDispatcher.pointerEventsController;
		const raycaster = pointerEventsController.raycaster();
		pointerEventsController.updateRaycast(this.pv);

		this._intersections.length = 0;
		const intersections = raycaster.intersectObject(
			Object3D,
			isBooleanTrue(this.pv.traverseChildren),
			this._intersections
		);
		const newHoveredState = intersections[0] != null;
		const previousHoveredState = this._lastIntersectionStateByObject.get(Object3D);
		const hoveredStateChanged = previousHoveredState == null || newHoveredState != previousHoveredState;
		if (hoveredStateChanged) {
			this._lastIntersectionStateByObject.set(Object3D, newHoveredState);
			this.runTrigger(context);
		}
	}
	public override outputValue(context: ActorNodeTriggerContext) {
		const {Object3D} = context;
		return this._lastIntersectionStateByObject.get(Object3D);
	}
}
