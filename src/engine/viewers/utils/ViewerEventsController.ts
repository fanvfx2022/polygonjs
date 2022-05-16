import {BaseViewerType} from '../_Base';
import {EventContext, BaseSceneEventsControllerType} from '../../scene/utils/events/_BaseEventsController';
import {EVENT_EMITTERS} from '../../../core/event/CoreEventEmitter';
import {ACCEPTED_KEYBOARD_EVENT_TYPES, KeyboardEventType} from '../../../core/event/KeyboardEventType';
import {allowCanvasKeyEventsListener} from '../../../core/event/CanvasKeyFocus';
import {getEventOwner} from '../../../core/event/EventOwner';
import {EventData} from '../../../core/event/EventData';
type ViewerEventListener = (e: Event) => void;
interface EventListenerWithData {
	listener: ViewerEventListener;
	data: EventData;
}
type ListenerByEventType = Map<string, EventListenerWithData>;

export class ViewerEventsController {
	protected _bound_listener_map_by_event_controller_type: Map<string, ListenerByEventType> = new Map();

	constructor(protected viewer: BaseViewerType) {}

	updateEvents(eventsController: BaseSceneEventsControllerType) {
		const canvas = this.canvas();
		if (!canvas) {
			console.warn('no canvas found');
			return;
		}
		const controllerType = eventsController.type();
		let map = this._bound_listener_map_by_event_controller_type.get(controllerType);
		if (!map) {
			map = new Map();
			this._bound_listener_map_by_event_controller_type.set(controllerType, map);
		}
		map.forEach((listenerWithData, eventType) => {
			for (let emitter of EVENT_EMITTERS) {
				const element = getEventOwner({emitter, type: eventType}, canvas);
				element.removeEventListener(eventType, listenerWithData.listener);
			}
		});
		map.clear();

		const listener = (event: Event) => {
			this.processEvent(event, eventsController, canvas);
		};
		for (let eventData of eventsController.activeEventDatas()) {
			const eventOwner = getEventOwner(eventData, canvas);
			eventOwner.addEventListener(eventData.type, listener);

			// if the event being added is a keyboard type,
			// we need to add tabindex to the canvas to allow it to have focus
			if (eventOwner != document) {
				if (ACCEPTED_KEYBOARD_EVENT_TYPES.includes(eventData.type as KeyboardEventType)) {
					allowCanvasKeyEventsListener(eventOwner as HTMLCanvasElement);
				}
			}

			map.set(eventData.type, {listener, data: eventData});
		}
	}

	camera() {
		return this.viewer.camera();
	}
	canvas() {
		return this.viewer.canvas();
	}

	init() {
		if (!this.canvas()) {
			console.warn('no canvas found for eventsController');
			return;
		}
		this.viewer.scene().eventsDispatcher.traverseControllers((controller) => {
			this.updateEvents(controller);
		});
	}

	registeredEventTypes(): string[] {
		const list: string[] = [];
		this._bound_listener_map_by_event_controller_type.forEach((map) => {
			map.forEach((listener, eventType) => {
				list.push(eventType);
			});
		});
		return list;
	}

	dispose() {
		const canvas = this.canvas();
		this._bound_listener_map_by_event_controller_type.forEach((map) => {
			if (canvas) {
				map.forEach((listenerWithData, eventType) => {
					const eventOwner = getEventOwner(listenerWithData.data, canvas);
					eventOwner.removeEventListener(eventType, listenerWithData.listener);
				});
			}
		});
	}

	private processEvent(event: Event, controller: BaseSceneEventsControllerType, canvas: HTMLCanvasElement) {
		const eventContext: EventContext<Event> = {
			viewer: this.viewer,
			event: event,
			// camera: this.camera(),
		};
		controller.processEvent(eventContext);
	}
}
