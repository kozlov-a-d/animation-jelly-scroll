import { JellyScroll } from './jelly-scroll';

// Initialize
JellyScroll.init({
    selectors: {
        container: '.js-jelly-scroll',
        elements: '.l-header, .l-main, .l-footer'
    },
    scroll: {
        spinFactor: 150   // 1 mouse wheel spin = X pixels
    },
    touch: {
        touchFactor: 2    // rate touch speed => scroll speed
    },
    maxSpeed: 15,    // max speed for animate skew
    skewFactor: 0.2  // rate scroll speed => skew angle
});

