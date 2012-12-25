/**
 * Deferred
 * @version: 0-0-1
 * @module EasyTouch
 * @uses Deferred
 * @description jQuery DeferredÄ£¿é
 */
;(function ($) {
	$.Deferred = function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", $.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", $.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", $.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return $.Deferred(function( newDefer ) {
						$.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								fn = fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ]( $.isFunction( fn ) ?
								function() {
									var returned = fn.apply( this, arguments );
									if ( returned && $.isFunction( returned.promise ) ) {
										returned.promise()
											.done( newDefer.resolve )
											.fail( newDefer.reject )
											.progress( newDefer.notify );
									} else {
										newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
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
				promise: function( obj ) {
					return obj != null ? $.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		$.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ] = list.fire
			deferred[ tuple[0] ] = list.fire;
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},
    MODE = {WHEN:0,ANY:1,SOME:2},
    resolve = function(vals,mode,resolveCount){
        var i = 0,
            resolveValues = [].slice.call( vals ),
            subordinate = resolveValues[0],
            length = resolveValues.length,
            count = resolveCount > length?length:resolveCount,
            // the count of uncompleted subordinates
            remaining = length !== 1 || ( subordinate && $.isFunction( subordinate.promise ) ) ? length : 0,

            // the master Deferred. If resolveValues consist of only a single Deferred, just use that.
            deferred = remaining === 1 ? subordinate : $.Deferred(),
            isCallResolve = false,
            isResolved = function(){
                if(mode === MODE.WHEN){
                    return remaining === 0;
                } else if(mode === MODE.ANY){
                    return true;
                } else if(mode === MODE.SOME){
                    return length - remaining >= count;
                }
            },
            // Update function for both resolve and progress values
            updateFunc = function( i, contexts, values ) {
                return function( value ) {
                    contexts[ i ] = this;
                    values[ i ] = arguments.length > 1 ? [].slice.call( arguments ) : value;
                    if( values === progressValues ) {
                        deferred.notifyWith( contexts, values );
                    } else {
                        --remaining;
                        if(!isCallResolve && isResolved()){
                            var ret,c;
                            isCallResolve = true;
                            if(mode === MODE.ANY){
                                ret = values[ i ];
                            } else if(mode === MODE.SOME){
                                if(count === 1){
                                    ret = values[ i ];
                                } else {
                                    ret = [];
                                    for(c = 0; c < values.length; c++){
                                        if(vals[c].state() === 'resolved'){
                                            ret.push(values[c]);
                                        }
                                    }
                                }
                                
                            } else if(mode === MODE.WHEN){
                                ret = values;
                            }
                            deferred.resolveWith( contexts, ret );
                        }
                    }
                };
            },

            progressValues, progressContexts, resolveContexts;

        // add listeners to Deferred subordinates; treat others as resolved
        if ( length > 1 ) {
            progressValues = new Array( length );
            progressContexts = new Array( length );
            resolveContexts = new Array( length );
            for ( ; i < length; i++ ) {
                if ( resolveValues[ i ] && $.isFunction( resolveValues[ i ].promise ) ) {
                    resolveValues[ i ].promise()
                        .done( updateFunc( i, resolveContexts, resolveValues ) )
                        .fail( deferred.reject )
                        .progress( updateFunc( i, progressContexts, progressValues ) );
                } else {
                    --remaining;
                }
            }
        }

        // if we're not waiting on anything, resolve the master
        if ( !remaining ) {
            deferred.resolveWith( resolveContexts, resolveValues );
        }

        return deferred.promise();
    };

	// Deferred helper
	$.when = function( subordinate /* , ..., subordinateN */ ) {
        return resolve(arguments,MODE.WHEN);
	};


    $.any = function( subordinate /* , ..., subordinateN */ ){
        return resolve(arguments,MODE.ANY);
    };

    $.some = function(){
        var args = [].slice.call( arguments ),
            count = args.pop();
        if(count && $.isFunction(count.promise)){
            args.push(count);
            count = args.length;
        }
        return resolve(args,MODE.SOME,count);
    };

})(Zepto);
