// Tappie 1.0.0 Copyright (C) 2014 Yuya Hashimoto, MIT License.
// See https://github.com/yuya/tappie
;(function (global, document) {
    var touch        = {},
        hasTouch     = "ontouchstart" in global,
        touchStart   = hasTouch ? "touchstart"  : "mousedown",
        touchMove    = hasTouch ? "touchmove"   : "mousemove",
        touchEnd     = hasTouch ? "touchend"    : "mouseup",
        touchCancel  = hasTouch ? "touchcancel" : "mouseleave",
        longTapDelay = 750,
        touchTimeout, tapTimeout, swipeTimeout, longTapTimeout
    ;

    function createEvent(eventName) {
        var event = document.createEvent("Event");
        event.initEvent(eventName, true, true, null, null, null, null, null, null, null, null, null, null, null, null);

        return event;
    }

    function triggerEvent(element, eventName) {
        element.dispatchEvent(createEvent(eventName));
    }

    function swipeDirection(x1, x2, y1, y2) {
        return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ?
                (x1 - x2 > 0 ? "left" : "right") :
                (y1 - y2 > 0 ? "up"   : "down")
        ;
    }

    function longTap() {
        longTapTimeout = null;

        if (touch.el) {
            triggerEvent(touch.el, "longtap");
            resetTouch();
        }
    }

    function resetTouch() {
        touch = {};
    }

    function cancelLongTap() {
        if (longTapTimeout) {
            clearTimeout(longTapTimeout);
        }

        longTapTimeout = null;
    }

    function cancelAll() {
        var ary = [touchTimeout, tapTimeout, swipeTimeout, longTapTimeout],
            i   = 0,
            l   = ary.length,
            itr;

        for (; l; ++i, --l) {
            itr = ary[i];

            if (itr) {
                clearTimeout(itr);
            }
        }

        touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null;
        resetTouch();
    }

    function touchHandler() {
        var deltaX = 0,
            deltaY = 0,
            firstTouch, now, delta, tapEvent;

        function handleTouchStart(event) {
            firstTouch = hasTouch ? event.touches[0] : event;
            now        = Date.now();
            delta      = now - (touch.last || now);
            touch.el   = "tagName" in firstTouch.target ? firstTouch.target : firstTouch.target.parentNode;

            if (touchTimeout) {
                clearTimeout(touchTimeout);
            }

            touch.x1 = firstTouch.pageX;
            touch.y1 = firstTouch.pageY;

            if (delta > 0 && delta <= 250) {
                touch.isDoubleTap = true;
            }

            touch.last     = now;
            longTapTimeout = setTimeout(longTap, longTapDelay);

        }

        function handleTouchMove(event) {
            firstTouch = hasTouch ? event.touches[0] : event;
            cancelLongTap();

            touch.x2 = firstTouch.pageX;
            touch.y2 = firstTouch.pageY;

            deltaX += Math.abs(touch.x1 - touch.x2);
            deltaY += Math.abs(touch.y1 - touch.y2); 
        }

        function handleTouchEnd() {
            cancelLongTap();
            
            if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
                (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30)) {

                swipeTimeout = setTimeout(function () {
                    triggerEvent(touch.el, "swipe");
                    triggerEvent(touch.el, "swipe" + swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2));

                    resetTouch();
                }, 0);
            }
            else if ("last" in touch) {
                if (deltaX < 30 && deltaY < 30) {
                    tapTimeout = setTimeout(function () {
                        tapEvent = createEvent("tap");
                        tapEvent.cancelTouch = cancelAll;

                        touch.el.dispatchEvent(tapEvent);

                        if (touch.isDoubleTap) {
                            triggerEvent(touch.el, "doubletap");
                            resetTouch();
                        }
                        else {
                            touchTimeout = setTimeout(function () {
                                touchTimeout = null;
                                triggerEvent(touch.el, "singletap");
                                resetTouch();
                            }, 250);
                        }
                    }, 0);
                }
                else {
                    resetTouch();
                }

                deltaX = deltaY = 0;
            }
        }

        document.addEventListener(touchStart, function (event) { handleTouchStart(event);  }, false);
        document.addEventListener(touchMove,  function (event) { handleTouchMove(event);   }, false);
        document.addEventListener(touchEnd,   function ()      { handleTouchEnd();         }, false);

        document.addEventListener(touchCancel, cancelAll, false);
        global.addEventListener("scroll",      cancelAll, false);
    }

    document.addEventListener("DOMContentLoaded", touchHandler, false); 
})(this, this.document);
