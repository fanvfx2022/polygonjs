// import 'tests/helpers/assertions';

QUnit.test('box simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');

	let container = await box1.request_container();
	const core_group = container.core_content();
	const geometry = core_group!.objects()[0].geometry;

	assert.equal(geometry.getAttribute('position').array.length, 72);
	assert.equal(container.bounding_box().min.y, -0.5);

	box1.params.set_float('size', 2);
	container = await box1.request_container();
	assert.equal(container.bounding_box().min.y, -1.0);
});

QUnit.test('box with input', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const transform1 = geo1.create_node('transform');
	transform1.io.inputs.set_input(0, box1);
	transform1.params.set_float('scale', 3);

	const box2 = geo1.create_node('box');
	box2.io.inputs.set_input(0, transform1);

	let container = await box2.request_container();
	const group = container.core_content()!;
	const {geometry} = group.objects()[0];

	assert.equal(geometry.getAttribute('position').array.length, 72);
	assert.equal(container.bounding_box().min.y, -1.5);
});
