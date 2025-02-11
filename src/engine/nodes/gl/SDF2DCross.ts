/**
 * Function of SDF Cross
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions2d/](https://iquilezles.org/articles/distfunctions2d/)
 */

import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {BaseSDF2DGlNode} from './_BaseSDF2D';

const OUTPUT_NAME = 'float';
class SDF2DCrossGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR2([0, 0], {hidden: true});
	center = ParamConfig.VECTOR2([0, 0]);
	length = ParamConfig.FLOAT(1);
	width = ParamConfig.FLOAT(0.3);
	radius = ParamConfig.FLOAT(0);
}
const ParamsConfig = new SDF2DCrossGlParamsConfig();
export class SDF2DCrossGlNode extends BaseSDF2DGlNode<SDF2DCrossGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDF2DCross';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = this.position();
		const center = ThreeToGl.vector3(this.variableForInputParam(this.p.center));
		const length = ThreeToGl.float(this.variableForInputParam(this.p.length));
		const width = ThreeToGl.float(this.variableForInputParam(this.p.width));
		const radius = ThreeToGl.float(this.variableForInputParam(this.p.radius));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${float} = sdCross(${position} - ${center}, vec2(${length}, ${width}), ${radius})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		this._addSDF2DMethods(shadersCollectionController);
	}
}
