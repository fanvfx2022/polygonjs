// import {TypedJsNode} from './_Base';
// // import {ThreeToGl} from '../../../Core/ThreeToGl';
// // import {CodeBuilder} from './Util/CodeBuilder'
// // import {Definition} from './Definition/_Module';
// // import {ShaderName, LineType, LINE_TYPES} from './Assembler/Util/CodeBuilder';

// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// import {JsLinesController} from './code/utils/LinesController';
// class OutputJsParamsConfig extends NodeParamsConfig {}
// const ParamsConfig = new OutputJsParamsConfig();

// export class OutputJsNode extends TypedJsNode<OutputJsParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'output';
// 	}

// 	override initializeNode() {
// 		super.initializeNode();
// 		this.addPostDirtyHook('_setMatToRecompile', this._set_function_node_to_recompile.bind(this));
// 	}

// 	override createParams() {
// 		this.function_node?.assembler_controller.add_output_inputs(this);
// 	}

// 	override setLines(lines_controller: JsLinesController) {
// 		this.function_node?.assembler_controller.assembler.set_node_lines_output(this, lines_controller);
// 	}
// }
