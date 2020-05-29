import {BaseJsFunctionAssembler} from './_Base';
import {ParamType} from '../../../../poly/ParamType';
import {OutputJsNode} from '../../Output';
import {JsConnectionPointType, JsConnectionPoint} from '../../../utils/io/connections/Js';
import {GlobalsJsNode} from '../../Globals';

export class PointsJsFunctionAssembler extends BaseJsFunctionAssembler {
	static add_output_inputs(output_child: OutputJsNode) {
		output_child.params.add_param(ParamType.VECTOR3, 'position', [0, 0, 0], {hidden: true});
		output_child.params.add_param(ParamType.VECTOR3, 'normal', [0, 0, 0], {hidden: true});
		output_child.params.add_param(ParamType.COLOR, 'color', [1, 1, 1], {hidden: true});
		output_child.params.add_param(ParamType.VECTOR2, 'uv', [0, 0], {hidden: true});
	}
	add_output_inputs(output_child: OutputJsNode) {
		PointsJsFunctionAssembler.add_output_inputs(output_child);
	}
	static create_globals_node_output_connections() {
		return [
			new JsConnectionPoint('position', JsConnectionPointType.VEC3),
			new JsConnectionPoint('normal', JsConnectionPointType.VEC3),
			new JsConnectionPoint('color', JsConnectionPointType.VEC3),
			new JsConnectionPoint('uv', JsConnectionPointType.VEC2),
			new JsConnectionPoint('time', JsConnectionPointType.FLOAT),
		];
	}
	create_globals_node_output_connections() {
		return PointsJsFunctionAssembler.create_globals_node_output_connections();
	}
	add_globals_outputs(globals_node: GlobalsJsNode) {
		globals_node.io.outputs.set_named_output_connection_points(this.create_globals_node_output_connections());
	}
}
