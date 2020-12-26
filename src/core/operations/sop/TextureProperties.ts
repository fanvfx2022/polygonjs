import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../geometry/Group';
import {Mesh} from 'three/src/objects/Mesh';
import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {Poly} from '../../../engine/Poly';

import {MAG_FILTER_DEFAULT_VALUE, MIN_FILTER_DEFAULT_VALUE} from '../../../core/cop/ConstantFilter';
interface TexturePropertiesSopParams extends DefaultOperationParams {
	apply_to_children: boolean;
	// anisotropy
	tanisotropy: boolean;
	use_renderer_max_anisotropy: boolean;
	anisotropy: number;
	// filters
	tmin_filter: boolean;
	min_filter: number;
	tmag_filter: boolean;
	mag_filter: number;
}

export class TexturePropertiesSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: TexturePropertiesSopParams = {
		apply_to_children: false,
		// anisotropy
		tanisotropy: false,
		use_renderer_max_anisotropy: false,
		anisotropy: 1,
		// filters
		tmin_filter: false,
		min_filter: MIN_FILTER_DEFAULT_VALUE,
		tmag_filter: false,
		mag_filter: MAG_FILTER_DEFAULT_VALUE,
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'textureProperties'> {
		return 'textureProperties';
	}

	async cook(input_contents: CoreGroup[], params: TexturePropertiesSopParams) {
		const core_group = input_contents[0];

		const objects: Mesh[] = [];
		for (let object of core_group.objects() as Mesh[]) {
			if (params.apply_to_children) {
				object.traverse((child) => {
					objects.push(child as Mesh);
				});
			} else {
				objects.push(object);
			}
		}
		const promises = objects.map((object) => this._update_object(object, params));
		await Promise.all(promises);
		return core_group;
	}
	private async _update_object(object: Mesh, params: TexturePropertiesSopParams) {
		const material = object.material as Material;
		if (material) {
			await this._update_material(material, params);
		}
	}
	private async _update_material(material: Material, params: TexturePropertiesSopParams) {
		let texture: Texture = (material as any).map;
		if (texture) {
			await this._update_texture(texture, params);
		}
	}
	private async _update_texture(texture: Texture, params: TexturePropertiesSopParams) {
		if (params.tanisotropy) {
			await this._update_anisotropy(texture, params);
		}
		if (params.tminfilter || params.tmaxfilter) {
			this._update_filter(texture, params);
		}
	}

	private async _update_anisotropy(texture: Texture, params: TexturePropertiesSopParams) {
		if (params.use_renderer_max_anisotropy) {
			const renderer = await Poly.instance().renderers_controller.first_renderer();
			if (renderer) {
				texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
			}
		} else {
			texture.anisotropy = params.anisotropy;
		}
	}
	private _update_filter(texture: Texture, params: TexturePropertiesSopParams) {
		if (params.tminfilter) {
			texture.minFilter = params.min_filter;
		}
		if (params.tmagfilter) {
			texture.magFilter = params.mag_filter;
		}
	}
}
