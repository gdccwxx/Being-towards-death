
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/header.svelte generated by Svelte v3.44.2 */

    const file$4 = "src/header.svelte";

    function create_fragment$4(ctx) {
    	let header;
    	let h1;

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = `${/*name*/ ctx[0]}`;
    			attr_dev(h1, "class", "svelte-12ozial");
    			add_location(h1, file$4, 5, 2, 57);
    			attr_dev(header, "class", "svelte-12ozial");
    			add_location(header, file$4, 4, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let name = 'Life Timer';
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ name });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/counter.svelte generated by Svelte v3.44.2 */

    const { console: console_1$1 } = globals;
    const file$3 = "src/counter.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (73:4) {#each months as month}
    function create_each_block_2(ctx) {
    	let span;
    	let t_value = /*month*/ ctx[22] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "month-item svelte-dn93f9");
    			add_location(span, file$3, 73, 6, 1807);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(73:4) {#each months as month}",
    		ctx
    	});

    	return block;
    }

    // (79:6) {#each years as year}
    function create_each_block_1$1(ctx) {
    	let span;
    	let t_value = /*year*/ ctx[19] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "year-item svelte-dn93f9");
    			add_location(span, file$3, 79, 8, 1951);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*years*/ 1 && t_value !== (t_value = /*year*/ ctx[19] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(79:6) {#each years as year}",
    		ctx
    	});

    	return block;
    }

    // (84:6) {#each boxs as box}
    function create_each_block$1(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(`box-item ${/*box*/ ctx[16]}`) + " svelte-dn93f9"));
    			add_location(div, file$3, 84, 8, 2080);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*boxs*/ 2 && div_class_value !== (div_class_value = "" + (null_to_empty(`box-item ${/*box*/ ctx[16]}`) + " svelte-dn93f9"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(84:6) {#each boxs as box}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let div0;
    	let t0;
    	let div3;
    	let div1;
    	let t1;
    	let div2;
    	let each_value_2 = /*months*/ ctx[2];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*years*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*boxs*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "months svelte-dn93f9");
    			add_location(div0, file$3, 71, 2, 1752);
    			attr_dev(div1, "class", "year svelte-dn93f9");
    			add_location(div1, file$3, 77, 4, 1896);
    			attr_dev(div2, "class", "box-container svelte-dn93f9");
    			add_location(div2, file$3, 82, 4, 2018);
    			attr_dev(div3, "class", "wrapper svelte-dn93f9");
    			add_location(div3, file$3, 76, 2, 1870);
    			attr_dev(section, "class", "svelte-dn93f9");
    			add_location(section, file$3, 70, 0, 1740);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			append_dev(section, t0);
    			append_dev(section, div3);
    			append_dev(div3, div1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div3, t1);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*months*/ 4) {
    				each_value_2 = /*months*/ ctx[2];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*years*/ 1) {
    				each_value_1 = /*years*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*boxs*/ 2) {
    				each_value = /*boxs*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Counter', slots, []);
    	let { yearLimit = 74.8 } = $$props;
    	let { sickYear = 8 } = $$props;
    	let { bornYear = '1997' } = $$props;
    	let { bornMonth = '5' } = $$props;
    	let { currYear = '2021' } = $$props;
    	let { currMonth = '12' } = $$props;
    	const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => i * 2);
    	let years = new Array(Math.ceil(yearLimit / 2)).fill('').map((_, index) => index * 2);
    	let nCurrYear = Number(currYear);
    	let nCurrMonth = Number(currMonth);
    	let nBornYear = Number(bornYear);
    	let nBornMonth = Number(bornMonth);

    	const isPassed = index => {
    		const passedInteger = (nCurrYear - nBornYear) * 12;
    		const passedOdd = nCurrMonth - nBornMonth;
    		return passedInteger + passedOdd > index;
    	};

    	const isSick = index => {
    		const passedInteger = Math.floor((yearLimit - sickYear) * 12);
    		return passedInteger < index;
    	};

    	let boxs = new Array(Math.ceil(yearLimit * 12)).fill('').map((_, index) => {
    		console.log('isSick', isSick(index));
    		if (isSick(index)) return 'sick';
    		if (isPassed(index)) return 'passed';
    		return 'feature';
    	});

    	const init = () => {
    		$$invalidate(0, years = new Array(Math.ceil(yearLimit / 2)).fill('').map((_, index) => index * 2));
    		nCurrYear = Number(currYear);
    		nCurrMonth = Number(currMonth);
    		nBornYear = Number(bornYear);
    		nBornMonth = Number(bornMonth);

    		$$invalidate(1, boxs = new Array(Math.ceil(yearLimit * 12)).fill('').map((_, index) => {
    			console.log('isSick', isSick(index));
    			if (isSick(index)) return 'sick';
    			if (isPassed(index)) return 'passed';
    			return 'feature';
    		}));
    	};

    	afterUpdate(() => init());
    	onMount(() => init());
    	const writable_props = ['yearLimit', 'sickYear', 'bornYear', 'bornMonth', 'currYear', 'currMonth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Counter> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('yearLimit' in $$props) $$invalidate(3, yearLimit = $$props.yearLimit);
    		if ('sickYear' in $$props) $$invalidate(4, sickYear = $$props.sickYear);
    		if ('bornYear' in $$props) $$invalidate(5, bornYear = $$props.bornYear);
    		if ('bornMonth' in $$props) $$invalidate(6, bornMonth = $$props.bornMonth);
    		if ('currYear' in $$props) $$invalidate(7, currYear = $$props.currYear);
    		if ('currMonth' in $$props) $$invalidate(8, currMonth = $$props.currMonth);
    	};

    	$$self.$capture_state = () => ({
    		yearLimit,
    		sickYear,
    		bornYear,
    		bornMonth,
    		currYear,
    		currMonth,
    		months,
    		years,
    		nCurrYear,
    		nCurrMonth,
    		nBornYear,
    		nBornMonth,
    		isPassed,
    		isSick,
    		boxs,
    		afterUpdate,
    		onMount,
    		init
    	});

    	$$self.$inject_state = $$props => {
    		if ('yearLimit' in $$props) $$invalidate(3, yearLimit = $$props.yearLimit);
    		if ('sickYear' in $$props) $$invalidate(4, sickYear = $$props.sickYear);
    		if ('bornYear' in $$props) $$invalidate(5, bornYear = $$props.bornYear);
    		if ('bornMonth' in $$props) $$invalidate(6, bornMonth = $$props.bornMonth);
    		if ('currYear' in $$props) $$invalidate(7, currYear = $$props.currYear);
    		if ('currMonth' in $$props) $$invalidate(8, currMonth = $$props.currMonth);
    		if ('years' in $$props) $$invalidate(0, years = $$props.years);
    		if ('nCurrYear' in $$props) nCurrYear = $$props.nCurrYear;
    		if ('nCurrMonth' in $$props) nCurrMonth = $$props.nCurrMonth;
    		if ('nBornYear' in $$props) nBornYear = $$props.nBornYear;
    		if ('nBornMonth' in $$props) nBornMonth = $$props.nBornMonth;
    		if ('boxs' in $$props) $$invalidate(1, boxs = $$props.boxs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		years,
    		boxs,
    		months,
    		yearLimit,
    		sickYear,
    		bornYear,
    		bornMonth,
    		currYear,
    		currMonth
    	];
    }

    class Counter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			yearLimit: 3,
    			sickYear: 4,
    			bornYear: 5,
    			bornMonth: 6,
    			currYear: 7,
    			currMonth: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Counter",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get yearLimit() {
    		throw new Error("<Counter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yearLimit(value) {
    		throw new Error("<Counter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sickYear() {
    		throw new Error("<Counter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sickYear(value) {
    		throw new Error("<Counter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bornYear() {
    		throw new Error("<Counter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bornYear(value) {
    		throw new Error("<Counter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bornMonth() {
    		throw new Error("<Counter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bornMonth(value) {
    		throw new Error("<Counter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currYear() {
    		throw new Error("<Counter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currYear(value) {
    		throw new Error("<Counter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currMonth() {
    		throw new Error("<Counter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currMonth(value) {
    		throw new Error("<Counter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/counter-number.svelte generated by Svelte v3.44.2 */
    const file$2 = "src/counter-number.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let div2;
    	let div0;
    	let t0;
    	let t1_value = (/*gender*/ ctx[0] === 'man' ? '男性' : '女性') + "";
    	let t1;
    	let t2;
    	let t3;
    	let div1;
    	let t4;
    	let t5;
    	let t6;
    	let div5;
    	let div3;
    	let t8;
    	let div4;
    	let t9_value = /*yearLimit*/ ctx[1] - /*sickYear*/ ctx[2] + "";
    	let t9;
    	let t10;
    	let t11;
    	let div8;
    	let div6;
    	let t13;
    	let div7;
    	let t14;
    	let t15;
    	let t16;
    	let t17;
    	let t18;
    	let div11;
    	let div9;
    	let t20;
    	let div10;
    	let t21;
    	let t22;
    	let t23;
    	let div14;
    	let div12;
    	let t25;
    	let div13;
    	let t26;
    	let t27;
    	let t28;
    	let div17;
    	let div15;
    	let t30;
    	let div16;
    	let t31;
    	let t32;
    	let t33;
    	let div20;
    	let div18;
    	let t35;
    	let div19;
    	let t36;
    	let t37;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text("中国");
    			t1 = text(t1_value);
    			t2 = text("平均寿命");
    			t3 = space();
    			div1 = element("div");
    			t4 = text(/*yearLimit*/ ctx[1]);
    			t5 = text(" 岁");
    			t6 = space();
    			div5 = element("div");
    			div3 = element("div");
    			div3.textContent = "平均健康寿命";
    			t8 = space();
    			div4 = element("div");
    			t9 = text(t9_value);
    			t10 = text("年");
    			t11 = space();
    			div8 = element("div");
    			div6 = element("div");
    			div6.textContent = "预计时间";
    			t13 = space();
    			div7 = element("div");
    			t14 = text(/*endYear*/ ctx[8]);
    			t15 = text("年");
    			t16 = text(/*endMonth*/ ctx[7]);
    			t17 = text("月");
    			t18 = space();
    			div11 = element("div");
    			div9 = element("div");
    			div9.textContent = "周剩下";
    			t20 = space();
    			div10 = element("div");
    			t21 = text(/*gapWeek*/ ctx[3]);
    			t22 = text("周");
    			t23 = space();
    			div14 = element("div");
    			div12 = element("div");
    			div12.textContent = "月剩下";
    			t25 = space();
    			div13 = element("div");
    			t26 = text(/*gapMonth*/ ctx[4]);
    			t27 = text("月");
    			t28 = space();
    			div17 = element("div");
    			div15 = element("div");
    			div15.textContent = "季节剩下";
    			t30 = space();
    			div16 = element("div");
    			t31 = text(/*gapSeason*/ ctx[5]);
    			t32 = text("季节");
    			t33 = space();
    			div20 = element("div");
    			div18 = element("div");
    			div18.textContent = "年剩下";
    			t35 = space();
    			div19 = element("div");
    			t36 = text(/*gapYear*/ ctx[6]);
    			t37 = text("年");
    			attr_dev(div0, "class", "item-desc svelte-1g7pf6v");
    			add_location(div0, file$2, 47, 4, 1276);
    			attr_dev(div1, "class", "item-value svelte-1g7pf6v");
    			add_location(div1, file$2, 48, 4, 1346);
    			attr_dev(div2, "class", "item-wrapper svelte-1g7pf6v");
    			add_location(div2, file$2, 46, 2, 1245);
    			attr_dev(div3, "class", "item-desc svelte-1g7pf6v");
    			add_location(div3, file$2, 51, 4, 1432);
    			attr_dev(div4, "class", "item-value svelte-1g7pf6v");
    			add_location(div4, file$2, 52, 4, 1472);
    			attr_dev(div5, "class", "item-wrapper svelte-1g7pf6v");
    			add_location(div5, file$2, 50, 2, 1401);
    			attr_dev(div6, "class", "item-desc svelte-1g7pf6v");
    			add_location(div6, file$2, 55, 4, 1568);
    			attr_dev(div7, "class", "item-value svelte-1g7pf6v");
    			add_location(div7, file$2, 56, 4, 1606);
    			attr_dev(div8, "class", "item-wrapper svelte-1g7pf6v");
    			add_location(div8, file$2, 54, 2, 1537);
    			attr_dev(div9, "class", "item-desc svelte-1g7pf6v");
    			add_location(div9, file$2, 59, 4, 1700);
    			attr_dev(div10, "class", "item-value svelte-1g7pf6v");
    			add_location(div10, file$2, 60, 4, 1737);
    			attr_dev(div11, "class", "item-wrapper svelte-1g7pf6v");
    			add_location(div11, file$2, 58, 2, 1669);
    			attr_dev(div12, "class", "item-desc svelte-1g7pf6v");
    			add_location(div12, file$2, 63, 4, 1820);
    			attr_dev(div13, "class", "item-value svelte-1g7pf6v");
    			add_location(div13, file$2, 64, 4, 1857);
    			attr_dev(div14, "class", "item-wrapper svelte-1g7pf6v");
    			add_location(div14, file$2, 62, 2, 1789);
    			attr_dev(div15, "class", "item-desc svelte-1g7pf6v");
    			add_location(div15, file$2, 67, 4, 1941);
    			attr_dev(div16, "class", "item-value svelte-1g7pf6v");
    			add_location(div16, file$2, 68, 4, 1979);
    			attr_dev(div17, "class", "item-wrapper svelte-1g7pf6v");
    			add_location(div17, file$2, 66, 2, 1910);
    			attr_dev(div18, "class", "item-desc svelte-1g7pf6v");
    			add_location(div18, file$2, 71, 4, 2065);
    			attr_dev(div19, "class", "item-value svelte-1g7pf6v");
    			add_location(div19, file$2, 72, 4, 2102);
    			attr_dev(div20, "class", "item-wrapper svelte-1g7pf6v");
    			add_location(div20, file$2, 70, 2, 2034);
    			attr_dev(section, "class", "svelte-1g7pf6v");
    			add_location(section, file$2, 45, 0, 1233);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, t4);
    			append_dev(div1, t5);
    			append_dev(section, t6);
    			append_dev(section, div5);
    			append_dev(div5, div3);
    			append_dev(div5, t8);
    			append_dev(div5, div4);
    			append_dev(div4, t9);
    			append_dev(div4, t10);
    			append_dev(section, t11);
    			append_dev(section, div8);
    			append_dev(div8, div6);
    			append_dev(div8, t13);
    			append_dev(div8, div7);
    			append_dev(div7, t14);
    			append_dev(div7, t15);
    			append_dev(div7, t16);
    			append_dev(div7, t17);
    			append_dev(section, t18);
    			append_dev(section, div11);
    			append_dev(div11, div9);
    			append_dev(div11, t20);
    			append_dev(div11, div10);
    			append_dev(div10, t21);
    			append_dev(div10, t22);
    			append_dev(section, t23);
    			append_dev(section, div14);
    			append_dev(div14, div12);
    			append_dev(div14, t25);
    			append_dev(div14, div13);
    			append_dev(div13, t26);
    			append_dev(div13, t27);
    			append_dev(section, t28);
    			append_dev(section, div17);
    			append_dev(div17, div15);
    			append_dev(div17, t30);
    			append_dev(div17, div16);
    			append_dev(div16, t31);
    			append_dev(div16, t32);
    			append_dev(section, t33);
    			append_dev(section, div20);
    			append_dev(div20, div18);
    			append_dev(div20, t35);
    			append_dev(div20, div19);
    			append_dev(div19, t36);
    			append_dev(div19, t37);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*gender*/ 1 && t1_value !== (t1_value = (/*gender*/ ctx[0] === 'man' ? '男性' : '女性') + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*yearLimit*/ 2) set_data_dev(t4, /*yearLimit*/ ctx[1]);
    			if (dirty & /*yearLimit, sickYear*/ 6 && t9_value !== (t9_value = /*yearLimit*/ ctx[1] - /*sickYear*/ ctx[2] + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*endYear*/ 256) set_data_dev(t14, /*endYear*/ ctx[8]);
    			if (dirty & /*endMonth*/ 128) set_data_dev(t16, /*endMonth*/ ctx[7]);
    			if (dirty & /*gapWeek*/ 8) set_data_dev(t21, /*gapWeek*/ ctx[3]);
    			if (dirty & /*gapMonth*/ 16) set_data_dev(t26, /*gapMonth*/ ctx[4]);
    			if (dirty & /*gapSeason*/ 32) set_data_dev(t31, /*gapSeason*/ ctx[5]);
    			if (dirty & /*gapYear*/ 64) set_data_dev(t36, /*gapYear*/ ctx[6]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Counter_number', slots, []);
    	let { gender = '' } = $$props;
    	let { yearLimit = 0 } = $$props;
    	let { sickYear = 0 } = $$props;
    	let { bornYear = 0 } = $$props;
    	let { bornMonth = 0 } = $$props;
    	let gapTime = '';
    	let gapWeek = '';
    	let gapMonth = '';
    	let gapSeason = '';
    	let gapYear = '';
    	let endMonth = '';
    	let endYear = '';

    	const init = () => {
    		let nBornYear = Number(bornYear);
    		let nBornMonth = Number(bornMonth);
    		let limitYear = Math.floor(yearLimit);
    		let oddMonth = Math.floor((yearLimit - limitYear) * 12);
    		let totalMonth = nBornMonth + oddMonth;
    		let beginTime = new Date();
    		let endTime = new Date(endYear, endMonth);
    		gapTime = endTime.getTime() - beginTime.getTime();
    		$$invalidate(3, gapWeek = Math.floor(gapTime / 1000 / 60 / 60 / 24 / 7));
    		$$invalidate(4, gapMonth = Math.floor(gapTime / 1000 / 60 / 60 / 24 / 365 * 12));
    		$$invalidate(5, gapSeason = Math.floor(gapTime / 1000 / 60 / 60 / 24 / 365 * 12 / 3));
    		$$invalidate(6, gapYear = Math.floor(gapTime / 1000 / 60 / 60 / 24 / 365));
    		$$invalidate(7, endMonth = totalMonth > 12 ? totalMonth - 12 : totalMonth);

    		$$invalidate(8, endYear = totalMonth > 12
    		? limitYear + 1 + nBornYear
    		: limitYear + nBornYear);
    	};

    	onMount(() => {
    		init();
    	});

    	afterUpdate(() => {
    		init();
    	});

    	const writable_props = ['gender', 'yearLimit', 'sickYear', 'bornYear', 'bornMonth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Counter_number> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('gender' in $$props) $$invalidate(0, gender = $$props.gender);
    		if ('yearLimit' in $$props) $$invalidate(1, yearLimit = $$props.yearLimit);
    		if ('sickYear' in $$props) $$invalidate(2, sickYear = $$props.sickYear);
    		if ('bornYear' in $$props) $$invalidate(9, bornYear = $$props.bornYear);
    		if ('bornMonth' in $$props) $$invalidate(10, bornMonth = $$props.bornMonth);
    	};

    	$$self.$capture_state = () => ({
    		gender,
    		yearLimit,
    		sickYear,
    		bornYear,
    		bornMonth,
    		afterUpdate,
    		onMount,
    		gapTime,
    		gapWeek,
    		gapMonth,
    		gapSeason,
    		gapYear,
    		endMonth,
    		endYear,
    		init
    	});

    	$$self.$inject_state = $$props => {
    		if ('gender' in $$props) $$invalidate(0, gender = $$props.gender);
    		if ('yearLimit' in $$props) $$invalidate(1, yearLimit = $$props.yearLimit);
    		if ('sickYear' in $$props) $$invalidate(2, sickYear = $$props.sickYear);
    		if ('bornYear' in $$props) $$invalidate(9, bornYear = $$props.bornYear);
    		if ('bornMonth' in $$props) $$invalidate(10, bornMonth = $$props.bornMonth);
    		if ('gapTime' in $$props) gapTime = $$props.gapTime;
    		if ('gapWeek' in $$props) $$invalidate(3, gapWeek = $$props.gapWeek);
    		if ('gapMonth' in $$props) $$invalidate(4, gapMonth = $$props.gapMonth);
    		if ('gapSeason' in $$props) $$invalidate(5, gapSeason = $$props.gapSeason);
    		if ('gapYear' in $$props) $$invalidate(6, gapYear = $$props.gapYear);
    		if ('endMonth' in $$props) $$invalidate(7, endMonth = $$props.endMonth);
    		if ('endYear' in $$props) $$invalidate(8, endYear = $$props.endYear);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		gender,
    		yearLimit,
    		sickYear,
    		gapWeek,
    		gapMonth,
    		gapSeason,
    		gapYear,
    		endMonth,
    		endYear,
    		bornYear,
    		bornMonth
    	];
    }

    class Counter_number extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			gender: 0,
    			yearLimit: 1,
    			sickYear: 2,
    			bornYear: 9,
    			bornMonth: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Counter_number",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get gender() {
    		throw new Error("<Counter_number>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gender(value) {
    		throw new Error("<Counter_number>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yearLimit() {
    		throw new Error("<Counter_number>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yearLimit(value) {
    		throw new Error("<Counter_number>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sickYear() {
    		throw new Error("<Counter_number>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sickYear(value) {
    		throw new Error("<Counter_number>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bornYear() {
    		throw new Error("<Counter_number>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bornYear(value) {
    		throw new Error("<Counter_number>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bornMonth() {
    		throw new Error("<Counter_number>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bornMonth(value) {
    		throw new Error("<Counter_number>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/dialog.svelte generated by Svelte v3.44.2 */

    const file$1 = "src/dialog.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (44:12) {#each years as year}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*year*/ ctx[16] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = String(/*year*/ ctx[16]);
    			option.value = option.__value;
    			add_location(option, file$1, 44, 14, 1332);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(44:12) {#each years as year}",
    		ctx
    	});

    	return block;
    }

    // (54:12) {#each months as month}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*month*/ ctx[13] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = String(/*month*/ ctx[13]);
    			option.value = option.__value;
    			add_location(option, file$1, 54, 14, 1642);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(54:12) {#each months as month}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div13;
    	let div0;
    	let t0;
    	let div12;
    	let h3;
    	let t2;
    	let div10;
    	let div3;
    	let div1;
    	let t4;
    	let div2;
    	let select0;
    	let option0;
    	let option1;
    	let t7;
    	let div6;
    	let div4;
    	let t9;
    	let div5;
    	let select1;
    	let t10;
    	let div9;
    	let div7;
    	let t12;
    	let div8;
    	let select2;
    	let t13;
    	let div11;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*years*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*months*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div13 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div12 = element("div");
    			h3 = element("h3");
    			h3.textContent = "请填写基础信息";
    			t2 = space();
    			div10 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			div1.textContent = "请选择性别";
    			t4 = space();
    			div2 = element("div");
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "男";
    			option1 = element("option");
    			option1.textContent = "女";
    			t7 = space();
    			div6 = element("div");
    			div4 = element("div");
    			div4.textContent = "请选择年份";
    			t9 = space();
    			div5 = element("div");
    			select1 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t10 = space();
    			div9 = element("div");
    			div7 = element("div");
    			div7.textContent = "请选择月份";
    			t12 = space();
    			div8 = element("div");
    			select2 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t13 = space();
    			div11 = element("div");
    			div11.textContent = "确定";
    			attr_dev(div0, "class", "mask svelte-gvi8gs");
    			add_location(div0, file$1, 26, 2, 764);
    			attr_dev(h3, "class", "svelte-gvi8gs");
    			add_location(h3, file$1, 28, 4, 811);
    			attr_dev(div1, "class", "label svelte-gvi8gs");
    			add_location(div1, file$1, 31, 8, 897);
    			option0.__value = "man";
    			option0.value = option0.__value;
    			add_location(option0, file$1, 34, 12, 1014);
    			option1.__value = "woman";
    			option1.value = option1.__value;
    			add_location(option1, file$1, 35, 12, 1057);
    			if (/*selectGender*/ ctx[1] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[8].call(select0));
    			add_location(select0, file$1, 33, 10, 967);
    			attr_dev(div2, "class", "select svelte-gvi8gs");
    			add_location(div2, file$1, 32, 8, 936);
    			attr_dev(div3, "class", "option-wrapper svelte-gvi8gs");
    			add_location(div3, file$1, 30, 6, 860);
    			attr_dev(div4, "class", "label svelte-gvi8gs");
    			add_location(div4, file$1, 40, 8, 1181);
    			if (/*selectYear*/ ctx[2] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[9].call(select1));
    			add_location(select1, file$1, 42, 10, 1251);
    			attr_dev(div5, "class", "select svelte-gvi8gs");
    			add_location(div5, file$1, 41, 8, 1220);
    			attr_dev(div6, "class", "option-wrapper svelte-gvi8gs");
    			add_location(div6, file$1, 39, 6, 1144);
    			attr_dev(div7, "class", "label svelte-gvi8gs");
    			add_location(div7, file$1, 50, 8, 1488);
    			if (/*selectMonth*/ ctx[3] === void 0) add_render_callback(() => /*select2_change_handler*/ ctx[10].call(select2));
    			add_location(select2, file$1, 52, 10, 1558);
    			attr_dev(div8, "class", "select svelte-gvi8gs");
    			add_location(div8, file$1, 51, 8, 1527);
    			attr_dev(div9, "class", "option-wrapper svelte-gvi8gs");
    			add_location(div9, file$1, 49, 6, 1451);
    			attr_dev(div10, "class", "wrapper svelte-gvi8gs");
    			add_location(div10, file$1, 29, 4, 832);
    			attr_dev(div11, "class", "button-normal primary svelte-gvi8gs");
    			add_location(div11, file$1, 60, 4, 1772);
    			attr_dev(div12, "class", "dialog svelte-gvi8gs");
    			add_location(div12, file$1, 27, 2, 786);
    			attr_dev(div13, "class", "display-none dialog-container svelte-gvi8gs");
    			toggle_class(div13, "display", /*display*/ ctx[0]);
    			add_location(div13, file$1, 25, 0, 694);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div13, anchor);
    			append_dev(div13, div0);
    			append_dev(div13, t0);
    			append_dev(div13, div12);
    			append_dev(div12, h3);
    			append_dev(div12, t2);
    			append_dev(div12, div10);
    			append_dev(div10, div3);
    			append_dev(div3, div1);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			select_option(select0, /*selectGender*/ ctx[1]);
    			append_dev(div10, t7);
    			append_dev(div10, div6);
    			append_dev(div6, div4);
    			append_dev(div6, t9);
    			append_dev(div6, div5);
    			append_dev(div5, select1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select1, null);
    			}

    			select_option(select1, /*selectYear*/ ctx[2]);
    			append_dev(div10, t10);
    			append_dev(div10, div9);
    			append_dev(div9, div7);
    			append_dev(div9, t12);
    			append_dev(div9, div8);
    			append_dev(div8, select2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select2, null);
    			}

    			select_option(select2, /*selectMonth*/ ctx[3]);
    			append_dev(div12, t13);
    			append_dev(div12, div11);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[8]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[9]),
    					listen_dev(select2, "change", /*select2_change_handler*/ ctx[10]),
    					listen_dev(div11, "click", /*click_handler*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selectGender*/ 2) {
    				select_option(select0, /*selectGender*/ ctx[1]);
    			}

    			if (dirty & /*String, years*/ 16) {
    				each_value_1 = /*years*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*selectYear, String, years*/ 20) {
    				select_option(select1, /*selectYear*/ ctx[2]);
    			}

    			if (dirty & /*String, months*/ 32) {
    				each_value = /*months*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selectMonth, String, months*/ 40) {
    				select_option(select2, /*selectMonth*/ ctx[3]);
    			}

    			if (dirty & /*display*/ 1) {
    				toggle_class(div13, "display", /*display*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div13);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dialog', slots, []);
    	let { display = false } = $$props;
    	let { onSetBasicInfos } = $$props;
    	const currentYear = new Date().getFullYear();
    	const years = new Array(100).fill('').map((_, index) => currentYear - index).reverse('');
    	const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    	let selectGender = localStorage.getItem('gender') || 'man';
    	let selectYear = localStorage.getItem('bornYear') || '1990';
    	let selectMonth = localStorage.getItem('bornMonth') || '6';

    	const onConfirm = () => {
    		if (!selectGender) return;
    		if (!selectYear) return;
    		if (!selectMonth) return;

    		onSetBasicInfos({
    			year: selectYear,
    			month: selectMonth,
    			gender: selectGender
    		});
    	};

    	const writable_props = ['display', 'onSetBasicInfos'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dialog> was created with unknown prop '${key}'`);
    	});

    	function select0_change_handler() {
    		selectGender = select_value(this);
    		$$invalidate(1, selectGender);
    	}

    	function select1_change_handler() {
    		selectYear = select_value(this);
    		$$invalidate(2, selectYear);
    		$$invalidate(4, years);
    	}

    	function select2_change_handler() {
    		selectMonth = select_value(this);
    		$$invalidate(3, selectMonth);
    		$$invalidate(5, months);
    	}

    	const click_handler = () => onConfirm();

    	$$self.$$set = $$props => {
    		if ('display' in $$props) $$invalidate(0, display = $$props.display);
    		if ('onSetBasicInfos' in $$props) $$invalidate(7, onSetBasicInfos = $$props.onSetBasicInfos);
    	};

    	$$self.$capture_state = () => ({
    		display,
    		onSetBasicInfos,
    		currentYear,
    		years,
    		months,
    		selectGender,
    		selectYear,
    		selectMonth,
    		onConfirm
    	});

    	$$self.$inject_state = $$props => {
    		if ('display' in $$props) $$invalidate(0, display = $$props.display);
    		if ('onSetBasicInfos' in $$props) $$invalidate(7, onSetBasicInfos = $$props.onSetBasicInfos);
    		if ('selectGender' in $$props) $$invalidate(1, selectGender = $$props.selectGender);
    		if ('selectYear' in $$props) $$invalidate(2, selectYear = $$props.selectYear);
    		if ('selectMonth' in $$props) $$invalidate(3, selectMonth = $$props.selectMonth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		display,
    		selectGender,
    		selectYear,
    		selectMonth,
    		years,
    		months,
    		onConfirm,
    		onSetBasicInfos,
    		select0_change_handler,
    		select1_change_handler,
    		select2_change_handler,
    		click_handler
    	];
    }

    class Dialog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { display: 0, onSetBasicInfos: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dialog",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onSetBasicInfos*/ ctx[7] === undefined && !('onSetBasicInfos' in props)) {
    			console.warn("<Dialog> was created without expected prop 'onSetBasicInfos'");
    		}
    	}

    	get display() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set display(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onSetBasicInfos() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onSetBasicInfos(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.2 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    // (82:29) 
    function create_if_block_3(ctx) {
    	let counternumber;
    	let updating_gender;
    	let updating_yearLimit;
    	let updating_sickYear;
    	let updating_bornYear;
    	let updating_bornMonth;
    	let current;

    	function counternumber_gender_binding(value) {
    		/*counternumber_gender_binding*/ ctx[20](value);
    	}

    	function counternumber_yearLimit_binding(value) {
    		/*counternumber_yearLimit_binding*/ ctx[21](value);
    	}

    	function counternumber_sickYear_binding(value) {
    		/*counternumber_sickYear_binding*/ ctx[22](value);
    	}

    	function counternumber_bornYear_binding(value) {
    		/*counternumber_bornYear_binding*/ ctx[23](value);
    	}

    	function counternumber_bornMonth_binding(value) {
    		/*counternumber_bornMonth_binding*/ ctx[24](value);
    	}

    	let counternumber_props = {};

    	if (/*gender*/ ctx[3] !== void 0) {
    		counternumber_props.gender = /*gender*/ ctx[3];
    	}

    	if (/*YEAR_CONFIG*/ ctx[0][/*gender*/ ctx[3]].limit !== void 0) {
    		counternumber_props.yearLimit = /*YEAR_CONFIG*/ ctx[0][/*gender*/ ctx[3]].limit;
    	}

    	if (/*YEAR_CONFIG*/ ctx[0][/*gender*/ ctx[3]].sick !== void 0) {
    		counternumber_props.sickYear = /*YEAR_CONFIG*/ ctx[0][/*gender*/ ctx[3]].sick;
    	}

    	if (/*bornYear*/ ctx[1] !== void 0) {
    		counternumber_props.bornYear = /*bornYear*/ ctx[1];
    	}

    	if (/*bornMonth*/ ctx[2] !== void 0) {
    		counternumber_props.bornMonth = /*bornMonth*/ ctx[2];
    	}

    	counternumber = new Counter_number({
    			props: counternumber_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(counternumber, 'gender', counternumber_gender_binding));
    	binding_callbacks.push(() => bind(counternumber, 'yearLimit', counternumber_yearLimit_binding));
    	binding_callbacks.push(() => bind(counternumber, 'sickYear', counternumber_sickYear_binding));
    	binding_callbacks.push(() => bind(counternumber, 'bornYear', counternumber_bornYear_binding));
    	binding_callbacks.push(() => bind(counternumber, 'bornMonth', counternumber_bornMonth_binding));

    	const block = {
    		c: function create() {
    			create_component(counternumber.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(counternumber, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const counternumber_changes = {};

    			if (!updating_gender && dirty & /*gender*/ 8) {
    				updating_gender = true;
    				counternumber_changes.gender = /*gender*/ ctx[3];
    				add_flush_callback(() => updating_gender = false);
    			}

    			if (!updating_yearLimit && dirty & /*YEAR_CONFIG, gender*/ 9) {
    				updating_yearLimit = true;
    				counternumber_changes.yearLimit = /*YEAR_CONFIG*/ ctx[0][/*gender*/ ctx[3]].limit;
    				add_flush_callback(() => updating_yearLimit = false);
    			}

    			if (!updating_sickYear && dirty & /*YEAR_CONFIG, gender*/ 9) {
    				updating_sickYear = true;
    				counternumber_changes.sickYear = /*YEAR_CONFIG*/ ctx[0][/*gender*/ ctx[3]].sick;
    				add_flush_callback(() => updating_sickYear = false);
    			}

    			if (!updating_bornYear && dirty & /*bornYear*/ 2) {
    				updating_bornYear = true;
    				counternumber_changes.bornYear = /*bornYear*/ ctx[1];
    				add_flush_callback(() => updating_bornYear = false);
    			}

    			if (!updating_bornMonth && dirty & /*bornMonth*/ 4) {
    				updating_bornMonth = true;
    				counternumber_changes.bornMonth = /*bornMonth*/ ctx[2];
    				add_flush_callback(() => updating_bornMonth = false);
    			}

    			counternumber.$set(counternumber_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(counternumber.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(counternumber.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(counternumber, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(82:29) ",
    		ctx
    	});

    	return block;
    }

    // (73:2) {#if pannelFlag === 1}
    function create_if_block_2(ctx) {
    	let counter;
    	let updating_yearLimit;
    	let updating_sickYear;
    	let updating_bornYear;
    	let updating_bornMonth;
    	let updating_currYear;
    	let updating_currMonth;
    	let current;

    	function counter_yearLimit_binding(value) {
    		/*counter_yearLimit_binding*/ ctx[14](value);
    	}

    	function counter_sickYear_binding(value) {
    		/*counter_sickYear_binding*/ ctx[15](value);
    	}

    	function counter_bornYear_binding(value) {
    		/*counter_bornYear_binding*/ ctx[16](value);
    	}

    	function counter_bornMonth_binding(value) {
    		/*counter_bornMonth_binding*/ ctx[17](value);
    	}

    	function counter_currYear_binding(value) {
    		/*counter_currYear_binding*/ ctx[18](value);
    	}

    	function counter_currMonth_binding(value) {
    		/*counter_currMonth_binding*/ ctx[19](value);
    	}

    	let counter_props = {};

    	if (/*YEAR_CONFIG*/ ctx[0][/*gender*/ ctx[3]].limit !== void 0) {
    		counter_props.yearLimit = /*YEAR_CONFIG*/ ctx[0][/*gender*/ ctx[3]].limit;
    	}

    	if (/*YEAR_CONFIG*/ ctx[0][/*gender*/ ctx[3]].sick !== void 0) {
    		counter_props.sickYear = /*YEAR_CONFIG*/ ctx[0][/*gender*/ ctx[3]].sick;
    	}

    	if (/*bornYear*/ ctx[1] !== void 0) {
    		counter_props.bornYear = /*bornYear*/ ctx[1];
    	}

    	if (/*bornMonth*/ ctx[2] !== void 0) {
    		counter_props.bornMonth = /*bornMonth*/ ctx[2];
    	}

    	if (/*updateYear*/ ctx[4] !== void 0) {
    		counter_props.currYear = /*updateYear*/ ctx[4];
    	}

    	if (/*updateMonth*/ ctx[5] !== void 0) {
    		counter_props.currMonth = /*updateMonth*/ ctx[5];
    	}

    	counter = new Counter({ props: counter_props, $$inline: true });
    	binding_callbacks.push(() => bind(counter, 'yearLimit', counter_yearLimit_binding));
    	binding_callbacks.push(() => bind(counter, 'sickYear', counter_sickYear_binding));
    	binding_callbacks.push(() => bind(counter, 'bornYear', counter_bornYear_binding));
    	binding_callbacks.push(() => bind(counter, 'bornMonth', counter_bornMonth_binding));
    	binding_callbacks.push(() => bind(counter, 'currYear', counter_currYear_binding));
    	binding_callbacks.push(() => bind(counter, 'currMonth', counter_currMonth_binding));

    	const block = {
    		c: function create() {
    			create_component(counter.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(counter, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const counter_changes = {};

    			if (!updating_yearLimit && dirty & /*YEAR_CONFIG, gender*/ 9) {
    				updating_yearLimit = true;
    				counter_changes.yearLimit = /*YEAR_CONFIG*/ ctx[0][/*gender*/ ctx[3]].limit;
    				add_flush_callback(() => updating_yearLimit = false);
    			}

    			if (!updating_sickYear && dirty & /*YEAR_CONFIG, gender*/ 9) {
    				updating_sickYear = true;
    				counter_changes.sickYear = /*YEAR_CONFIG*/ ctx[0][/*gender*/ ctx[3]].sick;
    				add_flush_callback(() => updating_sickYear = false);
    			}

    			if (!updating_bornYear && dirty & /*bornYear*/ 2) {
    				updating_bornYear = true;
    				counter_changes.bornYear = /*bornYear*/ ctx[1];
    				add_flush_callback(() => updating_bornYear = false);
    			}

    			if (!updating_bornMonth && dirty & /*bornMonth*/ 4) {
    				updating_bornMonth = true;
    				counter_changes.bornMonth = /*bornMonth*/ ctx[2];
    				add_flush_callback(() => updating_bornMonth = false);
    			}

    			if (!updating_currYear && dirty & /*updateYear*/ 16) {
    				updating_currYear = true;
    				counter_changes.currYear = /*updateYear*/ ctx[4];
    				add_flush_callback(() => updating_currYear = false);
    			}

    			if (!updating_currMonth && dirty & /*updateMonth*/ 32) {
    				updating_currMonth = true;
    				counter_changes.currMonth = /*updateMonth*/ ctx[5];
    				add_flush_callback(() => updating_currMonth = false);
    			}

    			counter.$set(counter_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(counter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(counter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(counter, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(73:2) {#if pannelFlag === 1}",
    		ctx
    	});

    	return block;
    }

    // (95:29) 
    function create_if_block_1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "重新设置";
    			attr_dev(div, "class", "button-normal setting svelte-6hre9z");
    			add_location(div, file, 95, 3, 2766);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_3*/ ctx[26], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(95:29) ",
    		ctx
    	});

    	return block;
    }

    // (93:2) {#if pannelFlag === 1}
    function create_if_block(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "更新";
    			attr_dev(div, "class", "button-normal primary svelte-6hre9z");
    			add_location(div, file, 93, 3, 2656);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_2*/ ctx[25], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(93:2) {#if pannelFlag === 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let t0;
    	let div3;
    	let div2;
    	let div0;
    	let t2;
    	let div1;
    	let t4;
    	let current_block_type_index;
    	let if_block0;
    	let t5;
    	let footer;
    	let t6;
    	let dialog;
    	let current;
    	let mounted;
    	let dispose;
    	header = new Header({ $$inline: true });
    	const if_block_creators = [create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*pannelFlag*/ ctx[6] === 1) return 0;
    		if (/*pannelFlag*/ ctx[6] === 2) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	function select_block_type_1(ctx, dirty) {
    		if (/*pannelFlag*/ ctx[6] === 1) return create_if_block;
    		if (/*pannelFlag*/ ctx[6] === 2) return create_if_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block1 = current_block_type && current_block_type(ctx);

    	dialog = new Dialog({
    			props: {
    				display: /*shouldDisplayDialog*/ ctx[7],
    				onSetBasicInfos: /*onSetBasicInfos*/ ctx[11]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "图";
    			t2 = space();
    			div1 = element("div");
    			div1.textContent = "数";
    			t4 = space();
    			if (if_block0) if_block0.c();
    			t5 = space();
    			footer = element("footer");
    			if (if_block1) if_block1.c();
    			t6 = space();
    			create_component(dialog.$$.fragment);
    			attr_dev(div0, "class", "tab-pannel left-pannel svelte-6hre9z");
    			toggle_class(div0, "active", /*pannelFlag*/ ctx[6] === 1);
    			add_location(div0, file, 57, 3, 1823);
    			attr_dev(div1, "class", "tab-pannel right-pannel svelte-6hre9z");
    			toggle_class(div1, "active", /*pannelFlag*/ ctx[6] === 2);
    			add_location(div1, file, 64, 3, 1964);
    			attr_dev(div2, "class", "tab-pannels svelte-6hre9z");
    			add_location(div2, file, 56, 2, 1794);
    			attr_dev(div3, "class", "tab");
    			add_location(div3, file, 55, 1, 1774);
    			attr_dev(footer, "class", "svelte-6hre9z");
    			add_location(footer, file, 91, 1, 2619);
    			attr_dev(main, "class", "svelte-6hre9z");
    			add_location(main, file, 53, 0, 1754);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t0);
    			append_dev(main, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div3, t4);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div3, null);
    			}

    			append_dev(main, t5);
    			append_dev(main, footer);
    			if (if_block1) if_block1.m(footer, null);
    			append_dev(main, t6);
    			mount_component(dialog, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pannelFlag*/ 64) {
    				toggle_class(div0, "active", /*pannelFlag*/ ctx[6] === 1);
    			}

    			if (dirty & /*pannelFlag*/ 64) {
    				toggle_class(div1, "active", /*pannelFlag*/ ctx[6] === 2);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block0) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block0 = if_blocks[current_block_type_index];

    					if (!if_block0) {
    						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block0.c();
    					} else {
    						if_block0.p(ctx, dirty);
    					}

    					transition_in(if_block0, 1);
    					if_block0.m(div3, null);
    				} else {
    					if_block0 = null;
    				}
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if (if_block1) if_block1.d(1);
    				if_block1 = current_block_type && current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(footer, null);
    				}
    			}

    			const dialog_changes = {};
    			if (dirty & /*shouldDisplayDialog*/ 128) dialog_changes.display = /*shouldDisplayDialog*/ ctx[7];
    			dialog.$set(dialog_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(dialog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(dialog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (if_block1) {
    				if_block1.d();
    			}

    			destroy_component(dialog);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	const YEAR_CONFIG = {
    		man: {
    			limit: 74.8,
    			sick: 74.8 - 67.2, // 平均寿命 - 健康寿命
    			
    		},
    		woman: { limit: 79.2, sick: 79.2 - 70 }
    	};

    	// pannel choisen
    	let bornYear = localStorage.getItem('bornYear') || new Date().getFullYear();

    	let bornMonth = localStorage.getItem('bornMonth') || new Date().getMonth() + 1;
    	let gender = localStorage.getItem('gender') || 'man';
    	let updateYear = localStorage.getItem('updateYear') || new Date().getFullYear();
    	let updateMonth = localStorage.getItem('updateMonth') || new Date().getMonth() + 1;
    	let pannelFlag = 1;
    	const onChangePannel = pannel => $$invalidate(6, pannelFlag = pannel);
    	let shouldDisplayDialog = !localStorage.getItem('gender');
    	const onChangeDisplay = isDisplay => $$invalidate(7, shouldDisplayDialog = isDisplay);

    	const updateBlock = () => {
    		const now = new Date();
    		$$invalidate(4, updateYear = now.getFullYear());
    		$$invalidate(5, updateMonth = now.getMonth() + 1);
    		localStorage.setItem('updateYear', updateYear);
    		localStorage.setItem('updateMonth', updateMonth);
    	};

    	const onSetBasicInfos = ({ year, month, gender: genders }) => {
    		console.log('year', year);
    		console.log('month', month);
    		console.log('genders', genders);
    		$$invalidate(1, bornYear = year);
    		$$invalidate(2, bornMonth = month);
    		$$invalidate(3, gender = genders);
    		$$invalidate(7, shouldDisplayDialog = false);
    		localStorage.setItem('bornYear', year);
    		localStorage.setItem('bornMonth', month);
    		localStorage.setItem('gender', genders);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => onChangePannel(1);
    	const click_handler_1 = () => onChangePannel(2);

    	function counter_yearLimit_binding(value) {
    		if ($$self.$$.not_equal(YEAR_CONFIG[gender].limit, value)) {
    			YEAR_CONFIG[gender].limit = value;
    			$$invalidate(0, YEAR_CONFIG);
    		}
    	}

    	function counter_sickYear_binding(value) {
    		if ($$self.$$.not_equal(YEAR_CONFIG[gender].sick, value)) {
    			YEAR_CONFIG[gender].sick = value;
    			$$invalidate(0, YEAR_CONFIG);
    		}
    	}

    	function counter_bornYear_binding(value) {
    		bornYear = value;
    		$$invalidate(1, bornYear);
    	}

    	function counter_bornMonth_binding(value) {
    		bornMonth = value;
    		$$invalidate(2, bornMonth);
    	}

    	function counter_currYear_binding(value) {
    		updateYear = value;
    		$$invalidate(4, updateYear);
    	}

    	function counter_currMonth_binding(value) {
    		updateMonth = value;
    		$$invalidate(5, updateMonth);
    	}

    	function counternumber_gender_binding(value) {
    		gender = value;
    		$$invalidate(3, gender);
    	}

    	function counternumber_yearLimit_binding(value) {
    		if ($$self.$$.not_equal(YEAR_CONFIG[gender].limit, value)) {
    			YEAR_CONFIG[gender].limit = value;
    			$$invalidate(0, YEAR_CONFIG);
    		}
    	}

    	function counternumber_sickYear_binding(value) {
    		if ($$self.$$.not_equal(YEAR_CONFIG[gender].sick, value)) {
    			YEAR_CONFIG[gender].sick = value;
    			$$invalidate(0, YEAR_CONFIG);
    		}
    	}

    	function counternumber_bornYear_binding(value) {
    		bornYear = value;
    		$$invalidate(1, bornYear);
    	}

    	function counternumber_bornMonth_binding(value) {
    		bornMonth = value;
    		$$invalidate(2, bornMonth);
    	}

    	const click_handler_2 = () => updateBlock();
    	const click_handler_3 = () => onChangeDisplay(true);

    	$$self.$capture_state = () => ({
    		Header,
    		Counter,
    		CounterNumber: Counter_number,
    		Dialog,
    		YEAR_CONFIG,
    		bornYear,
    		bornMonth,
    		gender,
    		updateYear,
    		updateMonth,
    		pannelFlag,
    		onChangePannel,
    		shouldDisplayDialog,
    		onChangeDisplay,
    		updateBlock,
    		onSetBasicInfos
    	});

    	$$self.$inject_state = $$props => {
    		if ('bornYear' in $$props) $$invalidate(1, bornYear = $$props.bornYear);
    		if ('bornMonth' in $$props) $$invalidate(2, bornMonth = $$props.bornMonth);
    		if ('gender' in $$props) $$invalidate(3, gender = $$props.gender);
    		if ('updateYear' in $$props) $$invalidate(4, updateYear = $$props.updateYear);
    		if ('updateMonth' in $$props) $$invalidate(5, updateMonth = $$props.updateMonth);
    		if ('pannelFlag' in $$props) $$invalidate(6, pannelFlag = $$props.pannelFlag);
    		if ('shouldDisplayDialog' in $$props) $$invalidate(7, shouldDisplayDialog = $$props.shouldDisplayDialog);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		YEAR_CONFIG,
    		bornYear,
    		bornMonth,
    		gender,
    		updateYear,
    		updateMonth,
    		pannelFlag,
    		shouldDisplayDialog,
    		onChangePannel,
    		onChangeDisplay,
    		updateBlock,
    		onSetBasicInfos,
    		click_handler,
    		click_handler_1,
    		counter_yearLimit_binding,
    		counter_sickYear_binding,
    		counter_bornYear_binding,
    		counter_bornMonth_binding,
    		counter_currYear_binding,
    		counter_currMonth_binding,
    		counternumber_gender_binding,
    		counternumber_yearLimit_binding,
    		counternumber_sickYear_binding,
    		counternumber_bornYear_binding,
    		counternumber_bornMonth_binding,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
