import { normalizeWheel } from './libs/normalize-wheel';
import { debounce } from './utilities/decorators';
import { objectsMergeDeep } from './utilities/objects';
import { TweenLite } from 'gsap'; 

export let JellyScroll = (function() {

    let self = {  
        state: {
            isScrolling: false  // осуществляется ли в данный момент скролинг
        },
        selectors: {
            container: '.js-jelly-scroll',
            elements: '.js-jelly-scroll > *'
        },
        scroll: {
            curr: 0,     // текущее положение скрола
            prev: 0,     // предыдущее положение скрола
            min: 0,      // минимальное положение скрола
            max: 0,      // максимальное положение скрола, расчитывается в calcParams
            spinFactor: 150   // коэффициент, 1 вращение колёсика равняется Х пикселям
        },
        lastTime: 0,     // 
        maxSpeed: 15,    // максимальная скорость
        skewFactor: 0.2  // коэфициент превращения скорости в угол наклона
        
    };

    let setOptions = function(options){
        self = objectsMergeDeep(self, options);
    }

    let calcParams = function(){
        self.scroll.max = document.querySelector(self.selectors.container).offsetHeight - window.innerHeight;
    }

    let setScroll = function(e){
        self.scroll.prev = self.scroll.curr;
        self.scroll.curr += normalizeWheel(e).spinY*self.scroll.spinFactor;
        if ( self.scroll.curr <= self.scroll.min ) self.scroll.curr = self.scroll.min;
        if ( self.scroll.curr >= self.scroll.max ) self.scroll.curr = self.scroll.max;
    }

    let animateSkew = function(e) {
        if(self.state.isScrolling) {
            let speed = (self.scroll.curr - self.scroll.prev) / (e - self.lastTime);
            if(speed < -self.maxSpeed) speed = -self.maxSpeed;
            if(speed > self.maxSpeed) speed = self.maxSpeed;
            TweenLite.to(self.selectors.elements, 1,{
                skewY: -speed*self.skewFactor,
                overwrite: 5, // preexisting
            });
            self.lastTime = e;
        }
        window.requestAnimationFrame(animateSkew);
    }

    let animateSkewToIdle = function() {
        TweenLite.to(self.selectors.elements, 0.4,{ skewY: 0,  overwrite: 5});
    }

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

    let checkScrollLimit = debounce(function(){
        if ( self.scroll.curr >= self.scroll.max ) {
            self.scroll.curr = self.scroll.max;
            animateScrollTo();
        }
    }, 100);

    // HANDLERS ========================================================================================================

    let addHandlerScroll = function(callback){
        document.addEventListener('wheel', function(e){
            e.preventDefault();
            callback(e);
        })
    }

    let addHandlerResize = function(callback){
        window.addEventListener('resize', function(e){
            e.preventDefault();
            callback(e);
        })
    }

    // INIT ============================================================================================================


    // PUBLIC ==========================================================================================================
    return Object.freeze({
        init: function(options){
            setOptions(options);
            calcParams();
            animateSkew();
            addHandlerScroll( function(e){
                if(!self.state.isScrolling) self.state.isScrolling = true;
                setScroll(e);
                animateScrollTo();
            });
            addHandlerResize(function(){
                calcParams();
                checkScrollLimit();
            })
        }
    });

})();
