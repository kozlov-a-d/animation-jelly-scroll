/**
 * Debouncing
 * Декоратор позволяет превратить несколько вызовов функции в течение определенного времени в один вызов,
 * причем задержка начинает заново отсчитываться с каждой новой попыткой вызова.
 * Возможно два варианта:
 * - Реальный вызов происходит только в случае, если с момента последней попытки прошло время,
 *   большее или равное задержке.
 * - Реальный вызов происходит сразу, а все остальные попытки вызова игнорируются, пока не пройдет время,
 *   большее или равное задержке, отсчитанной от времени последней попытки.
 * @param func {function} - callback функция
 * @param ms {number} - время задержики
 * @returns {function}
 */
export function debounce(func, ms) {

    var timer = null;

    return function () {
        var _this = this;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var onComplete = function onComplete() {
            func.apply(_this, args);
            timer = null;
        };

        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(onComplete, ms);
    };
}

/**
 * Throttling
 * Данный декоратор позволяет «затормозить» функцию — функция будет выполняться не чаще одного раза в указанный период,
 * даже если она будет вызвана много раз в течение этого периода.
 * Т.е. все промежуточные вызовы будут игнорироваться.
 * @param func {function} - callback функция
 * @param ms {number} - время задержики
 * @returns {function}
 */
export function throttle(func, ms) {

    var isThrottled = false,
        savedArgs,
        savedThis;

    function wrapper() {

        if (isThrottled) {
            savedArgs = arguments;
            savedThis = this;
            return;
        }

        func.apply(this, arguments);

        isThrottled = true;

        setTimeout(function() {
            isThrottled = false;
            if (savedArgs) {
                wrapper.apply(savedThis, savedArgs);
                savedArgs = savedThis = null;
            }
        }, ms);
    }

    return wrapper;
}
