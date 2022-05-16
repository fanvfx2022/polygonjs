import {BaseUserInputActorNodeType} from '../../../nodes/actor/_BaseUserInput';
import {PolyScene} from '../../PolyScene';
import {ActorsManager} from '../ActorsManager';

import type {OnObjectClickActorNode} from '../../../nodes/actor/OnObjectClick';
import type {OnObjectHoverActorNode} from '../../../nodes/actor/OnObjectHover';
import type {OnObjectPointerDownActorNode} from '../../../nodes/actor/OnObjectPointerDown';
import type {OnObjectPointerUpActorNode} from '../../../nodes/actor/OnObjectPointerUp';
import type {OnPointerUpActorNode} from '../../../nodes/actor/OnPointerUp';
import type {RayFromCursorActorNode} from '../../../nodes/actor/RayFromCursor';
export type PointerEventActorNode =
	| OnObjectClickActorNode
	| OnObjectHoverActorNode
	| OnObjectPointerDownActorNode
	| OnObjectPointerUpActorNode
	| OnPointerUpActorNode
	| RayFromCursorActorNode;
export class ActorPointerEventsController {
	private _scene: PolyScene;
	private _triggeredNodes: Set<PointerEventActorNode> = new Set();
	constructor(protected actorsManager: ActorsManager) {
		this._scene = actorsManager.scene;
	}

	setTriggeredNodes(nodes: Set<PointerEventActorNode>) {
		nodes.forEach((node) => {
			this._triggeredNodes.add(node);
		});
	}

	runTriggers() {
		this._triggeredNodes.forEach((triggeredNode) => {
			const triggeredNodeParent = this._triggeredNodeParent(triggeredNode);
			if (!triggeredNodeParent) {
				return;
			}

			const nodeParentId = triggeredNodeParent.graphNodeId();
			this._scene.threejsScene().traverse((object) => {
				const nodeIds = this.actorsManager.objectActorNodeIds(object);
				if (!nodeIds) {
					return;
				}
				if (!nodeIds.includes(nodeParentId)) {
					return;
				}
				triggeredNode.receiveTrigger({Object3D: object});
			});
		});

		this._triggeredNodes.clear();
	}

	private _triggeredNodeParent(node: BaseUserInputActorNodeType) {
		return this.actorsManager.parentActorBuilderNode(node);
	}
}
