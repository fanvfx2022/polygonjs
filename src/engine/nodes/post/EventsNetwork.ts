/**
 * A subnet to create EVENT nodes
 *
 */
import {ParamLessBaseNetworkPostNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {EventNodeChildrenMap} from '../../poly/registers/nodes/Event';
import {BaseEventNodeType} from '../event/_Base';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export class EventsNetworkPostNode extends ParamLessBaseNetworkPostNode {
	static type() {
		return NetworkNodeType.EVENT;
	}

	protected _childrenControllerContext = NodeContext.EVENT;

	createNode<S extends keyof EventNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): EventNodeChildrenMap[S];
	createNode<K extends valueof<EventNodeChildrenMap>>(node_class: Constructor<K>, options?: NodeCreateOptions): K;
	createNode<K extends valueof<EventNodeChildrenMap>>(node_class: Constructor<K>, options?: NodeCreateOptions): K {
		return super.createNode(node_class, options) as K;
	}
	children() {
		return super.children() as BaseEventNodeType[];
	}
	nodesByType<K extends keyof EventNodeChildrenMap>(type: K): EventNodeChildrenMap[K][] {
		return super.nodesByType(type) as EventNodeChildrenMap[K][];
	}
}
