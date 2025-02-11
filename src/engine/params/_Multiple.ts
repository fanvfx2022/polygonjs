import {StringOrNumber} from '../../types/GlobalTypes';
import {TypedParam} from './_Base';
import {FloatParam} from './Float';
import {ParamType} from '../poly/ParamType';
import {ParamEvent} from '../poly/ParamEvent';
import {ParamInitValueSerializedTypeMap} from './types/ParamInitValueSerializedTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {CoreType} from '../../core/Type';

export abstract class TypedMultipleParam<T extends ParamType> extends TypedParam<T> {
	private _components_contructor = FloatParam;
	protected override _components!: FloatParam[];
	override get components() {
		return this._components;
	}
	override isNumeric() {
		return true;
	}
	override isDefault() {
		for (let c of this.components) {
			if (!c.isDefault()) {
				return false;
			}
		}
		return true;
	}
	override rawInput() {
		return this._components.map((c) => c.rawInput()) as ParamInitValueSerializedTypeMap[T];
	}
	rawInputSerialized() {
		return this._components.map((c) => c.rawInputSerialized()) as ParamInitValueSerializedTypeMap[T];
	}
	protected override _copyValue(param: TypedMultipleParam<T>) {
		for (let i = 0; i < this.components.length; i++) {
			const component = this.components[i];
			const src_component = param.components[i];
			component.copyValue(src_component);
		}
	}

	override initComponents() {
		if (this._components != null) {
			return;
		}
		let index = 0;
		this._components = new Array(this.componentNames().length);
		for (let componentName of this.componentNames()) {
			const component = new this._components_contructor(this.scene(), this.node); //, `${this.name}${name}`);
			let default_val;
			if (CoreType.isArray(this._default_value)) {
				default_val = this._default_value[index];
			} else {
				default_val = (this._default_value as any)[componentName];
			}
			component.options.copy(this.options);
			component.setInitValue(default_val);

			// component.setScene(this.scene);
			component.setName(`${this.name()}${componentName}`);
			component.set_parent_param(this);

			// this.addGraphInput(component, false); // already called in set_parent_param
			// component.initialize();
			this._components[index] = component;
			index++;
		}
		// this.compute();
	}

	protected override async processComputation(): Promise<void> {
		await this.compute_components();
		this.setValueFromComponents();
	}

	abstract setValueFromComponents(): void;
	// set_raw_input_from_components() {}

	override hasExpression() {
		for (let c of this.components) {
			if (c.expressionController?.active()) {
				return true;
			}
		}
		return false;
	}

	private async compute_components() {
		const components = this.components;
		const promises = [];
		for (let c of components) {
			if (c.isDirty()) {
				promises.push(c.compute());
			}
		}
		await Promise.all(promises);
		this.removeDirtyState();
	}
	protected override _prefilterInvalidRawInput(raw_input: any): ParamInitValuesTypeMap[T] {
		if (!CoreType.isArray(raw_input)) {
			const number_or_string = raw_input as number | string;
			const raw_input_wrapped_in_array: StringOrNumber[] = this.componentNames().map(() => number_or_string);
			return raw_input_wrapped_in_array as ParamInitValuesTypeMap[T];
		} else {
			return raw_input as ParamInitValuesTypeMap[T];
		}
	}

	protected override processRawInput() {
		const cooker = this.scene().cooker;
		cooker.block();
		const components = this.components;
		for (let c of components) {
			c.emitController.blockParentEmit();
		}

		// if (CoreType.isArray(values)) {
		const value = this._raw_input;
		let prev_value: number = 0;
		if (CoreType.isArray(value)) {
			for (let i = 0; i < components.length; i++) {
				let component_value = (value as any)[i];
				// use the prev value, in case we give an array that is too short
				if (component_value == null) {
					component_value = prev_value;
				}
				components[i].set(component_value);
				prev_value = component_value;
			}
		} else {
			for (let i = 0; i < components.length; i++) {
				const component_name = this.componentNames()[i];
				let component_value = (value as any)[component_name];
				// use the prev value, in case we give a vec2 instead of vec3
				if (component_value == null) {
					component_value = prev_value;
				}
				components[i].set(component_value);
				prev_value = component_value;
			}
		}
		// } else {
		// 	const component_names = this.componentNames()()
		// 	for (let i = 0; i < components.length; i++) {
		// 		components[i].set(values[component_names[i]])
		// 	}
		// }

		cooker.unblock();

		for (let i = 0; i < components.length; i++) {
			components[i].emitController.unblockParentEmit();
		}
		// this.emit(ParamEvent.UPDATED);

		this.emitController.emit(ParamEvent.VALUE_UPDATED);
	}
}

// class BaseMultipleParam extends TypedMultipleParam<Vector> {}
