/**
 * 队列模块
 * version : 0-0-1
 */

(function ($) {

    // 用于存储对象
    var optionsCache = {};

    // 将对象转换成字符串用于存储
    function createOptions(options) {
        var object = optionsCache[ options ] = {};
        $.each(options.split(/\s+/), function (_, flag) {
            object[ flag ] = true;
        });
        return object;
    }

    /*
     * Create a callback list using the following parameters:
     *
     *	options: an optional list of space-separated options that will change how
     *			the callback list behaves or a more traditional option object
     *
     * By default a callback list will act like an event callback list and can be
     * "fired" multiple times.
     *
     * Possible options:
     *
     *	once:			will ensure the callback list can only be fired once (like a Deferred)
     *
     *	memory:			will keep track of previous values and will call any callback added
     *					after the list has been fired right away with the latest "memorized"
     *					values (like a Deferred)
     *
     *	unique:			will ensure a callback can only be added once (no duplicate in the list)
     *
     *	stopOnFalse:	interrupt callings when a callback returns false
     *
     */
    $.Callbacks = function (options) {

        // Convert options from String-formatted to Object-formatted if needed
        // (we check in cache first)
        options = typeof options === "string" ?
            ( optionsCache[ options ] || createOptions(options) ) :
            $.extend({}, options);

        var // Last fire value (for non-forgettable lists)
            memory,
        // Flag to know if list was already fired
            fired,
        // Flag to know if list is currently firing
            firing,
        // First callback to fire (used internally by add and fireWith)
            firingStart,
        // End of the loop when firing
            firingLength,
        // Index of currently firing callback (modified by remove if needed)
            firingIndex,
        // Actual callback list
            list = [],
        // Stack of fire calls for repeatable lists
            stack = !options.once && [],
        // Fire callbacks
            fire = function (data) {
                memory = options.memory && data;
                fired = true;
                firingIndex = firingStart || 0;
                firingStart = 0;
                firingLength = list.length;
                firing = true;
                for (; list && firingIndex < firingLength; firingIndex++) {
                    if (list[ firingIndex ].apply(data[ 0 ], data[ 1 ]) === false && options.stopOnFalse) {
                        memory = false; // To prevent further calls using add
                        break;
                    }
                }
                firing = false;
                if (list) {
                    if (stack) {
                        if (stack.length) {
                            fire(stack.shift());
                        }
                    } else if (memory) {
                        list = [];
                    } else {
                        self.disable();
                    }
                }
            },
        // Actual Callbacks object
            self = {
                // Add a callback or a collection of callbacks to the list
                add:function () {
                    if (list) {
                        // First, we save the current length
                        var start = list.length;
                        (function add(args) {
                            $.each(args, function (_, arg) {
                                var type = $.type(arg);
                                if (type === "function" && ( !options.unique || !self.has(arg) )) {
                                    list.push(arg);
                                } else if (arg && arg.length && type !== "string") {
                                    // Inspect recursively
                                    add(arg);
                                }
                            });
                        })(arguments);
                        // Do we need to add the callbacks to the
                        // current firing batch?
                        if (firing) {
                            firingLength = list.length;
                            // With memory, if we're not firing then
                            // we should call right away
                        } else if (memory) {
                            firingStart = start;
                            fire(memory);
                        }
                    }
                    return this;
                },
                // Remove a callback from the list
                remove:function () {
                    if (list) {
                        $.each(arguments, function (_, arg) {
                            var index;
                            while (( index = $.inArray(arg, list, index) ) > -1) {
                                list.splice(index, 1);
                                // Handle firing indexes
                                if (firing) {
                                    if (index <= firingLength) {
                                        firingLength--;
                                    }
                                    if (index <= firingIndex) {
                                        firingIndex--;
                                    }
                                }
                            }
                        });
                    }
                    return this;
                },
                // Control if a given callback is in the list
                has:function (fn) {
                    return $.inArray(fn, list) > -1;
                },
                // Remove all callbacks from the list
                empty:function () {
                    list = [];
                    return this;
                },
                // Have the list do nothing anymore
                disable:function () {
                    list = stack = memory = undefined;
                    return this;
                },
                // Is it disabled?
                disabled:function () {
                    return !list;
                },
                // Lock the list in its current state
                lock:function () {
                    stack = undefined;
                    if (!memory) {
                        self.disable();
                    }
                    return this;
                },
                // Is it locked?
                locked:function () {
                    return !stack;
                },
                // Call all callbacks with the given context and arguments
                fireWith:function (context, args) {
                    args = args || [];
                    args = [ context, args.slice ? args.slice() : args ];
                    if (list && ( !fired || stack )) {
                        if (firing) {
                            stack.push(args);
                        } else {
                            fire(args);
                        }
                    }
                    return this;
                },
                // Call all the callbacks with the given arguments
                fire:function () {
                    self.fireWith(this, arguments);
                    return this;
                },
                // To know if the callbacks have already been called at least once
                fired:function () {
                    return !!fired;
                }
            };

        return self;
    };

    $.extend({

        Deferred:function (func) {
            var tuples = [
                    // action, add listener, listener list, final state
                    [ "resolve", "done", $.Callbacks("once memory"), "resolved" ],
                    [ "reject", "fail", $.Callbacks("once memory"), "rejected" ],
                    [ "notify", "progress", $.Callbacks("memory") ]
                ],
                state = "pending",
                promise = {
                    state:function () {
                        return state;
                    },
                    always:function () {
                        deferred.done(arguments).fail(arguments);
                        return this;
                    },
                    then:function (/* fnDone, fnFail, fnProgress */) {
                        var fns = arguments;
                        return $.Deferred(function (newDefer) {
                            $.each(tuples, function (i, tuple) {
                                var action = tuple[ 0 ],
                                    fn = fns[ i ];
                                // deferred[ done | fail | progress ] for forwarding actions to newDefer
                                deferred[ tuple[1] ]($.isFunction(fn) ?
                                    function () {
                                        var returned = fn.apply(this, arguments);
                                        if (returned && $.isFunction(returned.promise)) {
                                            returned.promise()
                                                .done(newDefer.resolve)
                                                .fail(newDefer.reject)
                                                .progress(newDefer.notify);
                                        } else {
                                            newDefer[ action + "With" ](this === deferred ? newDefer : this, [ returned ]);
                                        }
                                    } :
                                    newDefer[ action ]
                                );
                            });
                            fns = null;
                        }).promise();
                    },
                    // Get a promise for this deferred
                    // If obj is provided, the promise aspect is added to the object
                    promise:function (obj) {
                        return typeof obj === "object" ? $.extend(obj, promise) : promise;
                    }
                },
                deferred = {};

            // Add list-specific methods
            $.each(tuples, function (i, tuple) {
                var list = tuple[ 2 ],
                    stateString = tuple[ 3 ];

                // promise[ done | fail | progress ] = list.add
                promise[ tuple[1] ] = list.add;

                // Handle state
                if (stateString) {
                    list.add(function () {
                        // state = [ resolved | rejected ]
                        state = stateString;

                        // [ reject_list | resolve_list ].disable; progress_list.lock
                    }, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock);
                }

                // deferred[ resolve | reject | notify ] = list.fire
                deferred[ tuple[0] ] = list.fire;
                deferred[ tuple[0] + "With" ] = list.fireWith;
            });

            // Make the deferred a promise
            promise.promise(deferred);

            // Call given func if any
            if (func) {
                func.call(deferred, deferred);
            }

            // All done!
            return deferred;
        },

        // Deferred helper
        when:function (subordinate /* , ..., subordinateN */) {
            var i = 0,
                resolveValues = [].slice.call(arguments),
                length = resolveValues.length,

            // the count of uncompleted subordinates
                remaining = length !== 1 || ( subordinate && $.isFunction(subordinate.promise) ) ? length : 0,

            // the master Deferred. If resolveValues consist of only a single Deferred, just use that.
                deferred = remaining === 1 ? subordinate : $.Deferred(),

            // Update function for both resolve and progress values
                updateFunc = function (i, contexts, values) {
                    return function (value) {
                        contexts[ i ] = this;
                        values[ i ] = arguments.length > 1 ? core_slice.call(arguments) : value;
                        if (values === progressValues) {
                            deferred.notifyWith(contexts, values);
                        } else if (!( --remaining )) {
                            deferred.resolveWith(contexts, values);
                        }
                    };
                },

                progressValues, progressContexts, resolveContexts;

            // add listeners to Deferred subordinates; treat others as resolved
            if (length > 1) {
                progressValues = new Array(length);
                progressContexts = new Array(length);
                resolveContexts = new Array(length);
                for (; i < length; i++) {
                    if (resolveValues[ i ] && $.isFunction(resolveValues[ i ].promise)) {
                        resolveValues[ i ].promise()
                            .done(updateFunc(i, resolveContexts, resolveValues))
                            .fail(deferred.reject)
                            .progress(updateFunc(i, progressContexts, progressValues));
                    } else {
                        --remaining;
                    }
                }
            }

            // if we're not waiting on anything, resolve the master
            if (!remaining) {
                deferred.resolveWith(resolveContexts, resolveValues);
            }

            return deferred.promise();
        }
    });

})(Zepto);