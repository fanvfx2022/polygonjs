import {BaseManagerObjNode} from './_BaseManager';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {ObjNodeRenderOrder} from './_Base';

export class MaterialsObjNode extends BaseManagerObjNode {
	public readonly render_order: number = ObjNodeRenderOrder.MAT;
	static type() {
		return 'materials';
	}
	// children_context(){ return NodeContext.MAT }

	protected _children_controller_context = NodeContext.MAT;
	initialize_node() {
		this.children_controller?.init();
		// TODO: typescript
		// this._init_manager({
		// 	children: {
		// 		dependent: false,
		// 	},
		// });

		// attempt to have the parent /MAT depend on children like /MAT/material1
		// but how would this method know which node has triggered?
		// this.add_post_dirty_hook(this._eval_all_params_on_dirty.bind(this))
	}
}
