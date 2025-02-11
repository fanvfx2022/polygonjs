import {Vector3} from 'three';
import {TransformTargetType} from '../../../../src/core/Transform';
import {HierarchyMode} from '../../../../src/engine/operations/sop/Hierarchy';
QUnit.test('sop/transform simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, box1);

	let container, core_group;
	container = await transform1.compute();
	core_group = container.coreContent();
	const geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.ok(geometry);

	assert.equal(container.pointsCount(), 24);
	assert.equal(container.boundingBox().min.y, -0.5);

	assert.notOk(transform1.isDirty(), 'transform is not dirty');
	assert.notOk(transform1.p.t.isDirty(), 'transform t is not dirty');
	assert.notOk(transform1.p.t.y.isDirty(), 'transform ty is not dirty');
	transform1.p.t.y.set(2);
	assert.ok(transform1.isDirty(), 'transform is dirty');
	assert.ok(transform1.p.t.isDirty(), 'transform t is dirty');
	assert.notOk(transform1.p.t.y.isDirty(), 'transform ty is not dirty');
	container = await transform1.compute();
	assert.equal(container.boundingBox().min.y, +1.5);
	assert.equal(container.boundingBox().max.y, +2.5);
	assert.notOk(transform1.isDirty());
	assert.notOk(transform1.p.t.isDirty());
	assert.notOk(transform1.p.t.y.isDirty());

	transform1.p.s.y.set(2);

	// no change for now
	assert.equal(container.boundingBox().min.y, +1.5);
	assert.equal(container.boundingBox().max.y, +2.5);

	container = await transform1.compute();
	assert.equal(container.boundingBox().min.y, +1);
	assert.equal(container.boundingBox().max.y, +3);
});

QUnit.test('sop/transform can scale geometries down a hierarchy', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const merge1 = geo1.createNode('merge');
	const hierarchy1 = geo1.createNode('hierarchy');
	merge1.setInput(0, box1);
	merge1.setInput(1, box1);
	merge1.setCompactMode(false);
	hierarchy1.setInput(0, merge1);
	hierarchy1.setMode(HierarchyMode.ADD_PARENT);
	hierarchy1.p.levels.set(2);

	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, hierarchy1);
	transform1.setApplyOn(TransformTargetType.GEOMETRIES);
	transform1.p.scale.set(0.1);
	const container = await transform1.compute();
	const coreContent = container.coreContent();
	const bbox = coreContent!.boundingBox()!;
	const size = bbox.getSize(new Vector3());
	assert.in_delta(size.x, 0.1, 0.00001);
	assert.in_delta(size.y, 0.1, 0.00001);
});
