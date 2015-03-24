/**
 * Константы
 *
 * User: DevilRep
 * Date: 13.12.12
 */

/**
 * Размер поля в клетках
 *
 * @type {Number}
 */
var FIELD_SIZE = 10;

/**
 * Размер клетки (в пикселях)
 *
 * @type {Number}
 */
var CELL_SIZE = 40;

/**
 * Отступ слева от эрана для в режиме редактора
 *
 * @type {Number}
 */
var FIELD_MARGIN_LEFT_EDITOR = 200;

/**
 * Отступ сверху от эрана для в режиме редактора
 *
 * @type {Number}
 */
var FIELD_MARGIN_TOP_EDITOR = 10;

/**
 * Отступ слева от эрана для в режиме игры
 *
 * @type {Number}
 */
var FIELD_MARGIN_LEFT_GAME = 100;

/**
 * Отступ сверху от эрана для в режиме игры
 *
 * @type {Number}
 */
var FIELD_MARGIN_TOP_GAME = 150;

/**
 * Размер рамки для каждой клетки
 *
 * @type {Number}
 */
var FIELD_BORDER = 1;

//корабли
/**
 * Количество четырехпалуных кораблей
 *
 * @type {Number}
 */
var SHIP_COUNT_BIG = 1;

/**
 * Количество трехпалубных кораблей
 *
 * @type {Number}
 */
var SHIP_COUNT_MEDIUM = 2;

/**
 * Количество двухпалубных кораблей
 *
 * @type {Number}
 */
var SHIP_COUNT_SMALL = 3;

/**
 * Количество однопалубных кораблей
 *
 * @type {Number}
 */
var SHIP_COUNT_TINY = 4;

/**
 * Массив букв для отображения вокруг поля
 *
 * @type {Object}
 */
var A_SIMBOL = {
    1 : 'А',
    2 : 'Б',
    3 : 'В',
    4 : 'Г',
    5 : 'Д',
    6 : 'Е',
    7 : 'Ж',
    8 : 'З',
    9 : 'И',
    10 :'К'
};

/**
 * Определяет типы расположения букв:
 *   0 - только цифры,
 *   1 - вертикаль,
 *   2 - горизонталь,
 *   3 - только буквы
 *
 * @type {Number}
 */
var I_SIMBOL = 1;

/**
 * Скорость анимации возврата в милисекундах
 *
 * @type {Number}
 */
var SPEED_ANIMATION_REVERT = 5000;

/**
 * Время задержки между выстрелами противника
 *
 * @type {Number}
 */
var SHUT_TIME = 1000;