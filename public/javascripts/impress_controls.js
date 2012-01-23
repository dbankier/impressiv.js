/**
 * impressiv.js
 *
 * impressiv.js is a presentation tool based on the power of CSS3 transforms and transitions
 * in modern browsers and inspired by the idea behind prezi.com.
 *
 * MIT Licensed.
 *
 * Copyright 2011 Bartek Szopka (@bartaz)
*/

$(document).ready(function() {
    
    var byId = function ( id ) {
        return document.getElementById(id);
    }

  var selectPrev = function () {
    var prev = impressiv.steps.indexOf( impressiv.active ) - 1;
    prev = prev >= 0 ? impressiv.steps[ prev ] : impressiv.steps[ impressiv.steps.length-1 ];
    impressiv.send(prev); 
    return impressiv.select(prev);
  };

  var selectNext = function () {
    var next = impressiv.steps.indexOf( impressiv.active ) + 1;
    next = next < impressiv.steps.length ? impressiv.steps[ next ] : impressiv.steps[ 0 ];
    impressiv.send(next);
    return impressiv.select(next);
  };

  // EVENTS

  document.addEventListener("keydown", function ( event ) {
    if ( event.keyCode == 9 || ( event.keyCode >= 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40) ) {
      switch( event.keyCode ) {
        case 33: ; // pg up
        case 37: ; // left
        case 38:   // up
          selectPrev();
        break;
        case 9:  ; // tab
        case 32: ; // space
        case 34: ; // pg down
        case 39: ; // right
        case 40:   // down
          selectNext();
        break;
      }

      event.preventDefault();
    }
  }, false);

  document.addEventListener("click", function ( event ) {
    // event delegation with "bubbling"
    // check if event target (or any of its parents is a link or a step)
    var target = event.target;
    while ( (target.tagName != "A") &&
           (!target.stepData) &&
             (target != document.body) ) {
      target = target.parentNode;
    }

    if ( target.tagName == "A" ) {
      var href = target.getAttribute("href");

      // if it's a link to presentation step, target this step
      if ( href && href[0] == '#' ) {
        target = byId( href.slice(1) );
      }
    }

    if ( impressiv.select(target) ) {
      impressiv.send(target);  
      event.preventDefault();
    }
  }, false);

  var getElementFromUrl = function () {
    // get id from url # by removing `#` or `#/` from the beginning,
    // so both "fallback" `#slide-id` and "enhanced" `#/slide-id` will work
    return byId( window.location.hash.replace(/^#\/?/,"") );
  }

  window.addEventListener("hashchange", function () {
    var target = getElementFromUrl();  
    impressiv.select(target);
    impressiv.send(target);
  }, false);
});

