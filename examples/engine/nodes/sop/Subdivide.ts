import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopSubdivide() {
	// create a scene
	const scene = new PolyScene();

	// create a box
	const geo = scene.root.createNode('geo');
	const box = geo.createNode('box');

	// add a subdivide node
	const subdivide = geo.createNode('subdivide');
	subdivide.setInput(0, box);
	subdivide.flags.display.set(true);

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
	const nodes = [subdivide];
	const htmlNodes = {subdivide};
	const camera = perspectiveCamera1;
	return {scene, camera, nodes, htmlNodes};
}
