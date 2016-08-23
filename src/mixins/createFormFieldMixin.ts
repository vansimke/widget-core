import { VNodeProperties } from 'maquette/maquette';
import compose, { ComposeFactory } from 'dojo-compose/compose';
import { EventedListener, TargettedEventObject } from 'dojo-compose/mixins/createEvented';
import createStateful, { Stateful, State, StatefulOptions } from 'dojo-compose/mixins/createStateful';
import { Handle } from 'dojo-core/interfaces';
import { assign } from 'dojo-core/lang';
import createCachedRenderMixin, { CachedRenderMixin, CachedRenderState, NodeAttributeFunction } from './createCachedRenderMixin';
import createCancelableEvent, { CancelableEvent } from '../util/createCancelableEvent';
import { stringToValue, valueToString } from '../util/lang';

export interface FormFieldMixinOptions<V, S extends FormFieldMixinState<V>> extends StatefulOptions<S> {
	type?: string;
	value?: V;
}

export interface FormFieldMixinState<V> extends State, CachedRenderState {
	/**
	 * The form widget's name
	 */
	name?: string;

	/**
	 * The current value
	 */
	value?: V;

	/**
	 * Whether the field is currently disabled or not
	 */
	disabled?: boolean;
}

export interface ValueChangeEvent<V> extends CancelableEvent<'valuechange', FormFieldMixin<V, FormFieldMixinState<V>>> {
	type: 'valuechange';
	oldValue: string;
	value: string;
}

export interface FormField<V> {
	/**
	 * The HTML type for this widget
	 */
	type?: string;

	/**
	 * The string value of this form widget, which is read from the widget state
	 */
	value?: string;

	nodeAttributes: NodeAttributeFunction[];

	on?(type: 'valuechange', listener: EventedListener<ValueChangeEvent<V>>): Handle;
	on?(type: string, listener: EventedListener<TargettedEventObject>): Handle;
}

/**
 * Provide form specific node attributes
 */
function formNodeAttributes(this: FormFieldMixin<any, FormFieldMixinState<any>>) {
	const props: VNodeProperties = Object.create(null);

	if (this.type) {
		props['type'] = this.type;
	}
	/* value should always be copied */
	props.value = this.value;
	if ('name' in this.state) {
		props.name = this.state.name;
	}
	if (this.state.disabled) {
		props['disabled'] = 'disabled';
	}

	return props;
}

export type FormFieldMixin<V, S extends FormFieldMixinState<V>> = FormField<V> & Stateful<S> & CachedRenderMixin<S>;

export interface FormMixinFactory extends ComposeFactory<FormFieldMixin<any, FormFieldMixinState<any>>, FormFieldMixinOptions<any, FormFieldMixinState<any>>> {
	<V>(options?: FormFieldMixinOptions<V, FormFieldMixinState<V>>): FormFieldMixin<V, FormFieldMixinState<V>>;
}

const createFormMixin: FormMixinFactory = compose({
		get value(this: FormFieldMixin<any, FormFieldMixinState<any>>): string {
			return valueToString(this.state.value);
		},

		set value(this: FormFieldMixin<any, FormFieldMixinState<any>>, value: string) {
			if (value !== this.state.value) {
				const event = assign(createCancelableEvent({
					type: 'valuechange',
					target: this
				}), {
					oldValue: valueToString(this.state.value),
					value
				});
				this.emit(event);
				if (!event.defaultPrevented) {
					this.setState({ value: stringToValue(event.value) });
				}
			}
		},

		nodeAttributes: [ formNodeAttributes ]
	}, (instance: FormField<any>, options: FormFieldMixinOptions<any, FormFieldMixinState<any>>) => {
		if (options) {
			const { type } = options;
			if (type) {
				instance.type = type;
			}
		}
	})
	.mixin({
		mixin: createStateful,
		initialize(instance, options) {
			if (options) {
				const { value } = options;
				if (value) {
					instance.setState({ value });
				}
			}
		}
	})
	.mixin(createCachedRenderMixin);

export default createFormMixin;
