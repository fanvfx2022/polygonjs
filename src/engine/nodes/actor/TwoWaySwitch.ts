/**
 * outputs 1 of the 2 inputs based on a boolean input
 *
 *
 *
 */
import {ActorConnectionPointType, ReturnValueTypeByActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorNodeTriggerContext, ParamlessTypedActorNode} from './_Base';

const OUTPUT_NAME = 'val';
export enum TwoWaySwitchActorNodeInputName {
	CONDITION = 'condition',
	IF_TRUE = 'ifTrue',
	IF_FALSE = 'ifFalse',
}
const InputNames: Array<TwoWaySwitchActorNodeInputName> = [
	TwoWaySwitchActorNodeInputName.CONDITION,
	TwoWaySwitchActorNodeInputName.IF_TRUE,
	TwoWaySwitchActorNodeInputName.IF_FALSE,
];

export class TwoWaySwitchActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'twoWaySwitch';
	}

	// public readonly gl_connections_controller: GlConnectionsController = new GlConnectionsController(this);
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.initializeNode();

		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}

	protected _expectedInputName(index: number) {
		return InputNames[index];
	}
	protected _expectedOutputName() {
		return OUTPUT_NAME;
	}
	protected _expectedInputTypes(): ActorConnectionPointType[] {
		const second_or_third_connection =
			this.io.connections.inputConnection(1) || this.io.connections.inputConnection(2);
		const type: ActorConnectionPointType = second_or_third_connection
			? second_or_third_connection.src_connection_point().type()
			: ActorConnectionPointType.FLOAT;
		return [ActorConnectionPointType.BOOLEAN, type, type];
	}
	protected _expectedOutputTypes() {
		const type = this._expectedInputTypes()[1];
		return [type];
	}

	public override outputValue(
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const condition = this._inputValue<ActorConnectionPointType.BOOLEAN>(
			TwoWaySwitchActorNodeInputName.CONDITION,
			context
		);

		if (condition) {
			return this._inputValue(TwoWaySwitchActorNodeInputName.IF_TRUE, context) || 0;
		} else {
			return this._inputValue(TwoWaySwitchActorNodeInputName.IF_FALSE, context) || 0;
		}
	}
}
