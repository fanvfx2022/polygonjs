import {Object3D} from 'three';
import {CoreObject} from './../../../../src/core/geometry/Object';
import {AttribClass} from '../../../../src/core/geometry/Constant';

QUnit.test('copy can use default value with 2 args', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attribCreate1 = geo1.createNode('attribCreate');
	const copy1 = geo1.createNode('copy');

	attribCreate1.setInput(0, box1);
	copy1.setInput(0, attribCreate1);

	attribCreate1.setAttribClass(AttribClass.OBJECT);
	attribCreate1.p.name.set('test');

	attribCreate1.p.value1.set("copy('../copy1', 2)");

	copy1.p.count.set(4);

	let container = await attribCreate1.compute();
	assert.equal(CoreObject.attribValue(container.coreContent()!.objects()[0], 'test'), 2);

	container = await copy1.compute();
	assert.deepEqual(
		container
			.coreContent()!
			.objects()
			.map((o: Object3D) => CoreObject.attribValue(o, 'test')),
		[0, 1, 2, 3]
	);
});

QUnit.test('copy can use default value wit 3 args', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attribCreate1 = geo1.createNode('attribCreate');
	const copy1 = geo1.createNode('copy');

	attribCreate1.setInput(0, box1);
	copy1.setInput(0, attribCreate1);

	attribCreate1.setAttribClass(AttribClass.OBJECT);
	attribCreate1.p.name.set('test');
	attribCreate1.p.value1.set("copy('../copy1', 2, 'i')");

	copy1.p.count.set(4);

	let container = await attribCreate1.compute();
	assert.equal(CoreObject.attribValue(container.coreContent()!.objects()[0], 'test'), 2);

	container = await copy1.compute();
	assert.deepEqual(
		container
			.coreContent()!
			.objects()
			.map((o: Object3D) => CoreObject.attribValue(o, 'test')),
		[0, 1, 2, 3]
	);
});
