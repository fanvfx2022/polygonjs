import {Mesh} from 'three';
// import {AttribClass} from '../../../../src/core/geometry/Constant';
import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/random with float inputs', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const random = actor1.createNode('random');
	// const constant1 = actor1.createNode('constant');
	const floatToVec3_1 = actor1.createNode('floatToVec3');

	// constant1.setConstantType(ActorConnectionPointType.FLOAT);
	// constant1.p.float.set(3);

	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', floatToVec3_1);
	floatToVec3_1.setInput('y', random);

	// random.setInput(0, constant1);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		assert.equal(object.position.y, 0, 'object still at 0');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		const value0 = object.position.y;
		// assert.in_delta(object.position.y, 0.545, 0.01, 'object moved');
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		const value1 = object.position.y;
		assert.notEqual(value0, value1);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		const value2 = object.position.y;
		assert.notEqual(value1, value2);
		assert.notEqual(value0, value2);
	});
});

// QUnit.test('actor/complement with vector inputs', async (assert) => {
// 	const scene = window.scene;
// 	const perspective_camera1 = window.perspective_camera1;

// 	const geo1 = scene.createNode('geo');
// 	const box1 = geo1.createNode('box');
// 	const actor1 = geo1.createNode('actor');

// 	actor1.setInput(0, box1);
// 	actor1.flags.display.set(true);

// 	const onManualTrigger1 = actor1.createNode('onManualTrigger');
// 	const setObjectPosition1 = actor1.createNode('setObjectPosition');
// 	const complement = actor1.createNode('complement');
// 	const constant1 = actor1.createNode('constant');

// 	constant1.setConstantType(ActorConnectionPointType.VECTOR3);
// 	constant1.p.vector3.set([7, 17, 27]);

// 	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
// 	setObjectPosition1.setInput('position', complement);

// 	complement.setInput(0, constant1);

// 	const container = await actor1.compute();
// 	const object = container.coreContent()!.objects()[0] as Mesh;

// 	// wait to make sure objects are mounted to the scene
// 	await CoreSleep.sleep(150);

// 	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
// 		scene.play();
// 		assert.equal(scene.time(), 0);
// 		assert.equal(object.position.y, 0);
// 		await CoreSleep.sleep(500);
// 		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
// 		assert.equal(object.position.y, 0, 'object still at 0');

// 		onManualTrigger1.p.trigger.pressButton();
// 		await CoreSleep.sleep(100);
// 		assert.equal(object.position.x, -6, 'object moved ');
// 		assert.equal(object.position.y, -16, 'object moved ');
// 		assert.equal(object.position.z, -26, 'object moved ');
// 	});
// });
