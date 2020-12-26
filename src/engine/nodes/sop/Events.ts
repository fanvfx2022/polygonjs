/**
 * A subnet to create EVENT nodes
 *
 */
import {ParamLessBaseNetworkSopNode} from './_Base';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {EventNodeChildrenMap} from '../../poly/registers/nodes/Event';
import {BaseEventNodeType} from '../event/_Base';
import {ParamsInitData} from '../utils/io/IOController';

export class EventsSopNode extends ParamLessBaseNetworkSopNode {
	static type() {
		return NetworkNodeType.EVENT;
	}

	protected _children_controller_context = NodeContext.EVENT;

	createNode<S extends keyof EventNodeChildrenMap>(
		node_class: S,
		params_init_value_overrides?: ParamsInitData
	): EventNodeChildrenMap[S];
	createNode<K extends valueof<EventNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K;
	createNode<K extends valueof<EventNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K {
		return super.createNode(node_class, params_init_value_overrides) as K;
	}
	children() {
		return super.children() as BaseEventNodeType[];
	}
	nodesByType<K extends keyof EventNodeChildrenMap>(type: K): EventNodeChildrenMap[K][] {
		return super.nodesByType(type) as EventNodeChildrenMap[K][];
	}
}
