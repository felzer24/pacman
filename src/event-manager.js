/*
 * Manages one-off and repeating events. Each event is associated with an entity
 * such that removing that entity will clear its events.
 */

/*global Delay, bind, values */

function EventManager() {
    this.events = {};
    this.nextEventId = 0;
//    this.objectEvents = {};
}

function assert(test) {
    if (!test) {
        debugger;
    }
}

EventManager.prototype = {

    // Associates a delayed fn with src that executes after given number of
    // ticks. An optional number of repeats may be provided. The source object
    // is `this' when the function is executed.
    delay: function (src, ticks, fn, repeats) {
        assert(src);
        assert(ticks);
        assert(fn instanceof Function);
        var id = this.nextEventId++;
        var manager = this;
        var event = new Delay(ticks, function () {
            fn.call(src);
            if (this._repeats === undefined || --this._repeats === 0) {
                manager.cancel(id);
            } else {
                this.reset();
            }
        });
        event._repeats = repeats;
        event._running = true;

        this.events[id] = event;
        // if (!this.objectEvents[src]) {
        //     this.objectEvents[src] = [];
        // }
        // this.objectEvents[src].push(id);
        return id;
    },

    repeat: function (src, ticks, fn, repeats) {
        return this.delay(src, ticks, fn, repeats || Infinity);
    },

    reset: function (eventId) {
        this.events[eventId].reset();
    },

    // Suspends an event and optionally resumes after elapsed ticks
    suspend: function (eventId, ticks) {
        this.events[eventId]._running = false;
        if (ticks) {
            this.delay(this, ticks, function () {
                this.resume(eventId);
            });
        }
    },

    resume: function (eventId) {
        this.events[eventId]._running = true;
    },

    cancel: function (eventId) {
        delete this.events[eventId];
    },

    // cancelAll: function (src) {
    //     if (src) {
    //         delete this.events[src];
    //     } else {
    //         this.events = {};
    //     }
    // },

    update: function () {
        values(this.events).filter(function (event) {
            return event._running;
        }).forEach(function (event) {
            event.update();
        });
    }
};
