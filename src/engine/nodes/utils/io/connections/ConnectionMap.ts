import {NodeContext, NodeContextUnion} from '../../../../poly/NodeContext';
import {
	BaseGlConnectionPoint,
	GlConnectionPointType,
	GlConnectionPoint,
	GLParamTypeToConnectionPointTypeMap,
} from './Gl';
import {
	BaseJsConnectionPoint,
	JsConnectionPointType,
	JsConnectionPoint,
	JsParamTypeToConnectionPointTypeMap,
} from './Js';
import {BaseEventConnectionPoint, EventConnectionPoint, EventConnectionPointType} from './Event';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ActorParamTypeToConnectionPointTypeMap,
	BaseActorConnectionPoint,
} from './Actor';

type ConnectionPointTypeMapGeneric = {
	[key in NodeContext]:
		| BaseActorConnectionPoint
		| BaseEventConnectionPoint
		| BaseGlConnectionPoint
		| BaseJsConnectionPoint
		| undefined;
};

export interface ConnectionPointTypeMap extends ConnectionPointTypeMapGeneric {
	[NodeContext.ACTOR]: BaseActorConnectionPoint;
	[NodeContext.ANIM]: undefined;
	[NodeContext.AUDIO]: undefined;
	[NodeContext.COP]: undefined;
	[NodeContext.CSG]: undefined;
	[NodeContext.EVENT]: BaseEventConnectionPoint;
	[NodeContext.GL]: BaseGlConnectionPoint;
	[NodeContext.JS]: BaseJsConnectionPoint;
	[NodeContext.MANAGER]: undefined;
	[NodeContext.MAT]: undefined;
	[NodeContext.OBJ]: undefined;
	[NodeContext.POST]: undefined;
	[NodeContext.ROP]: undefined;
	[NodeContext.SOP]: undefined;
}
type ConnectionPointEnumMapGeneric = {
	[key in NodeContext]:
		| ActorConnectionPointType
		| EventConnectionPointType
		| GlConnectionPointType
		| JsConnectionPointType
		| undefined;
};

export interface ConnectionPointEnumMap extends ConnectionPointEnumMapGeneric {
	[NodeContext.ACTOR]: ActorConnectionPointType;
	[NodeContext.ANIM]: undefined;
	[NodeContext.AUDIO]: undefined;
	[NodeContext.COP]: undefined;
	[NodeContext.CSG]: undefined;
	[NodeContext.EVENT]: EventConnectionPointType;
	[NodeContext.GL]: GlConnectionPointType;
	[NodeContext.JS]: JsConnectionPointType;
	[NodeContext.MANAGER]: undefined;
	[NodeContext.MAT]: undefined;
	[NodeContext.OBJ]: undefined;
	[NodeContext.POST]: undefined;
	[NodeContext.ROP]: undefined;
	[NodeContext.SOP]: undefined;
}

type IConnectionPointEnumMap = {[key in NodeContextUnion]: ConnectionPointEnumMap[key]};

export const DEFAULT_CONNECTION_POINT_ENUM_MAP: IConnectionPointEnumMap = {
	[NodeContext.ACTOR]: ActorConnectionPointType.TRIGGER,
	[NodeContext.ANIM]: undefined,
	[NodeContext.AUDIO]: undefined,
	[NodeContext.COP]: undefined,
	[NodeContext.CSG]: undefined,
	[NodeContext.EVENT]: EventConnectionPointType.BASE,
	[NodeContext.GL]: GlConnectionPointType.FLOAT,
	[NodeContext.JS]: JsConnectionPointType.FLOAT,
	[NodeContext.MANAGER]: undefined,
	[NodeContext.MAT]: undefined,
	[NodeContext.OBJ]: undefined,
	[NodeContext.POST]: undefined,
	[NodeContext.ROP]: undefined,
	[NodeContext.SOP]: undefined,
};

export function create_connection_point<NC extends NodeContext>(
	context: NC,
	name: string,
	type: ConnectionPointEnumMap[NC]
) {
	switch (context) {
		case NodeContext.ACTOR: {
			return new ActorConnectionPoint(name, type as ActorConnectionPointType);
		}
		case NodeContext.EVENT: {
			return new EventConnectionPoint(name, type as EventConnectionPointType);
		}
		case NodeContext.GL: {
			return new GlConnectionPoint(name, type as GlConnectionPointType);
		}
		case NodeContext.JS: {
			return new JsConnectionPoint(name, type as JsConnectionPointType);
		}
		default: {
			return undefined;
		}
	}
}

export function param_type_to_connection_point_type_map<NC extends NodeContext>(context: NC) {
	switch (context) {
		case NodeContext.ACTOR: {
			return ActorParamTypeToConnectionPointTypeMap;
		}
		case NodeContext.EVENT: {
			return undefined;
		}
		case NodeContext.GL: {
			return GLParamTypeToConnectionPointTypeMap;
		}
		case NodeContext.JS: {
			return JsParamTypeToConnectionPointTypeMap;
		}
		default: {
			return undefined;
		}
	}
}
