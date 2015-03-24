/**
 * Скрипты для работы с кораблями
 *
 * User: DevilRep
 * Date: 13.12.12
 */

/**
 * Работа со всеми картинками кораблей
 *
 * Пробегает по всем кораблям-картинкам и устанавливает свойства
 *
 * @param {String} s_command команда установки свойств: drag_add - установить drag&drop
 *                                             drag_delete - снять drag&drop
 *                                             move - передвинуть
 */
function forAllShip(s_command){
    var a_ship_type = {
        big : true,
        medium : true,
        small : true,
        tiny : true
    };
    var i_max_count = Math.max(SHIP_COUNT_BIG, SHIP_COUNT_MEDIUM, SHIP_COUNT_SMALL, SHIP_COUNT_TINY);
    for(var i in a_ship_type) {
        for(var j = 1; j <= i_max_count ; j ++){
            var o_ship = $("#" + i + "-ship-" + j);
            switch(s_command){
                case 'drag_add' :
                    o_ship.draggable({
                        grid : [CELL_SIZE + 2 * FIELD_BORDER, CELL_SIZE + 2 * FIELD_BORDER],
                        containment : '#battleship-field-user',
                        start: shipStartDrag,
                        drag:shipDrag
                    });
                    break;
                case 'drag_delete':
                    o_ship.draggable('destroy');
                    break;
                case 'move':
                    o_ship.css('left', parseInt(o_ship.css('left')) - FIELD_MARGIN_LEFT_EDITOR + FIELD_MARGIN_LEFT_GAME);
                    o_ship.css('top', parseInt(o_ship.css('top')) - FIELD_MARGIN_TOP_EDITOR+ FIELD_MARGIN_TOP_GAME);
                    break;
            }
        }
    }
}

/**
 * Скрипт создания картинок кораблей
 *
 * Возвращает строку на html для подучения корабля-картинки
 *
 * @param {String} s_type     размер корабля
 * @param {String} id         идентификатор корабля
 * @return {String}           строчное представление корабля-картинки
 */
function getShip(s_type, id){
    var a_title = {
        big : "Большой",
        medium : "Средний",
        small : "Маленький",
        tiny : "Крошечный"
    };
    var a_size = {
        big : 4,
        medium : 3,
        small : 2,
        tiny : 1
    };
    var a_top = {
        big : 0,
        medium : 1 * (CELL_SIZE + 2 * FIELD_BORDER),
        small : 2 * (CELL_SIZE + 2 * FIELD_BORDER),
        tiny : 3 * (CELL_SIZE + 2 * FIELD_BORDER)
    };
    return "<img id = '" + s_type + "-ship-" + id + "' src = 'image/" + s_type + "-ship-gorisont.png' style = 'position : absolute;" +
        "top : " + (a_top[s_type]) + "px;" + "left : 0px;" +
        "width : " + (a_size[s_type] * CELL_SIZE + 2 * FIELD_BORDER * a_size[s_type]) + ";height : " + (CELL_SIZE + 2 * FIELD_BORDER) + ";' alt = '" + a_title[s_type] + "' title = '" + a_title[s_type] + "'>";
}

/**
 * Разворот корабля
 *
 * Поворачивает корабль
 *
 * @param {Object} a_ship      параметры корабля:
 *                               id - идентификатор
 *                               is_gorisontal - положение
 * @param {Boolean} no_rotate  повернуть корабль относительно указанного расположения(false)
 *                             или повернуть до указанного расположения.
 * @return {Boolean}
 */
function shipRotate(a_ship,no_rotate){
    var a_size = {
        'big': 4,
        'med': 3,
        'sma': 2,
        'tin': 1
    };
    var s_position = 'vertical';
    if(!no_rotate)
        a_ship['is_gorisontal'] = !a_ship['is_gorisontal'];

    if(a_ship['is_gorisontal'])
        s_position = 'gorisont';
    else
        s_position = 'vertical';

    var o_ship_img = document.getElementById(a_ship['id']);
    if(!elementExist(o_ship_img,a_ship['id']))
        return false;

    o_ship_img.src = o_ship_img.src.substring(0, o_ship_img.src.length - 12) + s_position + '.png';
    o_ship_img.style.width = CELL_SIZE + 2 * FIELD_BORDER;
    o_ship_img.style.height = CELL_SIZE + 2 * FIELD_BORDER;
    var i_lenght = a_size[a_ship['id'].substring(0, 3)] * (CELL_SIZE + 2 * FIELD_BORDER);
    if(a_ship['is_gorisontal'])
        o_ship_img.style.width = i_lenght;
    else
        o_ship_img.style.height = i_lenght;
    return false;
}

/**
 * Случайная расстановка
 *
 * Случано расстанавливает корабли
 *
 * @param {String} s_field поле, на котором нужно расставить корабли: user - пользователь
 *                                                           enemy - противник
 */
function setShipRandom(s_field){
    dump('start random');
    var a_size = {
        1 : SHIP_COUNT_TINY,
        2 : SHIP_COUNT_SMALL,
        3 : SHIP_COUNT_MEDIUM,
        4 : SHIP_COUNT_BIG
    };
    var a_ship = {};
    var a_type = {
        1 : 'tiny',
        2 : 'small',
        3 : 'medium',
        4 : 'big'
    };
    var a_cell = {};
    var a_cell_blocked = {};
    for(var i_size = 4; i_size > 0; i_size --){
        var i_count = parseInt(a_size[i_size]);
        for(var i_current = 1; i_current <= i_count; i_current ++){
            var has_error = false;
            var i_position_top = 0;
            var i_position_left = 0;
            var i_height = 1;
            var i_width = 1;
            do{
                i_height = 1;
                i_width = 1;
                has_error = false;
                //получим позицию будущего корабля
                i_position_top = getRandom(1, FIELD_SIZE);
                i_position_left = getRandom(1, FIELD_SIZE);
                var is_gorisontal = getRandom(0, 1);
                if(is_gorisontal)
                    i_width = i_size;
                else
                    i_height = i_size;

                if(i_width + i_position_left - 1 > FIELD_SIZE || i_height + i_position_top - 1 > FIELD_SIZE){
                    has_error = true;
                    continue;
                }

                a_cell = shipShadow({
                    'i_top' : i_position_top,
                    'i_left' : i_position_left,
                    'i_height' : i_height,
                    'i_width' : i_width,
                    'without_shadow' : true
                });
                for(var i in a_cell){
                    if(a_cell_blocked[i]){
                        has_error = true;
                        break;
                    }
                }
            }
            while(has_error);
            var a_shadow = shipShadow({
                'i_top' : i_position_top,
                'i_left' : i_position_left,
                'i_height' : i_height,
                'i_width' : i_width
            });
            a_ship[a_type[i_size] + "-ship-" + i_current] = {
                'id' : a_type[i_size] + "-ship-" + i_current,
                'i_left' : i_position_left,
                'i_top' : i_position_top,
                'a_cell' : a_cell,
                'is_gorisontal' : i_width > i_height,
                'a_shadow' : a_shadow
            };
            for(var i in a_shadow){
                a_cell_blocked[i] = i;
            }
        }
    }
    if(s_field === 'user'){
        a_cell_block = {};
        a_ship_user = a_ship;
        i_ship_set = SHIP_COUNT_BIG+ SHIP_COUNT_MEDIUM + SHIP_COUNT_SMALL + SHIP_COUNT_TINY;
        showShips();
    }else{
        a_cell_enemy = {};
        a_ship_enemy = a_ship;
    }
}

/**
 * Отображение случайной расстановки
 *
 * Отображает случайную расстановку кораблей для пользователя. Устанавливает
 * картинки количества неустановленных кораблей в 0
 *
 * @return {Boolean}
 */
function showShips(){
    for(var i in a_ship_user){
        var i_left = (a_ship_user[i]['i_left'] - 1) * (CELL_SIZE + 2 * FIELD_BORDER);
        var i_top = (a_ship_user[i]['i_top'] - 1) * (CELL_SIZE + 2 * FIELD_BORDER);
        var o_ship = document.getElementById(a_ship_user[i]['id']);
        if(!elementExist(o_ship,a_ship_user[i]['id']))
            return false;
        o_ship.style.left = i_left - (FIELD_SIZE + 1) * (CELL_SIZE + 2 * FIELD_BORDER);
        o_ship.style.top = i_top;
        shipRotate(a_ship_user[i],true);
    }
    getCountShip('big', -1 * SHIP_COUNT_BIG);
    getCountShip('medium', -1 * SHIP_COUNT_MEDIUM);
    getCountShip('small', -1 * SHIP_COUNT_SMALL);
    getCountShip('tiny', -1 * SHIP_COUNT_TINY);
    return true;
}