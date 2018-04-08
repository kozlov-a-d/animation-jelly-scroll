import { JellyScroll } from './jelly-scroll';

// Initialize
JellyScroll.init({
    selectors: {
        container: '.js-jelly-scroll',
        elements: '.l-header, .l-main, .l-footer'
    },
    scroll: {
        spinFactor: 150   // коэффициент, 1 вращение колёсика равняется Х пикселям
    },
    maxSpeed: 15,    // максимальная скорость
    skewFactor: 0.2  // коэфициент превращения скорости в угол наклона
});

