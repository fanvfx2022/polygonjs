import DEFAULT_FRAGMENT from './SDFRhombusTriacontahedron/default.frag.glsl';
import DEFAULT_VERTEX from './SDFRhombusTriacontahedron/default.vert.glsl';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {GLSLHelper} from '../../../helpers/GLSLHelper';

QUnit.test('gl/SDFRhombusTriacontahedron simple', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const rayMarchingBuilder1 = MAT.createNode('rayMarchingBuilder');
	const material = rayMarchingBuilder1.material;
	const output1 = rayMarchingBuilder1.createNode('output');

	const SDFRhombus1 = rayMarchingBuilder1.createNode('SDFRhombusTriacontahedron');
	const SDFContext1 = rayMarchingBuilder1.createNode('SDFContext');
	output1.setInput(0, SDFContext1);
	SDFContext1.setInput(0, SDFRhombus1);

	assert.ok(rayMarchingBuilder1.assemblerController()?.compileRequired(), 'compiled is required');
	await RendererUtils.compile(rayMarchingBuilder1, renderer);
	assert.notOk(rayMarchingBuilder1.assemblerController()?.compileRequired(), 'compiled is required');
	assert.equal(GLSLHelper.compress(material.vertexShader), GLSLHelper.compress(DEFAULT_VERTEX), 'default vertex');
	assert.equal(
		GLSLHelper.compress(material.fragmentShader),
		GLSLHelper.compress(DEFAULT_FRAGMENT),
		'default fragment'
	);

	RendererUtils.dispose();
});
