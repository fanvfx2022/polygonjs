import {Object3D} from 'three';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {HierarchyMode} from '../../../../src/engine/operations/sop/Hierarchy';

QUnit.test('sop/objectProperties simple', async (assert) => {
	let container;
	const geo1 = window.geo1;
	const plane1 = geo1.createNode('plane');
	const objectProperties1 = geo1.createNode('objectProperties');
	objectProperties1.setInput(0, plane1);

	objectProperties1.p.tcastShadow.set(1);
	objectProperties1.p.treceiveShadow.set(1);

	container = await objectProperties1.compute();
	let object = container.coreContent()!.objects()[0];
	assert.ok(object.castShadow);
	assert.ok(object.receiveShadow);

	objectProperties1.setInput(0, plane1);
	container = await objectProperties1.compute();
	object = container.coreContent()!.objects()[0];
	assert.ok(object.castShadow);
	assert.ok(object.receiveShadow);

	objectProperties1.p.castShadow.set(0);
	container = await objectProperties1.compute();
	object = container.coreContent()!.objects()[0];
	assert.ok(!object.castShadow);
	assert.ok(object.receiveShadow);

	objectProperties1.p.receiveShadow.set(0);
	container = await objectProperties1.compute();
	object = container.coreContent()!.objects()[0];
	assert.ok(!object.castShadow);
	assert.ok(!object.receiveShadow);

	assert.ok(!object.matrixAutoUpdate);
	objectProperties1.p.tmatrixAutoUpdate.set(1);
	objectProperties1.p.matrixAutoUpdate.set(1);
	container = await objectProperties1.compute();
	object = container.coreContent()!.objects()[0];
	assert.ok(object.matrixAutoUpdate);

	assert.ok(object.visible, 'object is visible');
	objectProperties1.p.tvisible.set(1);
	objectProperties1.p.visible.set(0);
	container = await objectProperties1.compute();
	object = container.coreContent()!.objects()[0];
	assert.ok(!object.visible);
});
QUnit.test('sop/objectProperties with expression', async (assert) => {
	const geo1 = window.geo1;
	const plane1 = geo1.createNode('plane');
	const plane2 = geo1.createNode('plane');
	const merge = geo1.createNode('merge');
	merge.setInput(0, plane1);
	merge.setInput(1, plane2);
	const objectProperties1 = geo1.createNode('objectProperties');
	objectProperties1.setInput(0, merge);

	objectProperties1.p.applyToChildren.set(0);
	objectProperties1.p.tname.set(1);
	objectProperties1.p.name.set('box_`@ptnum`');
	let container = await objectProperties1.compute();
	assert.deepEqual(
		container
			.coreContent()!
			.objects()
			.map((o: Object3D) => o.name),
		['box_0', 'box_1']
	);

	const attribCreate = geo1.createNode('attribCreate');
	attribCreate.setInput(0, merge);
	attribCreate.setAttribClass(AttribClass.OBJECT);
	attribCreate.p.name.set('id');
	attribCreate.p.value1.set('@ptnum');
	objectProperties1.setInput(0, attribCreate);

	objectProperties1.p.name.set('box_`(@id+1)*2`');
	container = await objectProperties1.compute();
	assert.deepEqual(
		container
			.coreContent()!
			.objects()
			.map((o: Object3D) => o.name),
		['box_2', 'box_4']
	);
});
QUnit.test('sop/objectProperties does not fail with bad expression', async (assert) => {
	const geo1 = window.geo1;
	const plane1 = geo1.createNode('plane');
	const plane2 = geo1.createNode('plane');
	const merge1 = geo1.createNode('merge');
	const hierarchy1 = geo1.createNode('hierarchy');
	const objectProperties1 = geo1.createNode('objectProperties');
	merge1.setInput(0, plane1);
	merge1.setInput(1, plane2);
	hierarchy1.setInput(0, merge1);
	objectProperties1.setInput(0, hierarchy1);

	hierarchy1.setMode(HierarchyMode.ADD_PARENT);

	objectProperties1.p.applyToChildren.set(0);
	objectProperties1.p.tname.set(1);

	async function _getNames() {
		const container = await objectProperties1.compute();
		const coreContent = container.coreContent();
		assert.ok(coreContent);
		const objects = coreContent!.objects();
		let names: string[] = [];
		for (let object of objects) {
			object.traverse((child: Object3D) => names.push(child.name));
		}
		return names;
	}

	objectProperties1.p.name.set('box_`@objide`');
	assert.deepEqual(await _getNames(), ['box_', '', '']);

	objectProperties1.p.name.set('box_`@objnum`');
	assert.deepEqual(await _getNames(), ['box_0', '', '']);

	objectProperties1.p.applyToChildren.set(1);
	objectProperties1.p.name.set('box_`@objide`');
	assert.deepEqual(await _getNames(), ['box_', 'box_', 'box_']);

	objectProperties1.p.name.set('box_`@objnum`');
	assert.deepEqual(await _getNames(), ['box_0', 'box_0', 'box_1']);
});
