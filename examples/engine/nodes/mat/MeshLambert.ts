import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function MatMeshLambert() {
	// create a scene
	const scene = new PolyScene();

	// create a few objects
	const geo = scene.root.createNode('geo');
	const sphere = geo.createNode('sphere');
	sphere.p.center.x.set(-2);
	const box = geo.createNode('box');
	box.p.center.x.set(2);
	const torus = geo.createNode('torus');
	torus.p.center.z.set(-2);
	const torusKnot = geo.createNode('torusKnot');
	torusKnot.p.center.z.set(2);

	// merge the geometries
	const merge = geo.createNode('merge');
	merge.setInput(0, sphere);
	merge.setInput(1, box);
	merge.setInput(2, torus);
	merge.setInput(3, torusKnot);

	// create the material
	const materials = scene.root.createNode('materials');
	const meshBasic = materials.createNode('meshLambert');
	meshBasic.p.color.set([0, 0.5, 1]);

	// assign the material
	const material = geo.createNode('material');
	material.setInput(0, merge);
	material.p.material.set(meshBasic.fullPath());
	// set the display flag on the material node
	material.flags.display.set(true);

	// add a light
	scene.root.createNode('hemisphereLight');

	// create a camera
	const perspectiveCamera1 = scene.root.createNode('perspectiveCamera');
	perspectiveCamera1.p.t.set([5, 5, 5]);
	// add orbitControls
	const events1 = perspectiveCamera1.createNode('events');
	const orbitsControls = events1.createNode('cameraOrbitControls');
	perspectiveCamera1.p.controls.set(orbitsControls.fullPath());

	// EXPORT
	const nodes = [sphere];
	const camera = perspectiveCamera1;
	return {scene, camera, nodes};
}
