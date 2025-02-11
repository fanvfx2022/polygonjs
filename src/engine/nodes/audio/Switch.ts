/**
 * switches between different inputs
 *
 *
 */

import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
class SwitchAudioParamsConfig extends NodeParamsConfig {
	/** @param sets which input is used */
	input = ParamConfig.INTEGER(0, {
		range: [0, 3],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new SwitchAudioParamsConfig();

export class SwitchAudioNode extends TypedAudioNode<SwitchAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'switch';
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 4);
		this.cookController.disallowInputsEvaluation();
	}

	override async cook(inputContents: AudioBuilder[]) {
		const inputIndex = this.pv.input;
		if (this.io.inputs.hasInput(inputIndex)) {
			const container = await this.containerController.requestInputContainer(inputIndex);
			if (container) {
				const audioBuilder = container.coreContent();
				if (audioBuilder) {
					this.setAudioBuilder(audioBuilder);
					return;
				}
			}
		} else {
			this.states.error.set(`no input ${inputIndex}`);
		}
	}
}
