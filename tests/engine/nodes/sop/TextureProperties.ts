import {Mesh} from 'three';
import {MeshBasicMaterial} from 'three';
import {Texture} from 'three';
import {ImageDefaultTextureLoader} from '../../../../src/core/loader/texture/ImageDefault';

QUnit.test('texture_properties simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false);
	const COP = window.COP;
	const MAT = window.MAT;
	const file1 = COP.createNode('image');
	const basic_material1 = MAT.createNode('meshBasic');
	const plane1 = geo1.createNode('plane');
	const material1 = geo1.createNode('material');

	// setup scene
	file1.p.url.set(ImageDefaultTextureLoader.PARAM_DEFAULT);
	file1.p.tanisotropy.set(0);
	basic_material1.p.useMap.set(1);
	await file1.compute();
	basic_material1.p.map.set(file1.path());
	material1.p.material.set(basic_material1.path());
	material1.setInput(0, plane1);

	let container = await material1.compute();
	let core_group = container.coreContent()!;
	let texture = ((core_group.objects()[0] as Mesh).material as MeshBasicMaterial).map as Texture;
	assert.equal(texture.anisotropy, 1);

	// test
	const texture_properties1 = geo1.createNode('textureProperties');
	texture_properties1.setInput(0, material1);

	container = await texture_properties1.compute();
	core_group = container.coreContent()!;
	texture = ((core_group.objects()[0] as Mesh).material as MeshBasicMaterial).map as Texture;
	assert.equal(texture.anisotropy, 1);

	texture_properties1.p.tanisotropy.set(1);
	texture_properties1.p.useRendererMaxAnisotropy.set(0);
	texture_properties1.p.anisotropy.set(8);
	container = await texture_properties1.compute();
	core_group = container.coreContent()!;
	texture = ((core_group.objects()[0] as Mesh).material as MeshBasicMaterial).map as Texture;
	assert.equal(texture.anisotropy, 8);
});
