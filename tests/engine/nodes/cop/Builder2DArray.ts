import {CoreSleep} from '../../../../src/core/Sleep';
import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {FloatParam} from '../../../../src/engine/params/Float';
import {Builder2DArrayCopNode} from '../../../../src/engine/nodes/cop/Builder2DArray';
import {Vector3Param} from '../../../../src/engine/params/Vector3';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';
import {GLSLHelper} from '../../../helpers/GLSLHelper';

function createRequiredNodes(node: Builder2DArrayCopNode) {
	const output1 = node.createNode('output');
	const globals1 = node.createNode('globals');
	return {output1, globals1};
}

QUnit.test('COP/builder2DArray simple with render target', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();

	// create a renderer first
	// const {renderer} = await RendererUtils.waitForRenderer(scene);
	// assert.ok(renderer);

	// start test
	const COP = window.COP;
	// const MAT = window.MAT
	const builder1 = COP.createNode('builder2DArray');
	const {output1, globals1} = createRequiredNodes(builder1);
	builder1.p.useCameraRenderer.set(0);
	// builder1.p.useDataTexture.set(0);
	await CoreSleep.sleep(100);
	const renderer = builder1.renderer();
	if (!renderer) {
		assert.equal(1, 2);
		return;
	}
	// currently no need to tie it to a material to have it recook
	// currently use a mat to have the builder recook
	// const mesh_basic_builder1 = MAT.createNode('meshBasicBuilder')
	// mesh_basic_builder1.p.use_map.set(1)
	// mesh_basic_builder1.p.map.set(builder1.path())

	let container = await builder1.compute();
	assert.ok(!builder1.states.error.message(), 'no error message');
	let texture = container.texture();
	assert.equal(texture.image.width, 128, 'res ok');
	assert.equal(texture.image.height, 128, 'res ok');

	const renderTarget = await builder1.renderTarget();
	const buffer_width = 1;
	const buffer_height = 1;
	const pixelBuffer = new Uint8Array(buffer_width * buffer_height * 4);
	renderer.readRenderTargetPixels(renderTarget, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [0, 0, 0, 255].join(':'), 'black with alpha 1');

	const float_to_vec31 = builder1.createNode('floatToVec3');
	output1.setInput('color', float_to_vec31);
	float_to_vec31.setInput('x', globals1, 'time');
	scene.setFrame(30);
	assert.equal(scene.time(), 0.5);
	await CoreSleep.sleep(10);
	renderer.readRenderTargetPixels(renderTarget, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [127, 0, 0, 255].join(':'));

	scene.setFrame(60);
	assert.equal(scene.time(), 1);
	await CoreSleep.sleep(10);
	renderer.readRenderTargetPixels(renderTarget, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [255, 0, 0, 255].join(':'));

	RendererUtils.dispose();
});

// QUnit.test('COP/builder2DArray simple with data texture', async (assert) => {
// 	const scene = window.scene;
// 	await scene.waitForCooksCompleted();

// 	await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
// 		const COP = window.COP;
// 		const builder1 = COP.createNode('builder');
// 		builder1.p.useDataTexture.set(1); // we need to set this to 0 for the pixelBuffer below to exists.
// 		const {output1, globals1} = createRequiredNodes(builder1);
// 		// currently no need to tie it to a material to have it recook
// 		// currently use a mat to have the builder recook
// 		// const mesh_basic_builder1 = MAT.createNode('meshBasicBuilder')
// 		// mesh_basic_builder1.p.use_map.set(1)
// 		// mesh_basic_builder1.p.map.set(builder1.path())

// 		let container = await builder1.compute();
// 		assert.ok(!builder1.states.error.message());
// 		let texture = container.texture();
// 		assert.equal(texture.image.width, 256);
// 		assert.equal(texture.image.height, 256);

// 		const pixelBuffer = texture.image.data;
// 		assert.deepEqual(pixelBuffer.slice(0, 4).join(':'), [0, 0, 0, 1].join(':'), 'black with alpha 1');

// 		const float_to_vec31 = builder1.createNode('floatToVec3');
// 		output1.setInput('color', float_to_vec31);
// 		float_to_vec31.setInput('x', globals1, 'time');
// 		scene.setFrame(30);
// 		assert.equal(scene.time(), 0.5);
// 		await CoreSleep.sleep(10);
// 		assert.deepEqual(pixelBuffer.slice(0, 4).join(':'), [0.5, 0, 0, 1].join(':'));

// 		scene.setFrame(60);
// 		assert.equal(scene.time(), 1);
// 		await CoreSleep.sleep(10);
// 		assert.deepEqual(pixelBuffer.slice(0, 4).join(':'), [1.0, 0, 0, 1].join(':'));
// 	});
// });

QUnit.test('COP/builder2DArray with persisted_config', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();

	await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
		const COP = window.COP;
		const builder1 = COP.createNode('builder2DArray');
		const {output1, globals1} = createRequiredNodes(builder1);
		const param1 = builder1.createNode('param');
		param1.p.name.set('float_param');
		const param2 = builder1.createNode('param');
		param2.setGlType(GlConnectionPointType.VEC3);
		param2.p.name.set('vec3_param');
		const float_to_vec31 = builder1.createNode('floatToVec3');
		float_to_vec31.setInput(0, param1);
		float_to_vec31.setInput(1, globals1, 'time');
		output1.setInput('color', float_to_vec31);
		await builder1.compute();

		const data = new SceneJsonExporter(scene).data();
		await AssemblersUtils.withUnregisteredAssembler(builder1.usedAssembler(), async () => {
			// console.log('************ LOAD **************');
			const scene2 = await SceneJsonImporter.loadData(data);
			await scene2.waitForCooksCompleted();

			const new_builder1 = scene2.node('/COP/builder2DArray1') as Builder2DArrayCopNode;
			assert.notOk(new_builder1.assemblerController());
			assert.ok(new_builder1.persisted_config);
			const float_param = new_builder1.params.get('float_param') as FloatParam;
			const vec3_param = new_builder1.params.get('vec3_param') as Vector3Param;
			assert.ok(float_param, 'float param does not exist');
			assert.ok(vec3_param, 'vec3 param does not exist');
			const material = new_builder1.textureMaterial;
			assert.equal(
				GLSLHelper.compress(material.fragmentShader),
				GLSLHelper.compress(builder1.textureMaterial.fragmentShader)
			);
			assert.equal(
				GLSLHelper.compress(material.vertexShader),
				GLSLHelper.compress(builder1.textureMaterial.vertexShader)
			);

			// float param callback
			assert.equal(material.uniforms.v_POLY_param_float_param.value, 0);
			float_param.set(2);
			assert.equal(material.uniforms.v_POLY_param_float_param.value, 2);
			float_param.set(4);
			assert.equal(material.uniforms.v_POLY_param_float_param.value, 4);

			// vector3 param callback
			assert.deepEqual(material.uniforms.v_POLY_param_vec3_param.value.toArray(), [0, 0, 0]);
			vec3_param.set([1, 2, 3]);
			assert.deepEqual(material.uniforms.v_POLY_param_vec3_param.value.toArray(), [1, 2, 3]);
			vec3_param.set([5, 6, 7]);
			assert.deepEqual(material.uniforms.v_POLY_param_vec3_param.value.toArray(), [5, 6, 7]);
		});
	});
});
