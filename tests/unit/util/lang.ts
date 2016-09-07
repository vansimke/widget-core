import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { Handle } from 'dojo-core/interfaces';
import Promise from 'dojo-shim/Promise';
import { List } from 'immutable';
import { VNode, Projector as MaquetteProjector } from 'maquette';
import createRenderable from '../../../src/mixins/createRenderable';
import { Projector, ProjectorState } from '../../../src/projector';
import {
	insertInList,
	insertInArray,
	stringToValue,
	valueToString,
	isList,
	isChild,
	getRemoveHandle,
	getProjector
} from '../../../src/util/lang';

registerSuite({
	name: 'util/lang',

	'insertInArray()': {
		'position "before"'() {
			const first = {};
			const last = {};
			const list = [ first, last ];
			const item = {};
			const result = insertInArray(list, item, 'before', last);
			assert.strictEqual(result.length, 3);
			assert.strictEqual(result[0], first);
			assert.strictEqual(result[1], item);
			assert.strictEqual(result[2], last);
			assert.strictEqual(list, result);
		},
		'position "after"'() {
			const first = {};
			const last = {};
			const list = [ first, last ];
			const item = {};
			const result = insertInArray(list, item, 'after', first);
			assert.strictEqual(result.length, 3);
			assert.strictEqual(result[0], first);
			assert.strictEqual(result[1], item);
			assert.strictEqual(result[2], last);
			assert.strictEqual(list, result);
		},
		'position "first"'() {
			const first = {};
			const last = {};
			const list = [ first, last ];
			const item = {};
			const result = insertInArray(list, item, 'first');
			assert.strictEqual(result.length, 3);
			assert.strictEqual(result[0], item);
			assert.strictEqual(result[1], first);
			assert.strictEqual(result[2], last);
			assert.strictEqual(list, result);
		},
		'position "last"'() {
			const first = {};
			const last = {};
			const list = [ first, last ];
			const item = {};
			const result = insertInArray(list, item, 'last');
			assert.strictEqual(result.length, 3);
			assert.strictEqual(result[0], first);
			assert.strictEqual(result[1], last);
			assert.strictEqual(result[2], item);
			assert.strictEqual(list, result);
		},
		'position number'() {
			const first = {};
			const last = {};
			const list = [ first, last ];
			const item = {};
			const result = insertInArray(list, item, 1);
			assert.strictEqual(result.length, 3);
			assert.strictEqual(result[0], first);
			assert.strictEqual(result[1], item);
			assert.strictEqual(result[2], last);
			assert.strictEqual(list, result);
		},
		'throws': {
			'invalid position'() {
				assert.throws(() => {
					insertInArray([], {}, <any> undefined);
				}, Error);
			},
			'invalid before reference'() {
				assert.throws(() => {
					insertInArray([], {}, 'before', {});
				}, Error);
			},
			'invalid after reference'() {
				assert.throws(() => {
					insertInArray([], {}, 'after', {});
				}, Error);
			},
			'invalid number position'() {
				assert.throws(() => {
					insertInArray([], {}, -1);
				}, Error);
				assert.throws(() => {
					insertInArray([], {}, 2);
				}, Error);
				assert.throws(() => {
					insertInArray([], {}, Infinity);
				}, Error);
			}
		}
	},

	'insertInList()': {
		'position "before"'() {
			const first = {};
			const last = {};
			const list = List([ first, last ]);
			const item = {};
			const result = insertInList(list, item, 'before', last);
			assert.strictEqual(result.size, 3);
			assert.strictEqual(result.get(0), first);
			assert.strictEqual(result.get(1), item);
			assert.strictEqual(result.get(2), last);
		},
		'position "after"'() {
			const first = {};
			const last = {};
			const list = List([ first, last ]);
			const item = {};
			const result = insertInList(list, item, 'after', first);
			assert.strictEqual(result.size, 3);
			assert.strictEqual(result.get(0), first);
			assert.strictEqual(result.get(1), item);
			assert.strictEqual(result.get(2), last);
		},
		'position "last"'() {
			const first = {};
			const last = {};
			const list = List([ first, last ]);
			const item = {};
			const result = insertInList(list, item, 'last');
			assert.strictEqual(result.size, 3);
			assert.strictEqual(result.get(0), first);
			assert.strictEqual(result.get(1), last);
			assert.strictEqual(result.get(2), item);
		},
		'position "first"'() {
			const first = {};
			const last = {};
			const list = List([ first, last ]);
			const item = {};
			const result = insertInList(list, item, 'first');
			assert.strictEqual(result.size, 3);
			assert.strictEqual(result.get(0), item);
			assert.strictEqual(result.get(1), first);
			assert.strictEqual(result.get(2), last);
		},
		'position number'() {
			const first = {};
			const last = {};
			const list = List([ first, last ]);
			const item = {};
			const result = insertInList(list, item, 1);
			assert.strictEqual(result.size, 3);
			assert.strictEqual(result.get(0), first);
			assert.strictEqual(result.get(1), item);
			assert.strictEqual(result.get(2), last);
		},
		'throws': {
			'invalid position'() {
				assert.throws(() => {
					insertInList(List(), {}, <any> undefined);
				}, Error);
			},
			'invalid before reference'() {
				assert.throws(() => {
					insertInList(List(), {}, 'before', {});
				}, Error);
			},
			'invalid after reference'() {
				assert.throws(() => {
					insertInList(List(), {}, 'after', {});
				}, Error);
			},
			'invalid number position'() {
				assert.throws(() => {
					insertInList(List(), {}, -1);
				}, Error);
				assert.throws(() => {
					insertInList(List(), {}, 2);
				}, Error);
				assert.throws(() => {
					insertInList(List(), {}, Infinity);
				}, Error);
			}
		}
	},

	'getProjector()'() {
		const projectorShim: Projector = {
			projector: <MaquetteProjector> { scheduleRender() {} },
			emit() { },
			on(): Handle { return; },
			own(): Handle { return; },
			destroy(): Promise<boolean> { return; },
			listeners: {},
			children: <List<any>> null,
			append(): Handle { return; },
			clear() {},
			insert(): Handle { return; },
			getNodeAttributes(): any { return; },
			render(): VNode { return; },
			attach(): Promise<Handle> { return; },
			invalidate(): void {},
			setRoot(): void {},
			root: null,
			document: <Document> null,
			state: <ProjectorState> null
		};
		const projector = getProjector({
			parent: { children: <List<any>> null, append(): Handle { return; }, parent: projectorShim },
			own(): Handle { return; },
			destroy(): Promise<boolean> { return; },
			render(): VNode { return; },
			tagName: ''
		});

		assert.strictEqual(projector, projectorShim);
	},

	'getRemoveHandle()': {
		'single child'() {
			const parent = { children: List<any>(), append(): Handle { return; } };
			const child = {
				parent,
				own(handle: Handle): Handle { return handle; },
				destroy(): Promise<boolean> {
					return Promise.resolve(true);
				},
				render(): VNode { return; },
				tagName: ''
			};
			child.parent.children = child.parent.children.push(child);
			const handle = getRemoveHandle(parent, child);
			assert.strictEqual(child.parent, parent);
			assert.isTrue(child.parent.children.includes(child));
			handle.destroy();
			assert.isUndefined(child.parent);
			handle.destroy();
		},

		'child array'() {
			const parent = { children: List<any>(), append(): Handle { return; } };
			const child = {
				parent,
				own(handle: Handle): Handle { return handle; },
				destroy(): Promise<boolean> {
					return Promise.resolve(true);
				},
				render(): VNode { return; },
				tagName: ''
			};
			child.parent.children = child.parent.children.push(child);
			const handle = getRemoveHandle(parent, [ child ]);
			assert.strictEqual(child.parent, parent);
			assert.isTrue(child.parent.children.includes(child));
			handle.destroy();
			assert.isUndefined(child.parent);
			handle.destroy();
		},

		'child map'() {
			const parent = { children: List<any>(), append(): Handle { return; } };
			const child = {
				parent,
				own(handle: Handle): Handle { return handle; },
				destroy(): Promise<boolean> {
					return Promise.resolve(true);
				},
				render(): VNode { return; },
				tagName: ''
			};
			child.parent.children = child.parent.children.push(child);
			const handle = getRemoveHandle(parent, { child });
			assert.strictEqual(child.parent, parent);
			assert.isTrue(child.parent.children.includes(child));
			handle.destroy();
			assert.isUndefined(child.parent);
			handle.destroy();
		}
	},

	'isList()'() {
		const list = List();
		const arr: any[] = [];
		assert.isTrue(isList(list));
		assert.isFalse(isList(arr));
	},

	'isChild()'() {
		const child = createRenderable();
		const notChild = {};
		assert.isTrue(isChild(child));
		assert.isFalse(isChild(notChild));
	},

	'stringToValue()'() {
		assert.isUndefined(stringToValue(''), 'emtpy string returns undefined');
		assert.deepEqual(stringToValue('["foo",true,2]'), [ 'foo', true, 2 ]);
		assert.deepEqual(stringToValue('{"foo":{"bar":true},"bar":[1,2,3]}'), {
			foo: { bar: true },
			bar: [ 1, 2, 3 ]
		});
		assert.strictEqual(stringToValue('{foo: "bar"}'), '{foo: "bar"}');
		assert.strictEqual(stringToValue('1'), 1);
		assert.strictEqual(stringToValue('0'), 0);
		assert.strictEqual(stringToValue('Infinity'), Infinity);
		assert.strictEqual(stringToValue('3.141592'), 3.141592);
		assert.strictEqual(stringToValue('-2.12345'), -2.12345);
		assert.instanceOf(stringToValue('{"foo":"__RegExp(/foo/g)"}').foo, RegExp);
		assert.isTrue(stringToValue('true'));
		assert.isFalse(stringToValue('false'));
	},

	'valueToString()'() {
		assert.strictEqual(valueToString({ foo: 2 }), '{"foo":2}');
		assert.strictEqual(valueToString([ 1, 2, 3 ]), '[1,2,3]');
		assert.strictEqual(valueToString(1.23), '1.23');
		assert.strictEqual(valueToString(undefined), '');
		assert.strictEqual(valueToString(null), '');
		assert.strictEqual(valueToString(NaN), '');
		assert.strictEqual(valueToString(Infinity), 'Infinity');
		assert.strictEqual(valueToString({ foo: /foo/g }), '{"foo":"__RegExp(/foo/g)"}');
		assert.strictEqual(valueToString(0), '0');
		assert.strictEqual(valueToString(true), 'true');
		assert.strictEqual(valueToString(false), 'false');
	}
});
