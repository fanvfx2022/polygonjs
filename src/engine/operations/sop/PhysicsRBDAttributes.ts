import {
	CorePhysicsAttribute,
	PHYSICS_RBD_COLLIDER_TYPES,
	PHYSICS_RBD_TYPES,
} from './../../../core/physics/PhysicsAttribute';
import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {PhysicsRBDColliderType, PhysicsRBDType} from '../../../core/physics/PhysicsAttribute';
import {Vector3} from 'three';
import {isBooleanTrue} from '../../../core/Type';

interface PhysicsRBDAttributesSopParams extends DefaultOperationParams {
	RBDType: number;
	colliderType: number;
	taddId: boolean;
	id: string;
	// cuboid
	sizes: Vector3;
	size: number;
	// sphere
	radius: number;
	// capsule
	height: number;
	// common
	density: number;
	friction: number;
	restitution: number;
	linearDamping: number;
	angularDamping: number;
	canSleep: boolean;
}

export class PhysicsRBDAttributesSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: PhysicsRBDAttributesSopParams = {
		RBDType: PHYSICS_RBD_TYPES.indexOf(PhysicsRBDType.DYNAMIC),
		colliderType: PHYSICS_RBD_COLLIDER_TYPES.indexOf(PhysicsRBDColliderType.CUBOID),
		taddId: true,
		id: '',
		// cuboid
		sizes: new Vector3(1, 1, 1),
		size: 1,
		// sphere
		radius: 1,
		// capsule
		height: 0.5,
		// common
		density: 1,
		friction: 0.5,
		restitution: 0.5,
		linearDamping: 0,
		angularDamping: 0,
		canSleep: true,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'physicsRBDAttributes'> {
		return 'physicsRBDAttributes';
	}
	override cook(inputCoreGroups: CoreGroup[], params: PhysicsRBDAttributesSopParams) {
		const inputCoreGroup = inputCoreGroups[0];
		const objects = inputCoreGroup.objects();
		for (let object of objects) {
			const colliderType = PHYSICS_RBD_COLLIDER_TYPES[params.colliderType];
			CorePhysicsAttribute.setRBDType(object, PHYSICS_RBD_TYPES[params.RBDType]);
			CorePhysicsAttribute.setColliderType(object, colliderType);
			CorePhysicsAttribute.setDensity(object, params.density);
			CorePhysicsAttribute.setRestitution(object, params.restitution);
			CorePhysicsAttribute.setLinearDamping(object, params.linearDamping);
			CorePhysicsAttribute.setAngularDamping(object, params.angularDamping);
			CorePhysicsAttribute.setCanSleep(object, params.canSleep);

			if (isBooleanTrue(params.taddId)) {
				CorePhysicsAttribute.setRBDId(object, params.id);
			}

			switch (colliderType) {
				case PhysicsRBDColliderType.CUBOID: {
					CorePhysicsAttribute.setCuboidSize(object, params.size);
					break;
				}
				case PhysicsRBDColliderType.SPHERE: {
					CorePhysicsAttribute.setRadius(object, params.radius);
					break;
				}
				case PhysicsRBDColliderType.CAPSULE: {
					CorePhysicsAttribute.setHeight(object, params.height);
					CorePhysicsAttribute.setRadius(object, params.radius);
					break;
				}
			}
		}

		return inputCoreGroup;
	}
}
