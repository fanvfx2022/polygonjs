QUnit.test('attribcopy latitude to position', async (assert) => {
	const geo1 = window.geo1;
	const plane1 = geo1.createNode('plane');

	const attrib_create1 = geo1.createNode('attribCreate');
	attrib_create1.p.name.set('latitude');
	attrib_create1.p.size.set(1);
	attrib_create1.p.value1.set('@ptnum');
	attrib_create1.setInput(0, plane1);

	const attrib_create2 = geo1.createNode('attribCreate');
	attrib_create2.p.name.set('longitude');
	attrib_create2.p.size.set(1);
	attrib_create2.p.value1.set('2*@ptnum+1');
	attrib_create2.setInput(0, attrib_create1);

	const attrib_copy1 = geo1.createNode('attribCopy');
	attrib_copy1.setInput(0, attrib_create2);
	attrib_copy1.setInput(1, attrib_create2);

	attrib_copy1.p.name.set('latitude');
	attrib_copy1.p.tnewName.set(1);
	attrib_copy1.p.newName.set('position');
	// attrib_copy1.param('to_all_components').set(0);
	// attrib_copy1.param('src_component').set(0);
	// attrib_copy1.param('dest_component').set(0);

	let container = await attrib_copy1.requestContainer();
	assert.notOk(attrib_copy1.states.error.message(), 'no error');
	let core_group = container.coreContent()!;
	let geometry = core_group.objectsWithGeo()[0].geometry;
	assert.ok(core_group, 'core group exists');
	assert.ok(geometry, 'geometry exists');
	console.log('geometry', geometry);

	let {array} = geometry.getAttribute('position');
	assert.equal(array.length, container.pointsCount() * 3, 'array is 3x the points count');
	console.log('array', array, array.length, container.pointsCount());
	assert.equal(array[0], 0);
	assert.equal(array[3], 1);
	assert.equal(array[6], 2);
	assert.equal(array[2], -0.5);
	assert.equal(array[5], -0.5);
	assert.equal(array[8], +0.5);

	const attrib_copy2 = geo1.createNode('attribCopy');
	attrib_copy2.setInput(0, attrib_copy1);
	attrib_copy2.setInput(1, attrib_copy1);

	attrib_copy2.p.name.set('longitude');
	attrib_copy2.p.tnewName.set(1);
	attrib_copy2.p.newName.set('position');
	attrib_copy2.p.destOffset.set(2);
	// attrib_copy2.param('to_all_components').set(0);
	// attrib_copy2.param('src_component').set(0);
	// attrib_copy2.param('dest_component').set(2);

	container = await attrib_copy2.requestContainer();
	assert.notOk(attrib_copy2.states.error.message());
	core_group = container.coreContent()!;
	geometry = core_group.objectsWithGeo()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	array = geometry.getAttribute('position').array;
	assert.equal(array.length, container.pointsCount() * 3, 'array is 3x points_count');
	console.log('array', array);
	assert.equal(array[0], 0);
	assert.equal(array[3], 1);
	assert.equal(array[6], 2);
	assert.equal(array[2], 1);
	assert.equal(array[5], 3);
	assert.equal(array[8], 5);
});
