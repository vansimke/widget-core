/**
 * This module contains functional enhancements to the widgets package which are used in more
 * than one module.
 */

import { List } from 'immutable';
import { Handle } from 'dojo-core/interfaces';
import { Parent, Child, ChildrenMap } from '../mixins/interfaces';
import { Projector, isProjector } from '../projector';

/**
 * The valid values for referring to a position for an insertion in a list/array
 */
export type Position = number | 'first' | 'last' | 'before' | 'after';

/**
 * A function that resolves the Projector for a given Child.
 *
 * @param child The child that is the subject of the function
 * @return The projector of the child (or undefined)
 */
export function getProjector(child: Child): Projector | undefined {
	while (child && child.parent) {
		child = <Child> <any> child.parent;
	}
	return isProjector(child) && child;
}

/**
 * A utility function that generates a handle that destroys any children
 *
 * @param parent The parent that the handle relates to
 * @param child The child (or array of children) that the handle relates to
 */
export function getRemoveHandle<C extends Child>(parent: Parent, child: C | C[] | ChildrenMap<C>): Handle {
	function getDestroyHandle(c: Child): Handle {
		let destroyed = false;
		return c.own({
			destroy() {
				if (destroyed) {
					return;
				}
				const { children } = parent;
				if (children.includes(c)) {
					parent.children = isList(children) ? children.delete(children.lastIndexOf(c)) : children.delete(children.keyOf(c));
				}
				destroyed = true;
				if (c.parent === parent) {
					c.parent = undefined;
				}
			}
		});
	}

	let destroyed = false;

	if (Array.isArray(child)) {
		const handles = child.map((c) => getDestroyHandle(c));
		return {
			destroy() {
				if (destroyed) {
					return;
				}
				handles.forEach(({ destroy }) => destroy());
				destroyed = true;
			}
		};
	}
	else if (isChild(child)) {
		const handle = getDestroyHandle(child);
		return {
			destroy() {
				handle.destroy();
			}
		};
	}
	else {
		const handles: Handle[] = [];
		for (let key in child) {
			handles.push(getDestroyHandle(child[key]));
		}
		return {
			destroy() {
				if (destroyed) {
					return;
				}
				handles.forEach(({ destroy }) => destroy());
				destroyed = true;
			}
		};
	}
}

/**
 * An internal function that resolves the index in a list or an array when provided with a
 * position reference
 *
 * @param list The list or array that the index should be determined for
 * @param position The posistion in the list or array
 * @param reference If relative posistion (`before` or `after`) the item that the index is relative to
 */
function getIndex<T>(list: List<T> | T[], position: Position, reference?: T): number {
	let idx: number;
	if (typeof position === 'number') {
		idx = position;
		const size = Array.isArray(list) ? list.length : list.size;
		if (idx < 0 || idx > size) {
			throw new Error('position is out of range');
		}
	}
	else {
		switch (position) {
		case 'first':
			idx = 0;
			break;
		case 'last':
			idx = Array.isArray(list) ? list.length : list.size;
			break;
		case 'before':
			idx = list.indexOf(reference);
			if (idx === -1) {
				throw new Error('reference not contained in this list');
			}
			break;
		case 'after':
			idx = list.indexOf(reference) + 1;
			if (idx === 0) {
				throw new Error('reference not contained in this list');
			}
			break;
		default:
			throw Error(`Invalid position "${position}"`);
		}
	}
	return idx;
}

/**
 * Insert an item into an array at the provided posistion
 *
 * **NOTE**: This does mutate the passed array
 *
 * @param array The array that is the source
 * @param item The item to insert
 * @param position The position in the array to insert the item
 * @param reference If the position is a relative position ('before' or 'after') then the reference
 *                  that that posistion refers to
 * @return The original array with the item inserted
 */
export function insertInArray<T>(array: T[], item: T, position: Position, reference?: T): T[] {
	array.splice(getIndex(array, position, reference), 0, item);
	return array;
}

/**
 * Insert an item into a immutable List at the provided posistion
 *
 * @param list The list that is the source
 * @param item The item to insert
 * @param position The position in the list to insert the item
 * @param reference If the position is a relative position ('before' or 'after') then the reference
 *                  that that posistion refers to
 * @return A new list with the inserted
 */
export function insertInList<T>(list: List<T>, item: T, position: Position, reference?: T): List<T> {
	return list.insert(getIndex(list, position, reference), item);
}

/**
 * A type guard that checks to see if the value is a Child
 *
 * @param value the value to guard for
 */
export function isChild<C extends Child>(value: any): value is C {
	return value && typeof value === 'object' && typeof value.render === 'function';
}

/**
 * A type guard that deterimines if a value is an immutable List or not
 *
 * @param value The value to guard for
 */
export function isList<T>(value: any): value is List<T> {
	return value instanceof List;
}

/**
 * Internal function which converts serialised values of certain objects back into
 * their native JavaScript representations
 *
 * @param key The key that needs to be revived
 * @param value The value which may contain a special string which represents a serialised object
 */
function valueReviver(key: string, value: any): any {
	if (value.toString().indexOf('__RegExp(') === 0) {
		const [ , regExpStr ] = value.match(/__RegExp\(([^\)]*)\)/);
		const [ , regExp, flags ] = regExpStr.match(/^\/(.*?)\/([gimy]*)$/);
		return new RegExp(regExp, flags);
	}
	return value;
}

/**
 * Function to convert a string to the likely more complex value stored in state
 *
 * @param str The string to convert to a state value
 */
export function stringToValue(str: string): any {
	try {
		const value = JSON.parse(str, valueReviver);
		return value;
	}
	catch (e) {
		if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(str)) {
			return Number(str);
		}
		if (str) {
			return str;
		}
		return undefined;
	}
}

/**
 * Internal function which converts certain values into serialised strings which can
 * be revived back to their original JavaScript value.
 *
 * @param key The name of the key
 * @param value The value to be serialised
 */
function valueReplacer(key: string, value: any): any {
	if (value instanceof RegExp) {
		return (`__RegExp(${value.toString()})`);
	}
	return value;
}

/**
 * Function to convert a state value to a string
 *
 * @param value The value to be converted
 */
export function valueToString(value: any): string {
	return value
		? Array.isArray(value) || typeof value === 'object'
			? JSON.stringify(value, valueReplacer) : String(value)
		: value === 0
			? '0' : value === false
				? 'false' : '';
}
