import { EventContext } from '../../../../scene/utils/events/_BaseEventsController';
import { RaycastEventNode } from '../../Raycast';
export declare class RaycastCPUController {
    private _node;
    private _mouse;
    private _mouse_array;
    private _raycaster;
    private _resolved_target;
    private _intersection_position;
    constructor(_node: RaycastEventNode);
    update_mouse(context: EventContext<MouseEvent>): void;
    process_event(context: EventContext<MouseEvent>): void;
    private _prepare_raycaster;
    update_target(): void;
    static PARAM_CALLBACK_update_target(node: RaycastEventNode): void;
}
