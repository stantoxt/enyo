require('enyo');

var
	dispatcher = require('../dispatcher'),
	emitter = require('../EventEmitter');

/**
* This module handles the animation events for the character.
* If the character has opted to have animations handled by animation framework,
* then it can add "handleAnimationEvents" as true as its property.
* The character can also mention which events he wants to be handled by the framework by
* providing list of animation events in "animationEvents" block like;
* { 
*	name: "myKind",
*	animationEvents: [
*		"scroll",
*		"mousewheel",
*		"touchstart",
*		"touchmove",
*		"touchend"
*	]
* }
*
* By default these events are handled within the framework(others for now have to be handled by the application).
* 
* This module is here temporarily, need to have a proper mechanism 
* like dispatcher to handle animation related events along with application events.
* 
* @module enyo/AnimationSupport/EventDelegator
*/
var EventDelegator = {

	/**
	* @private
	*/
	eventArray: [
		"drag",
		"scroll",
		"dragstart",
		"mousewheel",
		"touchstart",
		"touchmove",
		"touchend"
	],

	/**
	* Attaches the evnet handlers to the character either its own events or
	* else default events with the framework. As of now only these events are 
	* supported;
	* - scroll
	* - touch
	* - mousewheel
	* @public
	*/
	register: function (charc) {
		var events = charc.animationEvents || this.eventArray;
		for (var i = 0, l = events.length; i < l; i++) {
			this.addRemoveListener(charc, events[i]);
		}
	},

	/**
	* Detaches the evnet handlers from the character either its own events or
	* else default events from with the framework. As of now only these events are 
	* supported;
	* - scroll
	* - touch
	* - mousewheel
	* @public
	*/
	deRegister: function (charc) {
		var events = charc.animationEvents || this.eventArray;
		for (var i = 0, l = events.length; i < l; i++) {
			this.addRemoveListener(charc, events[i], true);
		}
	},

	/**
	* @private
	*/
	addRemoveListener: function(charc, name, remove) {
		var d = remove ? dispatcher.stopListening : dispatcher.listen;
		d(charc.hasNode(), name, charc.bindSafely(this[name + 'Event'], charc));

		var fn = remove ? emitter.off : emitter.on;
		fn.apply(emitter, [name, charc[charc.animationEventHandler], charc]);
	},

	emitEvent: function(charc, name, data) {
		emitter.emit.apply(emitter, [charc.eventName, data]);
	},

	/**
	* @private
	*/
	touchstartEvent: function (sender, ev) {
		sender.touchX = ev.targetTouches[0].pageX;
		sender.touchY = ev.targetTouches[0].pageY;
		sender.eventName = "touchstart";
	},

	/**
	* @private
	*/
	touchmoveEvent: function (sender, ev) {
		var x = ev.targetTouches[0].pageX,
			y = ev.targetTouches[0].pageY;
			
		if(x !== 0 || y !== 0) {
			/*sender.animDelta[0] = sender.touchX - x;
			sender.animDelta[1] = sender.touchY - y;
			sender.animDelta[2] = 0;*/

			var o = {
				dX: (sender.touchX - x),
				dY: (sender.touchY - y),
				dZ: 0
			};
			sender.setAnimationDelta(o);
			sender.touchX = x;
			sender.touchY = y;

			sender.eventName = "touchmove";
		}
	},

	/**
	* @private
	*/
	touchendEvent: function (sender, ev) {
		sender.touchX = 0;
		sender.touchY = 0;
		sender.eventName = "touchend";
	},
	
	/**
	* @private
	*/
	scrollEvent: function (inSender, inEvent) {
		var delta = inSender.deltaY,
			scrollTop = inSender.target.scrollTop,
			scrollLeft = inSender.target.scrollLeft;

		if (this.scrollValue === 0) {
			this.scrollValue = inSender.target.scrollTop;
		}

		delta = inSender.target.scrollTop - this.scrollValue;

		this.deltaX = scrollLeft - this.deltaX;
		this.deltaY = scrollTop - this.deltaY;
		this.scrollValue = scrollTop;

		this.deltaX = scrollLeft;
		this.deltaY = scrollTop;

		/*this.animDelta[0] = delta;
		this.animDelta[1] = 0;
		this.animDelta[2] = 0;*/

		var o = {
			dX: delta,
			dY: 0,
			dZ: 0
		};
		this.setAnimationDelta(o);

		this.eventName = "scroll";
	},

	/**
	* @private
	*/
	dragstartEvent: function (inSender, inEvent) {
		this.dragLeft = inEvent.offsetX,
		this.dragTop = inEvent.offsetY;
		this.eventName = "dragstart";
	},

	/**
	* @private
	*/
	dragEvent: function (inSender, inEvent) {
		var dragLeft = inEvent.offsetX,
			dragTop = inEvent.offsetY;
		if (dragLeft && dragTop) {
			this.deltaX = this.dragLeft - dragLeft;
			this.deltaY = this.dragTop - dragTop;
			
			this.dragLeft = dragLeft,
			this.dragTop = dragTop;

			/*this.animDelta[0] = this.deltaX;
			this.animDelta[1] = this.deltaY;
			this.animDelta[2] = 0;*/

			var o = {
				dX: this.deltaX,
				dY: this.deltaY,
				dZ: 0
			};
			this.setAnimationDelta(o);

			this.eventName = "drag";
		}
	},

	/**
	* @private
	*/
	mousewheelEvent: function (sender, ev) {
		/*sender.animDelta[0] = ev.deltaY;
		sender.animDelta[1] = ev.deltaX;
		sender.animDelta[2] = 0;*/
		
		var o = {
			dX: ev.deltaX,
			dY: ev.deltaY,
			dZ: 0
		};
		sender.setAnimationDelta(o);

		sender.eventName = "mousewheel";
	}
};

module.exports = EventDelegator;