/**
 * Allows to create a shader with GLSL nodes to create the texture values.
 *
 *
 */
import {
	Camera,
	Mesh,
	PlaneGeometry,
	WebGLRenderer,
	WebGLRenderTarget,
	ShaderMaterial,
	Scene,
	ClampToEdgeWrapping,
	RGBAFormat,
	LinearFilter,
	NearestFilter,
	LinearEncoding,
	NoToneMapping,
	WebGLArrayRenderTarget,
} from 'three';
import {Number2} from '../../../types/GlobalTypes';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {TypedCopNode} from './_Base';
import {GlobalsGeometryHandler} from '../gl/code/globals/Geometry';
import {GlNodeChildrenMap} from '../../poly/registers/nodes/Gl';
import {BaseGlNodeType} from '../gl/_Base';
import {GlNodeFinder} from '../gl/code/utils/NodeFinder';
import {NodeContext} from '../../poly/NodeContext';
import {IUniforms} from '../../../core/geometry/Material';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {DataTextureController} from './utils/DataTextureController';
import {CopRendererController} from './utils/RendererController';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {Poly} from '../../Poly';
import {TexturePersistedConfig} from '../gl/code/assemblers/textures/TexturePersistedConfig';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {BaseNodeType} from '../_Base';
import {CopType} from '../../poly/registers/nodes/types/Cop';
import {TextureParamsController, TextureParamConfig} from './utils/TextureParamsController';
import {isBooleanTrue} from '../../../core/Type';
import FRAGMENT_SHADER from '../gl/code/templates/textures/Default.frag.glsl';
import VERTEX_SHADER from '../gl/code/templates/textures/Default.vert.glsl';
import {handleCopBuilderDependencies} from './utils/BuilderUtils';

const RESOLUTION_DEFAULT: Number2 = [128, 128];

function Builder2DArrayCopParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param textures resolution */
		resolution = ParamConfig.VECTOR2(RESOLUTION_DEFAULT);
		/** @param layers */
		layers = ParamConfig.INTEGER(4, {
			range: [2, 32],
			rangeLocked: [true, false],
		});
		/** @param use the main camera renderer. This can save memory, but can also lead to colors being affected by the renderer.outputEncoding */
		useCameraRenderer = ParamConfig.BOOLEAN(1, {
			callback: (node: BaseNodeType) => {
				Builder2DArrayCopNode.PARAM_CALLBACK_render(node as Builder2DArrayCopNode);
			},
		});
		/** @param use a data texture instead of a render target, which can be useful when using that texture as and envMap */
		// useDataTexture = ParamConfig.BOOLEAN(0);
		/** @param force Render */
		render = ParamConfig.BUTTON(null, {
			callback: (node: BaseNodeType) => {
				Builder2DArrayCopNode.PARAM_CALLBACK_render(node as Builder2DArrayCopNode);
			},
		});
	};
}
class Builder2DArrayCopParamsConfig extends TextureParamConfig(Builder2DArrayCopParamConfig(NodeParamsConfig)) {}

const ParamsConfig = new Builder2DArrayCopParamsConfig();

export class Builder2DArrayCopNode extends TypedCopNode<Builder2DArrayCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return CopType.BUILDER_2D_ARRAY;
	}
	override readonly persisted_config: TexturePersistedConfig = new TexturePersistedConfig(this);
	protected _assemblerController = this._createAssemblerController();

	public override usedAssembler(): Readonly<AssemblerName.GL_TEXTURE_2D_ARRAY> {
		return AssemblerName.GL_TEXTURE_2D_ARRAY;
	}
	protected _createAssemblerController() {
		const assemblerController = Poly.assemblersRegister.assembler(this, this.usedAssembler());
		if (assemblerController) {
			const globalsHandler = new GlobalsGeometryHandler();
			assemblerController.setAssemblerGlobalsHandler(globalsHandler);
			return assemblerController;
		}
	}

	assemblerController() {
		return this._assemblerController;
	}

	private _textureMesh: Mesh = new Mesh(new PlaneGeometry(2, 2));
	private _fragmentShader: string | undefined;
	private _uniforms: IUniforms | undefined;
	public readonly textureMaterial: ShaderMaterial = new ShaderMaterial({
		uniforms: {},
		vertexShader: VERTEX_SHADER,
		fragmentShader: FRAGMENT_SHADER,
	});
	private _textureScene: Scene = new Scene();
	private _textureCamera: Camera = new Camera();
	private _renderTarget: WebGLArrayRenderTarget | undefined;
	private _dataTextureController: DataTextureController | undefined;
	private _rendererController: CopRendererController | undefined;

	public readonly textureParamsController: TextureParamsController = new TextureParamsController(this);
	protected override _childrenControllerContext = NodeContext.GL;
	override initializeNode() {
		this._textureMesh.material = this.textureMaterial;
		this._textureMesh.scale.multiplyScalar(0.25);
		this._textureScene.add(this._textureMesh);
		this._textureCamera.position.z = 1;

		// this ensures the builder recooks when its children are changed
		// and not just when a material that use it requests it
		this.addPostDirtyHook('_cook_main_without_inputs_when_dirty', () => {
			setTimeout(this._cook_main_without_inputs_when_dirty_bound, 0);
		});

		// this.dirtyController.addPostDirtyHook(
		// 	'_reset_if_resolution_changed',
		// 	this._reset_if_resolution_changed.bind(this)
		// );
		// this.params.onParamsCreated('reset', () => {
		// 	this._reset();
		// });
	}

	override createNode<S extends keyof GlNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): GlNodeChildrenMap[S];
	override createNode<K extends valueof<GlNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<GlNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseGlNodeType[];
	}
	override nodesByType<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][] {
		return super.nodesByType(type) as GlNodeChildrenMap[K][];
	}
	override childrenAllowed() {
		if (this.assemblerController()) {
			return super.childrenAllowed();
		}
		this.scene().markAsReadOnly(this);
		return false;
	}

	private _cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
	private async _cook_main_without_inputs_when_dirty() {
		await this.cookController.cookMainWithoutInputs();
	}

	// private _reset_if_resolution_changed(trigger?: CoreGraphNode) {
	// 	if (trigger && trigger.graphNodeId() == this.p.resolution.graphNodeId()) {
	// 		this._reset();
	// 	}
	// }

	override async cook() {
		this.compileIfRequired();
		await this._renderOnTarget(true);
	}

	shaders_by_name() {
		return {
			fragment: this._fragmentShader,
		};
	}

	compileIfRequired() {
		if (this.assemblerController()?.compileRequired()) {
			try {
				this.compile();
			} catch (err) {
				const message = (err as any).message || 'failed to compile';
				this.states.error.set(message);
			}
		}
	}
	private compile() {
		const assemblerController = this.assemblerController();
		if (!assemblerController) {
			return;
		}
		const outputNodes: BaseGlNodeType[] = GlNodeFinder.findOutputNodes(this);
		if (outputNodes.length == 0) {
			this.states.error.set('one output node is required');
			return;
		}
		if (outputNodes.length > 1) {
			this.states.error.set('only one output node allowed');
			return;
		}
		const outputNode = outputNodes[0];
		if (outputNode) {
			//const param_nodes = GlNodeFinder.find_param_generating_nodes(this);
			const rootNodes = outputNodes; //.concat(param_nodes);
			assemblerController.assembler.set_root_nodes(rootNodes);

			// main compilation
			assemblerController.assembler.updateFragmentShader();

			// receives fragment and uniforms
			const fragmentShader = assemblerController.assembler.fragment_shader();
			const uniforms = assemblerController.assembler.uniforms();
			if (fragmentShader && uniforms) {
				this._fragmentShader = fragmentShader;
				this._uniforms = uniforms;
			}

			handleCopBuilderDependencies({
				node: this,
				timeDependent: assemblerController.assembler.uniformsTimeDependent(),
				uniforms: undefined,
			});
		}
		if (this._fragmentShader && this._uniforms) {
			this.textureMaterial.fragmentShader = this._fragmentShader;
			this.textureMaterial.uniforms = this._uniforms;
			this.textureMaterial.needsUpdate = true;
			this.textureMaterial.uniforms.resolution = {
				value: this.pv.resolution,
			};
		}
		assemblerController.post_compile();
	}

	callbackName() {
		return `cop/builder3D_${this.graphNodeId()}`;
	}
	// private _uniformCallbackName() {
	// 	return `cop/builder_uniforms_${this.graphNodeId()}`;
	// }
	override dispose() {
		super.dispose();
		this._renderTarget?.dispose();
		this._renderer?.dispose();
		this.removeCallbacks();
	}
	public removeCallbacks() {
		const scene = this.scene();
		// scene.uniformsController.removeTimeUniform(uniforms);
		scene.unRegisterOnBeforeTick(this.callbackName());
	}

	//
	//
	// RENDER + RENDER TARGET
	//
	//
	public readonly boundRenderOnTarget = this.renderOnTargetWithoutUpdatingTextureFromParams.bind(this);
	async renderOnTargetWithoutUpdatingTextureFromParams() {
		this._renderOnTarget(false);
	}
	private async _renderOnTarget(updateTextureFromParams: boolean) {
		await this.createRenderTargetIfRequired();
		await this._createRendererIfRequired();

		if (this.states.error.active()) {
			return;
		}
		if (!this._renderer) {
			console.warn('no renderer');
			return;
		}
		if (!this._uniforms) {
			return;
		}

		this._saveRendererState(this._renderer);
		this._prepareRenderer(this._renderer);
		const layersCount = this.pv.layers;
		for (let i = 0; i < layersCount; i++) {
			this._uniforms.uLayer.value = i;
			this._setRenderLayer(this._renderer, i);
			this._renderer.render(this._textureScene, this._textureCamera);
		}
		await this._postRender(updateTextureFromParams);
		this._restoreRendererState(this._renderer);
	}
	private async _postRender(updateTextureFromParams: boolean) {
		if (this._renderTarget?.texture) {
			// if (isBooleanTrue(this.pv.useDataTexture) && this._renderTarget && this._renderer) {
			// 	this._dataTextureController = this._dataTextureController || new DataTextureController();
			// 	const texture = this._dataTextureController.fromRenderTarget(this._renderer, this._renderTarget);
			// 	if (updateTextureFromParams) {
			// 		await this.textureParamsController.update(texture);
			// 	}
			// 	this.setTexture(texture);
			// } else {
			const texture = this._renderTarget.texture;
			if (updateTextureFromParams) {
				// await this.textureParamsController.update(texture);
			}
			this.setTexture(texture);
			// }
		} else {
			this.cookController.endCook();
		}
	}
	private _prevTarget: WebGLRenderTarget | null = null;
	private _prevOutputEncoding: number = -1;
	private _prevToneMapping: number = -1;
	private _saveRendererState(renderer: WebGLRenderer) {
		this._prevTarget = renderer.getRenderTarget();
		this._prevOutputEncoding = renderer.outputEncoding;
		this._prevToneMapping = renderer.toneMapping;
	}
	private _prepareRenderer(renderer: WebGLRenderer) {
		if (!this._renderTarget) {
			console.warn('no render target');
			return;
		}
		renderer.outputEncoding = LinearEncoding;
		renderer.toneMapping = NoToneMapping;
	}
	private _setRenderLayer(renderer: WebGLRenderer, layer: number) {
		if (!this._renderTarget) {
			console.warn('no render target');
			return;
		}
		renderer.setRenderTarget(this._renderTarget, layer);
		renderer.clear();
	}
	private _restoreRendererState(renderer: WebGLRenderer) {
		renderer.setRenderTarget(this._prevTarget);
		renderer.outputEncoding = this._prevOutputEncoding;
		renderer.toneMapping = this._prevToneMapping;
	}
	/*
	 *
	 * RENDERER
	 *
	 */
	private _renderer: WebGLRenderer | undefined;
	private async _createRendererIfRequired() {
		if (this._renderer) {
			return;
		}
		if (isBooleanTrue(this.pv.useCameraRenderer)) {
			this._rendererController = this._rendererController || new CopRendererController(this);
			this._renderer = await this._rendererController.waitForRenderer();
		} else {
			this._renderer = Poly.renderersController.linearRenderer();
		}
	}
	private _resetRenderer() {
		this._renderer = undefined;
	}
	renderer() {
		return this._renderer;
	}
	/*
	 *
	 * RENDER TARGET
	 *
	 */
	async renderTarget() {
		return (this._renderTarget =
			this._renderTarget ||
			(await this._createRenderTarget(this.pv.resolution.x, this.pv.resolution.y, this.pv.layers)));
	}
	private async createRenderTargetIfRequired() {
		if (!this._renderTarget || !this._renderTargetResolutionValid()) {
			this._renderTarget = await this._createRenderTarget(
				this.pv.resolution.x,
				this.pv.resolution.y,
				this.pv.layers
			);
			this._dataTextureController?.reset();
		}
	}
	private _renderTargetResolutionValid() {
		if (this._renderTarget) {
			const image = this._renderTarget.texture.image;
			if (image.width != this.pv.resolution.x || image.height != this.pv.resolution.y) {
				return false;
			} else {
				return true;
			}
		} else {
			return false;
		}
	}

	private async _createRenderTarget(width: number, height: number, depth: number) {
		if (this._renderTarget) {
			const image = this._renderTarget.texture.image;
			console.log(image);
			if (image.width == width && image.height == height && image.depth == depth) {
				return this._renderTarget;
			}
		}

		const wrapS = ClampToEdgeWrapping;
		const wrapT = ClampToEdgeWrapping;

		const minFilter = LinearFilter;
		const magFilter = NearestFilter;

		const renderTarget = new WebGLArrayRenderTarget(width, height, depth);
		renderTarget.texture.wrapS = wrapS;
		renderTarget.texture.wrapT = wrapT;
		renderTarget.texture.minFilter = minFilter;
		renderTarget.texture.magFilter = magFilter;
		renderTarget.texture.format = RGBAFormat;
		renderTarget.stencilBuffer = false;
		renderTarget.depthBuffer = false;

		// await this.textureParamsController.update(renderTarget.texture);
		Poly.warn(`${this.path()}: created WebGLArrayRenderTarget`, this.path(), width, height, depth);
		return renderTarget;
	}

	/*
	 *
	 * CALLBACK
	 *
	 */
	static PARAM_CALLBACK_render(node: Builder2DArrayCopNode) {
		node._renderOnTarget(true);
	}
	static PARAM_CALLBACK_resetRenderer(node: Builder2DArrayCopNode) {
		node._resetRenderer();
	}
}
