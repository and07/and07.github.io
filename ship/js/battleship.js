// это основной файл игры "морской бой"

//переменные
/**
 * Для режима редактора:
 *   клетки(картинки), на которые нельзя ставить корабль. Ключ - номер клетки.
 * Во время игры:
 *   клетки, куда выстрел уже был произведен + клетки, занятые кораблями
 *
 * Каждая клетка хранит код:
 *   0 или null - не стрелянная пустая клетка
 *   1 - промах
 *   2 - попадание в корабль
 * также в качестве значения может быть указан id корабля, которому принадлежит
 * эта клетка
 *
 * @type {Object}
 */
var a_cell_block = {};

/**
 * Массив кораблей игрока. Ключ - id корабля.
 * Для корабля вожможны следующие смещения:
 *   id - id корабля,
 *   a_cell - клетки корабля
 *   a_shodow - массив с номерами клеток тени,
 *   i_left - смещение левой верхней клетки корабля от левого края (количество клеток)
 *   i_top - смещение левой верхней клетки корабля от верхнего края (количество клеток)
 *   i_index - номер клетки верхнего левого угла
 *   i_width - ширина корабля (количество клеток)
 *   i_height - высота корабля (количество клеток)
 *
 * @type {Object}
 */
var a_ship_user = {};

/**
 * Массив кораблей противика. Ключ - id корабля.
 * Для корабля вожможны следующие смещения:
 *   id - id корабля,
 *   a_cell - клетки корабля
 *   a_shodow - массив с номерами клеток тени,
 *   i_left - смещение левой верхней клетки корабля от левого края (количество клеток)
 *   i_top - смещение левой верхней клетки корабля от верхнего края (количество клеток)
 *   i_index - номер клетки верхнего левого угла
 *   i_width - ширина корабля (количество клеток)
 *   i_height - высота корабля (количество клеток)
 *
 * @type {Object}
 */
var a_ship_enemy = {};

/**
 * Количество установленных кораблей
 *
 * @type {Number}
 */
var i_ship_set = 0;

/**
 * Флаг, отвечающий за возможность двигать корабли в режиме редактора.
 * Используется для блокировки движения всех кораблей в момент возврата корабля
 * на свою начальную позицию после попытки поставить корабль, нарушая правила.
 * На режим игры не оказывает никакого влияния - в режиме игры передвижение
 * кораблей невозможно
 *
 * @type {Boolean}
 */
var can_move = true;

/**
 * Начальный отступ слева для передвигаемого в режиме редактора корабля (в пикселях)
 *
 * @type {Number}
 */
var i_ship_left = 0;

/**
 * Начальный отступ сверху для передвигаемого в режиме редактора корабля (в пикселях)
 *
 * @type {Number}
 */
var i_ship_top = 0;

/**
 * Перемещаемый в режиме редактора корабль.
 * Для корабля вожможны следующие смещения:
 *   id - id корабля,
 *   a_cell - клетки корабля
 *   a_shodow - массив с номерами клеток тени,
 *   i_left - смещение левой верхней клетки корабля от левого края (количество клеток)
 *   i_top - смещение левой верхней клетки корабля от верхнего края (количество клеток)
 *   i_index - номер клетки верхнего левого угла
 *   i_width - ширина корабля (количество клеток)
 *   i_height - высота корабля (количество клеток)
 *
 * @type {Object}
 */
var o_ship = null;

/**
 * Флаг, определяющий, что это первое движение перемещаемого корабля.
 * Используется при установке количества еще неустановленных кораблей
 *
 * @type {Boolean}
 */
var is_repeat_move = false;

/**
 * Флаг для обозначения начальной ориентации перемещаемого корабля
 *
 * @type {Boolean}
 */
var is_gorisontal_start = true;

/**
 * Клетки для запланированной атаки AI. Ключ - номер клетки.
 * Противник должен перестрелять все эти клетки, прежде чем начнет стрелять
 * в случайном порядке. Используется для реакции на попадание в корабль
 * пользователя во время игры
 *
 * @type {Object}
 */
var a_cell_cross = {};                  //клетки крестовины для AI

/**
 * Клетки, в которых расположен раненный противником корабль пользователя.
 * Ключ - номер клетки.
 * Массив содержит лишь те клетки, в которые стрелял противник и попал в корабль
 * пользователя
 *
 * @type {Object}
 */
var a_cell_ship = {};                  //клетки раненого корабля при выстреле AI

var can_shut = false;
/******************************************************************************/

/**
 * Инициализация режима редактора
 *
 * Установка поля пользователя, формы с кораблями, эффекта drap&drop
 */
function init(){
    initField('user');
    initShip();
    if(document.addEventListener)
        document.addEventListener('keydown',onKeyDown,true);
    else if(document.attachEvent)
        document.attachEvent('keydown',onKeyDown,true);
    $(function(){
        forAllShip('drag_add');
        var o_div = document.getElementById('battleship-ship-user');
        if(!elementExist(o_div))
            return false;
        $("#battleship-field-user").droppable({
            drop : shipDrop
        });
    });
}

/**
 * Инициализирует поле.
 *
 * Создает поле размерностью FIELD_SIZE * FIELD_SIZE.
 *
 * @param {String}   id идентификатор того, для кого нужно создать поле:
 *                     user - для пользователя
 *                     enemy - для противника
 * @return {Boolean} успешность
 */
function initField(id){
    var o_div = document.getElementById('battleship-field-' + id);
    if(!elementExist(o_div))
        return false;
    o_div.style.display = 'block';
    o_div.style.width = FIELD_SIZE * (CELL_SIZE + 2 * FIELD_BORDER);
    o_div.style.height = FIELD_SIZE * (CELL_SIZE + 2 * FIELD_BORDER);
    var str = "";
    for(var i = 1; i <= FIELD_SIZE; i ++)
    {
        for(var j = 1; j <= FIELD_SIZE; j ++)
            str += "<img id = '" + id + "-cell-" + String(i) + "-" + String(j) + "' src = 'image/cell.jpg' border = '" + FIELD_BORDER + "' style = 'width:" + CELL_SIZE + ";height:" + CELL_SIZE + ";'>";
        str += "<br/>";
    }
    o_div.innerHTML = str;
    return true;
}

/**
 * Загружает список кораблей и их количество в режиме редактора
 *
 * @return {Boolean} успешность
 */
function initShip(){
    var o_div_ship = document.getElementById('battleship-ship-user');
    if(!elementExist(o_div_ship))
        return false;
    var o_div_field = document.getElementById('battleship-field-user');
    if(!elementExist(o_div_field))
        return false;
    o_div_ship.style.left = FIELD_MARGIN_LEFT_EDITOR + parseInt(o_div_field.style.width) + CELL_SIZE + FIELD_BORDER;
    o_div_ship.style.top = FIELD_MARGIN_TOP_EDITOR;
    o_div_ship.style.width = 6 * (CELL_SIZE + 2 * FIELD_BORDER);
    o_div_field.style.left = FIELD_MARGIN_LEFT_EDITOR - FIELD_BORDER;
    o_div_field.style.top = FIELD_MARGIN_TOP_EDITOR;
    var str = "";
    str += '<table><tbody>';
    //большой
    str += '<tr><td width="' + (5 * CELL_SIZE) + 'px">';
    for(i = 1; i <= SHIP_COUNT_BIG; i ++)
        str += getShip('big',i);
    str += "</td>";
    //количество
    str += "<td><img src = 'image/count-" + SHIP_COUNT_BIG+ ".jpg' " + " id='ship-count-big'"
        + "style = 'left:0px;top:0px;position:relative;width : "
        + (CELL_SIZE) + ";height : " + CELL_SIZE + ";' " + "alt = '" + SHIP_COUNT_BIG+ "' title = '" + SHIP_COUNT_BIG+ "'></td>";
    str += "</tr>";
    //средний
    str += '<tr><td width="' + (5 * CELL_SIZE) + 'px">';
    for(i = 1;i <= SHIP_COUNT_MEDIUM; i ++)
        str += getShip('medium',i);
    str += "</td>";
    //количество
    str += "<td><img src = 'image/count-" + SHIP_COUNT_MEDIUM + ".jpg' " + " id='ship-count-medium'"
        + "style = 'left:0px;top:0px;position:relative;width : "
        + (CELL_SIZE) + ";height : " + CELL_SIZE + ";' alt = '" + SHIP_COUNT_MEDIUM + "' title = '" + SHIP_COUNT_MEDIUM + "'></td>";
    str += "</tr>";
    //малый
    str += '<tr><td width="' + (5 * CELL_SIZE) + 'px">';
    for(i = 1; i <= SHIP_COUNT_SMALL; i ++)
        str += getShip('small',i);
    str += "</td>";
    //количество
    str += "<td><img src = 'image/count-" + SHIP_COUNT_SMALL + ".jpg' " + " id='ship-count-small'"
        + "style = 'left:0px;top:0px;position:relative;width : "
        + (CELL_SIZE) + ";height : " + CELL_SIZE + ";' alt = '" + SHIP_COUNT_SMALL + "' title = '" + SHIP_COUNT_SMALL + "'></td>";
    str += "</tr>";
    //крошечный
    str += '<tr><td width="' + (5 * CELL_SIZE) + 'px">';
    for(i = 1; i <= SHIP_COUNT_TINY; i ++)
        str += getShip('tiny',i);
    str += "</td>";
    //количество
    str += "<td><img src = 'image/count-" + SHIP_COUNT_TINY + ".jpg' " + " id='ship-count-tiny'"
        + "style = 'left:0px;top:0px;position:relative;width : "
        + (CELL_SIZE) + ";height : " + CELL_SIZE + ";' alt = '" + SHIP_COUNT_TINY + "' title = '" + SHIP_COUNT_TINY + "'></td>";
    str += "</tr>";
    str += "</tbody></table>";

    o_div_ship.innerHTML = str;
    return true;
}

/**
 * Изменение числа непередвинутых ни разу кораблей
 *
 * Изменяет картинки, указывающие количество непередвинутых кораблей
 *
 * @param {String} id         идентификатор картинки
 * @param {Number} i_sign     на сколько нужно изменить значение
 * @return {Boolean} успешность
 */
function getCountShip(id, i_sign)
{
    var a_size = {
        'big': 'big',
        'sma': 'small',
        'med': 'medium',
        'tin': 'tiny'
    };
    var o_num = document.getElementById('ship-count-' + a_size[id.substring(0,3)]);
    if(!elementExist(o_num))
        return false;
    var i_count = parseInt(o_num.src.substring(o_num.src.length - 5, o_num.src.length - 4));
    if(i_count > -1){
        i_count = i_count + parseInt(i_sign);
        if(i_count < 0)
            i_count = 0;
        o_num.src = "image/count-" + i_count + ".jpg";
        o_num.alt = String(i_count);
        o_num.title = String();
    }
    return true;
}

/**
 * Отображение занятых клеток
 *
 * Заполняет массив занятых клеток в режиме редактора.
 * Может показывать все заблокированные клетки
 *
 * @param {Boolean} is_show    показать заблоктированные клетки
 * @return {Boolean}           успешность
 */
function blockedField(is_show){
    var a_cell = {};
    for(var i in a_ship_user) {
        for(var j in a_ship_user[i]['a_shadow']){
            var index = (a_ship_user[i]['a_shadow'][j]['i_row'] - 1) * FIELD_SIZE + a_ship_user[i]['a_shadow'][j]['i_col'];
            a_cell[index] = a_ship_user[i]['id'];
            if(!(index in a_cell_block)){
                var o_img = document.getElementById('cell-' + a_ship_user[i]['a_shadow'][j]['i_row'] +
                    '-' + a_ship_user[i]['a_shadow'][j]['i_col']);
                a_cell_block[index] = o_img;
            }
        }
    }
    for(var i in a_cell_block){
        if(!(i in a_cell))
            delete a_cell_block[i];
        else{
            //покраска всех недоступных клеток
            if(is_show)
                a_cell_block[i].src = 'image/cell-block.jpg';
            else
                a_cell_block[i].src = 'image/cell.jpg';
        }
    }
    return true;
}

/**
 * Обработчик нажатия кнопок для разворота корабля
 *
 * Разворачивает корабль при нажатии кнопки R или Space
 *
 * @param event
 */
function onKeyDown(event){
    if(event.keyCode == 32 || event.keyCode == 82)
        shipRotate(o_ship);
}

/**
 * Переход в режим игры
 *
 * Инициализирует поля при переходе в режим игры. Убирает drag&drop,
 * расставляет корабли противника, инициализирует массивы занятых клеток
 *
 * @return {Boolean} успешность
 */
function startGame()
{
    if(i_ship_set != (SHIP_COUNT_BIG + SHIP_COUNT_MEDIUM + SHIP_COUNT_SMALL + SHIP_COUNT_TINY)){
        alert('Не все корабли расставлены! Пожалуйста, расставьте все корабли.');
        return false;
    }
    initField('enemy');
    var o_div = document.getElementById('battleship-field-enemy');
    if(!elementExist(o_div))
        return false;
    o_div.style.left = FIELD_MARGIN_LEFT_GAME + (FIELD_SIZE + 1) * (CELL_SIZE + 2 * FIELD_BORDER);
    o_div.style.top = FIELD_MARGIN_TOP_GAME;
    o_div.onclick = shutUser;
    o_div = document.getElementById('battleship-field-user');
    if(!elementExist(o_div))
        return false;
    o_div.style.left = FIELD_MARGIN_LEFT_GAME;
    o_div.style.top = FIELD_MARGIN_TOP_GAME;
    o_div = document.getElementById('menu');
    if(!elementExist(o_div, 'menu'))
        return false;
    o_div.style.display = 'none';
    var a_size = {
        1 : 'big',
        2 : 'medium',
        3 : 'small',
        4 : 'tiny'
    };
    var a_size_ship = {
        'big' : 4,
        'med' : 3,
        'sma' : 2,
        'tin' : 1
    };
    for(var i in a_size){
        var o_img = document.getElementById('ship-count-' + a_size[i]);
        if(!elementExist(o_img, 'ship-count-' + a_size[i]))
            return false;
        o_img.style.display = 'none';
    }
    forAllShip('drag_delete');
    forAllShip('move');
    a_cell_block = {};
    for(var i in a_ship_user){
        if(!a_ship_user[i]['a_cell'])
            a_ship_user[i]['a_cell'] = shipShadow({'id' : a_ship_user[i]['id'], 'i_index' : a_ship_user[i]['i_index'], 'without_shadow' : true});
        for(var j in a_ship_user[i]['a_cell'])
            a_cell_block[j] = a_ship_user[i]['id'];
        a_ship_user[i]['i_cell_live'] = a_size_ship[a_ship_user[i]['id'].substring(0,3)];
    }
    a_ship_user['i_ship_live'] = SHIP_COUNT_BIG + SHIP_COUNT_MEDIUM + SHIP_COUNT_SMALL + SHIP_COUNT_TINY;
    setShipRandom('enemy');
    for(var i in a_ship_enemy){
        if(!a_ship_enemy[i]['a_cell'])
            a_ship_enemy[i]['a_cell'] = shipShadow({'id' : a_ship_enemy[i]['id'], 'without_shadow' : true});
        for(var j in a_ship_enemy[i]['a_cell'])
            a_cell_enemy[j] = a_ship_enemy[i]['id'];
        a_ship_enemy[i]['i_cell_live'] = a_size_ship[a_ship_enemy[i]['id'].substring(0,3)];
    }
    a_ship_enemy['i_ship_live'] = SHIP_COUNT_BIG + SHIP_COUNT_MEDIUM + SHIP_COUNT_SMALL + SHIP_COUNT_TINY;
    $('#battleship-status').css('display','block');
    can_shut = true;
    return true;
}