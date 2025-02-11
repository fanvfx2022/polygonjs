/**
 * Allows to switch between different inputs.
 *
 *
 *
 */

import {TypedSopNode} from './_Base';

const INPUT_NAME = 'geometry to switch to';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
class SwitchSopParamsConfig extends NodeParamsConfig {
	/** @param sets which input is used */
	input = ParamConfig.INTEGER(0, {
		range: [0, 3],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new SwitchSopParamsConfig();

export class SwitchSopNode extends TypedSopNode<SwitchSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'switch';
	}

	static override displayedInputNames(): string[] {
		return [INPUT_NAME, INPUT_NAME, INPUT_NAME, INPUT_NAME];
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 4);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
		// this.uiData.set_icon('code-branch');

		this.cookController.disallowInputsEvaluation();
	}

	override async cook() {
		const inputIndex = this.pv.input;
		if (this.io.inputs.hasInput(inputIndex)) {
			const container = await this.containerController.requestInputContainer(inputIndex);
			if (container) {
				const coreGroup = container.coreContent();
				if (coreGroup) {
					this.setCoreGroup(coreGroup);
					return;
				}
			}
		} else {
			this.states.error.set(`no input ${inputIndex}`);
		}
		this.cookController.endCook();
	}
}
