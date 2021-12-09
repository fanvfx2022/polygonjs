/**
 * Parent for Material nodes
 *
 *
 */
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {ParamLessBaseManagerObjNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {ObjNodeRenderOrder} from './_Base';
import {MatNodeChildrenMap} from '../../poly/registers/nodes/Mat';
import {BaseMatNodeType} from '../mat/_Base';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export class MaterialsNetworkObjNode extends ParamLessBaseManagerObjNode {
	public readonly renderOrder: number = ObjNodeRenderOrder.MANAGER;
	static type(): Readonly<NetworkNodeType.MAT> {
		return NetworkNodeType.MAT;
	}

	protected _childrenControllerContext = NodeContext.MAT;

	createNode<S extends keyof MatNodeChildrenMap>(node_class: S, options?: NodeCreateOptions): MatNodeChildrenMap[S];
	createNode<K extends valueof<MatNodeChildrenMap>>(node_class: Constructor<K>, options?: NodeCreateOptions): K;
	createNode<K extends valueof<MatNodeChildrenMap>>(node_class: Constructor<K>, options?: NodeCreateOptions): K {
		return super.createNode(node_class, options) as K;
	}
	children() {
		return super.children() as BaseMatNodeType[];
	}
	nodesByType<K extends keyof MatNodeChildrenMap>(type: K): MatNodeChildrenMap[K][] {
		return super.nodesByType(type) as MatNodeChildrenMap[K][];
	}
}
