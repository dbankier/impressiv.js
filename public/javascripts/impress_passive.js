/**
 * impress.js
 *
 * impress.js is a presentation tool based on the power of CSS3 transforms and transitions
 * in modern browsers and inspired by the idea behind prezi.com.
 *
 * MIT Licensed.
 *
 * Copyright 2011 Bartek Szopka (@bartaz)
 */
var impressiv = {};

$(document).ready(function() {


    // HELPER FUNCTIONS
    
    var pfx = (function () {

        var style = document.createElement('dummy').style,
            prefixes = 'Webkit Moz O ms Khtml'.split(' '),
            memory = {};
            
        return function ( prop ) {
            if ( typeof memory[ prop ] === "undefined" ) {

                var ucProp  = prop.charAt(0).toUpperCase() + prop.substr(1),
                    props   = (prop + ' ' + prefixes.join(ucProp + ' ') + ucProp).split(' ');

                memory[ prop ] = null;
                for ( var i in props ) {
                    if ( style[ props[i] ] !== undefined ) {
                        memory[ prop ] = props[i];
                        break;
                    }
                }

            }

            return memory[ prop ];
        }

    })();

    var arrayify = function ( a ) {
        return [].slice.call( a );
    };
    
    var css = function ( el, props ) {
        var key, pkey;
        for ( key in props ) {
            if ( props.hasOwnProperty(key) ) {
                pkey = pfx(key);
                if ( pkey != null ) {
                    el.style[pkey] = props[key];
                }
            }
        }
        return el;
    }
    
    var $ = function ( selector, context ) {
        context = context || document;
        return context.querySelector(selector);
    };
    
    var $$ = function ( selector, context ) {
        context = context || document;
        return arrayify( context.querySelectorAll(selector) );
    };
    
    var byId = function ( id ) {
        return document.getElementById(id);
    }

    var translate = function ( t ) {
        return " translate3d(" + t.x + "px," + t.y + "px," + t.z + "px) ";
    };
    
    var rotate = function ( r, revert ) {
        var rX = " rotateX(" + r.x + "deg) ",
            rY = " rotateY(" + r.y + "deg) ",
            rZ = " rotateZ(" + r.z + "deg) ";
        
        return revert ? rZ+rY+rX : rX+rY+rZ;
    };
    
    var scale = function ( s ) {
        return " scale(" + s + ") ";
    }
    
    // CHECK SUPPORT
    
    var ua = navigator.userAgent.toLowerCase();
    var impressSupported = ( pfx("perspective") != null ) &&
                           ( ua.search(/(iphone)|(ipod)|(ipad)|(android)/) == -1 );
    
    // DOM ELEMENTS
    
    var impress = byId("impress");
    
    if (!impressSupported) {
        impress.className = "impress-not-supported";
        return;
    } else {
        impress.className = "";
    }
    
    var canvas = document.createElement("div");
    canvas.className = "canvas";
    
    arrayify( impress.childNodes ).forEach(function ( el ) {
        canvas.appendChild( el );
    });
    impress.appendChild(canvas);
    
    impressiv.steps = $$(".step", impress);
    
    // SETUP
    // set initial values and defaults
    
    document.documentElement.style.height = "100%";
    
    css(document.body, {
        height: "100%",
        overflow: "hidden"
    });

    var props = {
        position: "absolute",
        transformOrigin: "top left",
        transition: "all 0s ease-in-out",
        transformStyle: "preserve-3d"
    }
    
    css(impress, props);
    css(impress, {
        top: "50%",
        left: "50%",
        perspective: "1000px"
    });
    css(canvas, props);
    
    var current = {
        translate: { x: 0, y: 0, z: 0 },
        rotate:    { x: 0, y: 0, z: 0 },
        scale:     1
    };

    impressiv.steps.forEach(function ( el, idx ) {
        var data = el.dataset,
            step = {
                translate: {
                    x: data.x || 0,
                    y: data.y || 0,
                    z: data.z || 0
                },
                rotate: {
                    x: data.rotateX || 0,
                    y: data.rotateY || 0,
                    z: data.rotateZ || data.rotate || 0
                },
                scale: data.scale || 1
            };
        
        el.stepData = step;
        
        if ( !el.id ) {
            el.id = "step-" + (idx + 1);
        }
        
        css(el, {
            position: "absolute",
            transform: "translate(-50%,-50%)" +
                       translate(step.translate) +
                       rotate(step.rotate) +
                       scale(step.scale),
            transformStyle: "preserve-3d"
        });
        
    });

    // making given step active

    impressiv.active = null;

    var hashTimeout = null;
    
    impressiv.select = function ( el ) {

        if ( !el || !el.stepData || el == impressiv.active) {
            // selected element is not defined as step or is already active
            return false;
        }
        
        // Sometimes it's possible to trigger focus on first link with some keyboard action.
        // Browser in such a case tries to scroll the page to make this element visible
        // (even that body overflow is set to hidden) and it breaks our careful positioning.
        //
        // So, as a lousy (and lazy) workaround we will make the page scroll back to the top
        // whenever slide is selected
        //
        // If you are reading this and know any better way to handle it, I'll be glad to hear about it!
        window.scrollTo(0, 0);
        
        var step = el.stepData;
        
        if ( impressiv.active ) {
            impressiv.active.classList.remove("active");
        }
        el.classList.add("active");
        
        impress.className = "step-" + el.id;
        
        // `#/step-id` is used instead of `#step-id` to prevent default browser
        // scrolling to element in hash
        //
        // and it has to be set after animation finishes, because in chrome it
        // causes transtion being laggy
        window.clearTimeout( hashTimeout );
        hashTimeout = window.setTimeout(function () {
            window.location.hash = "#/" + el.id;
        }, 1000);
        
        var target = {
            rotate: {
                x: -parseInt(step.rotate.x, 10),
                y: -parseInt(step.rotate.y, 10),
                z: -parseInt(step.rotate.z, 10)
            },
            translate: {
                x: -step.translate.x,
                y: -step.translate.y,
                z: -step.translate.z
            },
            scale: 1 / parseFloat(step.scale)
        };
        
        // check if the transition is zooming in or not
        var zoomin = target.scale >= current.scale;
        
        // if presentation starts (nothing is active yet)
        // don't animate (set duration to 0)
        var duration = (impressiv.active) ? "1s" : "0";
        
        css(impress, {
            // to keep the perspective look similar for different scales
            // we need to 'scale' the perspective, too
            perspective: step.scale * 1000 + "px",
            transform: scale(target.scale),
            transitionDuration: duration,
            transitionDelay: (zoomin ? "500ms" : "0ms")
        });
        
        css(canvas, {
            transform: rotate(target.rotate, true) + translate(target.translate),
            transitionDuration: duration,
            transitionDelay: (zoomin ? "0ms" : "500ms")
        });
        
        current = target;
        impressiv.active = el;
        
        return el;
    };
    
    // START 
    // by selecting step defined in url or first step of the presentation
    impressiv.select(impressiv.steps[0]);

});

