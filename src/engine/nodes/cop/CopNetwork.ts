/**
 * A subnet to create COP nodes
 *
 */

import {ParamLessBaseNetworkCopNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {CopNodeChildrenMap} from '../../poly/registers/nodes/Cop';
import {BaseCopNodeType} from './_Base';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export class CopNetworkCopNode extends ParamLessBaseNetworkCopNode {
	static type() {
		return NetworkNodeType.COP;
	}

	protected _childrenControllerContext = NodeContext.COP;

	createNode<S extends keyof CopNodeChildrenMap>(node_class: S, options?: NodeCreateOptions): CopNodeChildrenMap[S];
	createNode<K extends valueof<CopNodeChildrenMap>>(node_class: Constructor<K>, options?: NodeCreateOptions): K;
	createNode<K extends valueof<CopNodeChildrenMap>>(node_class: Constructor<K>, options?: NodeCreateOptions): K {
		return super.createNode(node_class, options) as K;
	}
	children() {
		return super.children() as BaseCopNodeType[];
	}
	nodesByType<K extends keyof CopNodeChildrenMap>(type: K): CopNodeChildrenMap[K][] {
		return super.nodesByType(type) as CopNodeChildrenMap[K][];
	}
}
