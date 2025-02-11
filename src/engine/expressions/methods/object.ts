/**
 * Returns the value of an object attribute
 *
 * @remarks
 * It takes 3 arguments.
 *
 * object(<input_index_or_node_path\>, <attrib_name\>, <object_index\>)
 *
 * - **<input_index_or_node_path\>** is a number or a string
 * - **<attrib_name\>** is a string, the name of the attribute
 * - **<object_index\>** index of the object to fetch
 *
 * ## Usage
 *
 * - `object(0, 'pscale', 0)` - returns the pscale attribute value of the first object of the first input
 *
 */
import {BaseMethodFindDependencyArgs} from './_Base';
import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {GeometryContainer} from '../../containers/Geometry';

const EXPECTED_ARGS_COUNT = 3;
export class ObjectExpression extends BaseMethod {
	protected override _requireDependency = true;
	static override requiredArguments() {
		return [
			['string', 'path to node'],
			['string', 'attribute name'],
			['index', 'object index'],
		];
	}

	override findDependency(args: BaseMethodFindDependencyArgs): MethodDependency | null {
		return this.createDependencyFromIndexOrPath(args);
	}

	override processArguments(args: any[]): Promise<any> {
		return new Promise(async (resolve, reject) => {
			if (args.length == EXPECTED_ARGS_COUNT) {
				const index_or_path = args[0];
				const attrib_name = args[1];
				const object_index = args[2];
				let container: GeometryContainer | null = null;
				try {
					container = (await this.getReferencedNodeContainer(index_or_path)) as GeometryContainer;
				} catch (e) {
					reject(e);
				}
				if (container) {
					const value = this._get_value_from_container(container, attrib_name, object_index);
					resolve(value);
				}
			} else {
				console.warn(`${args.length} given when expected ${EXPECTED_ARGS_COUNT}`);
				resolve(0);
			}
		});
	}

	_get_value_from_container(container: GeometryContainer, attrib_name: string, point_index: number) {
		const core_group = container.coreContent();
		if (core_group) {
			const coreObject = core_group.coreObjects()[point_index];

			if (coreObject) {
				return coreObject.attribValue(attrib_name);
			} else {
				return 0;
			}
		} else {
			return null;
		}
	}
}
