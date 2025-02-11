import {CoreSleep} from './../../../../src/core/Sleep';
import {Camera} from 'three';
import {ThreejsViewer} from './../../../../src/engine/viewers/Threejs';
import {HTMLElementWithViewer} from './../../../../src/engine/viewers/_Base';
import {RendererUtils} from './../../../helpers/RendererUtils';
QUnit.test('post/brightnessContrast simple', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();

	// create an object to see from the viewer
	const sphere1 = window.geo1.createNode('sphere');
	sphere1.flags.display.set(true);
	scene.createNode('hemisphereLight');

	// create camera
	const cameras = scene.createNode('geo');
	cameras.setName('cameras');
	const perspectiveCamera1 = cameras.createNode('perspectiveCamera');
	perspectiveCamera1.setName('perspectiveCamera_MAIN');
	perspectiveCamera1.p.position.z.set(10);
	// renderer (this is an attempt to be able to save the canvas content after, but that does not seem to be working)
	const cameraRenderer1 = cameras.createNode('cameraRenderer');
	cameraRenderer1.setInput(0, perspectiveCamera1);
	const rendererNode = cameraRenderer1.createNode('WebGLRenderer');
	rendererNode.p.preserveDrawingBuffer.set(1);
	cameraRenderer1.p.node.setNode(rendererNode);
	// post process
	const cameraPostProcess1 = cameras.createNode('cameraPostProcess');
	cameraPostProcess1.setInput(0, cameraRenderer1);
	const brightnessContrast1 = cameraPostProcess1.createNode('brightnessContrast');
	brightnessContrast1.p.brightness.set(0.5);
	brightnessContrast1.flags.display.set(true);
	cameraPostProcess1.flags.display.set(true);

	await cameraPostProcess1.compute();
	await CoreSleep.sleep(50); // needed to be sure the new camera object is mounted
	const viewer = (await scene.camerasController.createMainViewer({
		autoRender: true,
		cameraMaskOverride: `*/${perspectiveCamera1.name()}`,
	}))! as ThreejsViewer<Camera>;
	assert.ok(viewer);

	await RendererUtils.withViewer({viewer, mount: true}, async ({viewer, element}) => {
		const elementWithScene = element as HTMLElementWithViewer<any>;
		assert.deepEqual(elementWithScene.scene, scene);
		assert.deepEqual(elementWithScene.viewer, viewer);
		assert.equal(viewer.camera().name, 'perspectiveCamera_MAIN');
		await CoreSleep.sleep(500);
		// console.log(await RendererUtils.readCanvasPixelValue(viewer.canvas(), new Vector2(0.5, 0.5)));

		brightnessContrast1.p.brightness.set(2);
		await CoreSleep.sleep(200);
		// console.log(await RendererUtils.readCanvasPixelValue(viewer.canvas(), new Vector2(0.5, 0.5)));
	});
});
