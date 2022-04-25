import {CoreSleep} from '../../../../src/core/Sleep';
import {ShaderPass} from '../../../../src/modules/three/examples/jsm/postprocessing/ShaderPass';
import {ShaderMaterial} from 'three';
import {HorizontalBlurShader} from '../../../../src/modules/three/examples/jsm/shaders/HorizontalBlurShader';
import {VerticalBlurShader} from '../../../../src/modules/three/examples/jsm/shaders/VerticalBlurShader';
import {UnrealBloomPass} from '../../../../src/modules/three/examples/jsm/postprocessing/UnrealBloomPass';
import {RendererUtils} from '../../../helpers/RendererUtils';

function trimEmptySpace(word: string) {
	return word.replace(/\s|\t|\r\n|\n|\r/gm, '');
}

QUnit.test('Post nodes simple', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();

	const {renderer, canvas} = await RendererUtils.waitForRenderer(window.scene);
	assert.ok(renderer);

	// start test
	const camera = scene.root().nodesByType('perspectiveCamera')[0];
	const post_process1 = camera.createNode('postProcessNetwork');
	const horizontal_blur1 = post_process1.createNode('horizontalBlur');

	assert.ok(horizontal_blur1.flags?.display?.active(), 'first node created has display flag on');

	camera.p.doPostProcess.set(1);
	camera.p.postProcessNode.set(post_process1.path());
	await CoreSleep.sleep(20);

	// 2 passes by default
	let composer = camera.postProcessController().composer(canvas)!;
	assert.ok(composer, 'composer exists');
	assert.equal(composer.passes.length, 2, 'composer has two passes');
	assert.equal(
		((composer.passes[1] as ShaderPass).material as ShaderMaterial).fragmentShader,
		HorizontalBlurShader.fragmentShader
	);

	// 1 pass if no prepend
	post_process1.p.prependRenderPass.set(0);
	await CoreSleep.sleep(20);
	composer = camera.postProcessController().composer(canvas)!;
	assert.ok(composer, 'composer exists');
	assert.equal(composer.passes.length, 1, 'composer one pass');
	assert.equal(
		((composer.passes[0] as ShaderPass).material as ShaderMaterial).fragmentShader,
		HorizontalBlurShader.fragmentShader
	);

	// add another pass and add as input to the first one
	const vertical_blur1 = post_process1.createNode('verticalBlur');
	horizontal_blur1.setInput(0, vertical_blur1);
	await CoreSleep.sleep(20);
	composer = camera.postProcessController().composer(canvas)!;
	assert.equal(composer.passes.length, 2, 'composer has two passes');
	assert.equal(
		((composer.passes[1] as ShaderPass).material as ShaderMaterial).fragmentShader,
		HorizontalBlurShader.fragmentShader
	);
	assert.equal(
		((composer.passes[0] as ShaderPass).material as ShaderMaterial).fragmentShader,
		VerticalBlurShader.fragmentShader
	);

	// add another and set the display flag to it
	const unreal_bloom1 = post_process1.createNode('unrealBloom');
	unreal_bloom1.flags.display.set(true);
	composer = camera.postProcessController().composer(canvas)!;
	assert.equal(composer.passes.length, 1, 'composer has one pass');
	assert.equal(
		trimEmptySpace((composer.passes[0] as UnrealBloomPass).compositeMaterial.fragmentShader),
		trimEmptySpace(
			`varyingvec2vUv;uniformsampler2DblurTexture1;uniformsampler2DblurTexture2;uniformsampler2DblurTexture3;uniformsampler2DblurTexture4;uniformsampler2DblurTexture5;uniformsampler2DdirtTexture;uniformfloatbloomStrength;uniformfloatbloomRadius;uniformfloatbloomFactors[NUM_MIPS];uniformvec3bloomTintColors[NUM_MIPS];//uniformboolbloomPremult;floatlerpBloomFactor(constinfloatfactor){floatmirrorFactor=1.2-factor;returnmix(factor,mirrorFactor,bloomRadius);}vec3LUMA=vec3(0.2125,0.7154,0.0721);floatluminance(vec3rgb){returndot(rgb,LUMA);}voidmain(){gl_FragColor=bloomStrength*(lerpBloomFactor(bloomFactors[0])*vec4(bloomTintColors[0],1.0)*texture2D(blurTexture1,vUv)+lerpBloomFactor(bloomFactors[1])*vec4(bloomTintColors[1],1.0)*texture2D(blurTexture2,vUv)+lerpBloomFactor(bloomFactors[2])*vec4(bloomTintColors[2],1.0)*texture2D(blurTexture3,vUv)+lerpBloomFactor(bloomFactors[3])*vec4(bloomTintColors[3],1.0)*texture2D(blurTexture4,vUv)+lerpBloomFactor(bloomFactors[4])*vec4(bloomTintColors[4],1.0)*texture2D(blurTexture5,vUv));//if(bloomPremult){//gl_FragColor.a=luminance(gl_FragColor.rgb);gl_FragColor.a=max(max(gl_FragColor.r,gl_FragColor.g),gl_FragColor.b);//gl_FragColor.rgb*=gl_FragColor.a;//}}`
		)
	);

	// change display flag again
	vertical_blur1.flags.display.set(true);
	composer = camera.postProcessController().composer(canvas)!;
	assert.equal(composer.passes.length, 1, 'composer has one pass');
	assert.equal(
		trimEmptySpace(((composer.passes[0] as ShaderPass).material as ShaderMaterial).fragmentShader),
		trimEmptySpace(VerticalBlurShader.fragmentShader)
	);

	// change display flag again
	horizontal_blur1.flags.display.set(true);
	composer = camera.postProcessController().composer(canvas)!;
	assert.equal(composer.passes.length, 2, 'composer has two passes');
	assert.equal(
		trimEmptySpace(((composer.passes[1] as ShaderPass).material as ShaderMaterial).fragmentShader),
		trimEmptySpace(HorizontalBlurShader.fragmentShader)
	);
	assert.equal(
		trimEmptySpace(((composer.passes[0] as ShaderPass).material as ShaderMaterial).fragmentShader),
		trimEmptySpace(VerticalBlurShader.fragmentShader)
	);

	RendererUtils.dispose();
});
