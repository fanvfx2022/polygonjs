import {SplineCurveType} from '../../../../src/core/geometry/Curve';
import {METHOD, METHODS} from '../../../../src/engine/nodes/sop/Resample';
import {TextType} from '../../../../src/engine/nodes/sop/utils/text/TextType';

QUnit.test('resample a line', async (assert) => {
	const geo1 = window.geo1;

	const line1 = geo1.createNode('line');
	let container;

	container = await line1.compute();
	assert.equal(container.pointsCount(), 2);

	const resample1 = geo1.createNode('resample');
	resample1.setInput(0, line1);

	// try all curve types for method pointsCount
	resample1.p.method.set(METHODS.indexOf(METHOD.POINTS_COUNT));

	resample1.setCurveType(SplineCurveType.CENTRIPETAL);
	container = await resample1.compute();
	assert.equal(container.pointsCount(), 101);

	resample1.setCurveType(SplineCurveType.CHORDAL);
	container = await resample1.compute();
	assert.equal(container.pointsCount(), 101);

	resample1.setCurveType(SplineCurveType.CATMULLROM);
	container = await resample1.compute();
	assert.equal(container.pointsCount(), 101);

	// try all curve types for method segmentLength
	resample1.p.method.set(METHODS.indexOf(METHOD.SEGMENT_LENGTH));
	resample1.p.segmentLength.set(0.05);

	resample1.setCurveType(SplineCurveType.CENTRIPETAL);
	container = await resample1.compute();
	assert.equal(container.pointsCount(), 22);

	resample1.setCurveType(SplineCurveType.CHORDAL);
	container = await resample1.compute();
	assert.equal(container.pointsCount(), 22);

	resample1.setCurveType(SplineCurveType.CATMULLROM);
	container = await resample1.compute();
	assert.equal(container.pointsCount(), 22);
});

QUnit.test('resample a text', async (assert) => {
	const geo1 = window.geo1;

	const text1 = geo1.createNode('text');
	text1.p.text.set('flat');
	let container;

	text1.setTextType(TextType.LINE);
	container = await text1.compute();
	assert.equal(container.pointsCount(), 738);

	const resample1 = geo1.createNode('resample');
	resample1.setInput(0, text1);

	// try all curve types for method pointsCount
	resample1.p.method.set(METHODS.indexOf(METHOD.POINTS_COUNT));

	resample1.setCurveType(SplineCurveType.CENTRIPETAL);
	container = await resample1.compute();
	assert.equal(container.pointsCount(), 505);

	resample1.setCurveType(SplineCurveType.CHORDAL);
	container = await resample1.compute();
	assert.equal(container.pointsCount(), 505);

	resample1.setCurveType(SplineCurveType.CATMULLROM);
	container = await resample1.compute();
	assert.equal(container.pointsCount(), 505);

	// vary points count
	resample1.p.pointsCount.set(500);
	container = await resample1.compute();
	assert.equal(container.pointsCount(), 2505);

	// try all curve types for method segmentLength
	resample1.p.method.set(METHODS.indexOf(METHOD.SEGMENT_LENGTH));

	resample1.setCurveType(SplineCurveType.CENTRIPETAL);
	container = await resample1.compute();
	assert.equal(container.pointsCount(), 21);

	resample1.setCurveType(SplineCurveType.CHORDAL);
	container = await resample1.compute();
	assert.equal(container.pointsCount(), 21);

	resample1.setCurveType(SplineCurveType.CATMULLROM);
	container = await resample1.compute();
	assert.equal(container.pointsCount(), 21);

	// vary segment length
	resample1.p.segmentLength.set(0.01);
	container = await resample1.compute();
	assert.equal(container.pointsCount(), 1235);

	resample1.p.segmentLength.set(0.04);
	container = await resample1.compute();
	assert.equal(container.pointsCount(), 314);

	// also vary tension
	resample1.p.tension.set(0);
	container = await resample1.compute();
	assert.equal(container.pointsCount(), 314, 'with tension 0');

	resample1.p.tension.set(0.01);
	container = await resample1.compute();
	assert.equal(container.pointsCount(), 314, 'with tension 0.01');

	resample1.p.tension.set(0.5);
	container = await resample1.compute();
	assert.equal(container.pointsCount(), 329);

	resample1.p.tension.set(1);
	container = await resample1.compute();
	assert.equal(container.pointsCount(), 354);
});
