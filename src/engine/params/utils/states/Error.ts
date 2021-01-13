import {BaseParamType} from '../../_Base';
import {ParamEvent} from '../../../poly/ParamEvent';

export class ErrorState {
	private _message: string | undefined;
	constructor(private param: BaseParamType) {}

	set(message: string | undefined) {
		if (this._message != message) {
			this._message = message;
			if (this._message) {
				console.warn(this.param.fullPath(), this._message);
			}
			this.param.emitController.emit(ParamEvent.ERROR_UPDATED);
		}
	}
	message() {
		return this._message;
	}
	clear() {
		this.set(undefined);
	}
	active(): boolean {
		return this._message != null;
	}
}
