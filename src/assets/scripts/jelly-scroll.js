import { normalizeWheel } from './libs/normalize-wheel';
import { debounce } from './utilities/decorators';
import { objectsMergeDeep } from './utilities/objects';
import { TweenLite } from 'gsap'; 

/**
 * JellyScroll plugin
 * - disables default scrolling
 */
export let JellyScroll = (function() {

    let self = {  
        state: {
            isScrolling: false,  // scrolls right now
            isTouchMove: false  // touchmove right now
        },
        selectors: {
            container: '.js-jelly-scroll',
            elements: '.js-jelly-scroll > *'
        },
        scroll: {
            curr: 0,          // current scroll position
            prev: 0,          // previous scroll position
            min: 0,           // minimum scroll position
            max: 0,           // maximum scroll position, calculation in calcParams()
            spinFactor: 150   // 1 mouse wheel spin = X pixels
        },
        touch: {
            startVal: 0,
            startTime: 0,
            curr: 0,          // current touch position
            prev: 0,          // previous touch position
            touchFactor: 1,    // rate touch speed => scroll speed
            frictionInertia: 0.6
        },
        lastTime: 0,          // 
        maxSpeed: 15,         // max speed for animate skew
        skewFactor: 0.2       // rate scroll speed => skew angle
    };

    /**
     * Apply custom options
     * @param {object} options custom options 
     */
    let setOptions = function(options){
        self = objectsMergeDeep(self, options);
    }

    /**
     * Сalculation of the required values
     */
    let calcParams = function(){
        self.scroll.max = document.querySelector(self.selectors.container).offsetHeight - window.innerHeight;
    }

    /**
     * Verify that the limits of scrolling
     */
    let verifyScrollLimits = function(){
        if ( self.scroll.curr <= self.scroll.min ) self.scroll.curr = self.scroll.min;
        if ( self.scroll.curr >= self.scroll.max ) self.scroll.curr = self.scroll.max;
    }

    /**
     * Normalize and set actualy value of scroll
     * @param {event} e scroll event 
     */
    let setScroll = function(e){
        self.scroll.prev = self.scroll.curr;
        self.scroll.curr += normalizeWheel(e).spinY*self.scroll.spinFactor;
        verifyScrollLimits();
    }

    /**
     * Check touch 
     * @param {*} e touchmove event 
     */
    let setTouch = function(e){
        self.touch.prev = self.touch.curr;
        self.touch.curr = e.touches[0].screenY;
        let delta = self.touch.curr - self.touch.prev
        return delta;
    }

    /**
     * Convert touch to scroll
     * @param {number} delta 
     */
    let convertTouchToScroll = function(delta){
        self.scroll.prev = self.scroll.curr;
        self.scroll.curr += -delta * self.touch.touchFactor * window.devicePixelRatio;
        verifyScrollLimits();
    }

    /**
     * Check whether inertia is needed when touchend and create if necessary
     * @param  {function} cb callback function
     */
    let checkTouchInertia = function(cb){
        let deltaTimeTouch = Date.now() - self.touch.startTime;
        let deltaValTouch = Math.abs(self.touch.curr) - Math.abs(self.touch.startVal);

        if( Math.abs(deltaValTouch) > deltaTimeTouch ){
            let inertia = setInterval(function() {
                convertTouchToScroll(deltaValTouch);
                animateScrollTo();
                deltaValTouch = deltaValTouch * self.touch.frictionInertia;
                if( deltaValTouch < 10 ) {
                    clearInterval(inertia);
                    cb();
                }
            }, 16);
        } else {
            cb();
        }
    }

    /**
     * Starts requestAnimationFrame, which animate of skew blocks on scroll
     * @param {*} e
     */
    let animateSkew = function(e) {
        if(self.state.isScrolling || self.state.isTouchMove ) {
            let speed = (self.scroll.curr - self.scroll.prev) / (e - self.lastTime);
            if(speed < -self.maxSpeed) speed = -self.maxSpeed;
            if(speed > self.maxSpeed) speed = self.maxSpeed;
            if( self.state.isTouchMove ) speed = speed*2; // magic const =)
            TweenLite.to(self.selectors.elements, 1,{
                skewY: -speed*self.skewFactor,
                overwrite: 5, // preexisting
            });
            self.lastTime = e;
        }
        window.requestAnimationFrame(animateSkew);
    }

    /**
     * Animation skew blocks in normal state
     */
    let animateSkewToIdle = function() {
        TweenLite.to(self.selectors.elements, 0.4,{ skewY: 0,  overwrite: 5});
    }

    /**
     * Animate of custom scroll
     */
    let animateScrollTo = function(){
        TweenLite.to(self.selectors.container ,0.5,{
            y:-self.scroll.curr,
            overwrite: 5, // preexisting
            onComplete: function() {
                self.state.isScrolling = false;
                animateSkewToIdle();
            }
        });
    }

    /**
     * Check limit of scroll and fix
     */
    let updateMaxScrollOnResize = debounce(function(){
        if ( self.scroll.curr >= self.scroll.max ) {
            self.scroll.curr = self.scroll.max;
            animateScrollTo();
        }
    }, 100);


    // HANDLERS ========================================================================================================

    /**
     * Add handler for mouse wheel, disables default scrolling
     * @param {function} cb callback function
     */
    let addHandlerMouseWheel = function(cb){
        document.addEventListener('wheel', function(e){
            e.preventDefault();
            if(!self.state.isScrolling) self.state.isScrolling = true;
            cb(e);
        })
    }

    /**
     * Add handler for resize
     * @param {function} cb callback function
     */
    let addHandlerResize = function(cb){
        window.addEventListener('resize', function(e){
            e.preventDefault();
            cb(e);
        })
    }

    /**
     * Add handler for touchmove
     * @param {function} cb callback function
     */
    let addHandlerTouch = function(cb){
        window.addEventListener('touchstart', function(e){
            if(!self.state.isTouchMove) self.state.isTouchMove = true;
            self.touch.startTime = Date.now();
            self.touch.startVal =  e.touches[0].screenY;
            self.touch.curr = e.touches[0].screenY;
        })
        window.addEventListener('touchmove', function(e){
            cb(e);
        })
        window.addEventListener('touchend', function(){
            checkTouchInertia(function(){
                self.state.isTouchMove = false;
            })
        })      
    }


    // INIT ============================================================================================================


    // PUBLIC ==========================================================================================================
    
    return Object.freeze({
        /**
         * Initialize jelly-scroll
         * @param {object} options custom options ( if necessary )
         */
        init: function(options){
            // preparation
            setOptions(options);
            calcParams();
            animateSkew();
            // listen to scrolling event
            addHandlerMouseWheel( function(e){
                setScroll(e);
                animateScrollTo();
            });
            // listen to touch event
            addHandlerTouch(function(e){
                convertTouchToScroll(setTouch(e));
                animateScrollTo();
            });
            // recalculate on resize
            addHandlerResize(function(){
                calcParams();
                updateMaxScrollOnResize();
            });
        }
    });

})();
