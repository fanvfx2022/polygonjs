QUnit.test('spot light helper does not get shown when turning light on and off', async (assert) => {
	const scene = window.scene;
	const main_group = scene.threejsScene();
	assert.equal(main_group.name, '/');
	assert.equal(main_group.children.length, 2);
	assert.deepEqual(main_group.children.map((c) => c.name).sort(), ['/geo1', '/perspectiveCamera1'].sort());

	const spotLight1 = scene.root().createNode('spotLight');
	assert.equal(spotLight1.name(), 'spotLight1');
	assert.equal(main_group.children.length, 3);
	assert.equal(spotLight1.object.children.length, 2, '2 children');
	assert.equal(spotLight1.light.children.length, 2, 'no helper');

	// toggle show helper
	spotLight1.p.showHelper.set(1);
	await spotLight1.compute();
	assert.equal(spotLight1.object.children.length, 2, '2 children');
	assert.equal(spotLight1.light.children.length, 3, 'helper is added');

	spotLight1.p.showHelper.set(0);
	await spotLight1.compute();
	assert.equal(spotLight1.object.children.length, 2, '2 children');
	assert.equal(spotLight1.light.children.length, 2, 'no helper');

	// toggle display flag while helper is visible
	spotLight1.p.showHelper.set(1);
	await spotLight1.compute();
	assert.equal(spotLight1.light.children.length, 3, 'helper is added');
	assert.equal(spotLight1.object.children.length, 2, 'light in scene');
	spotLight1.flags.display.set(false);
	assert.equal(spotLight1.light.children.length, 3, 'no helper but still 3');
	assert.equal(spotLight1.object.children.length, 1, 'light not in scene');

	spotLight1.flags.display.set(true);
	assert.equal(spotLight1.light.children.length, 3, 'helper added');

	// toggle display flag while helper is not visible
	spotLight1.p.showHelper.set(0);
	await spotLight1.compute();
	assert.equal(spotLight1.light.children.length, 2, 'no helper');
	spotLight1.flags.display.set(false);
	assert.equal(spotLight1.light.children.length, 2, 'no helper');
	spotLight1.flags.display.set(true);
	assert.equal(spotLight1.light.children.length, 2, 'no helper');
});
