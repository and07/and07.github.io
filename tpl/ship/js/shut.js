/**
 * Created with JetBrains PhpStorm.
 * User: DevilRep
 * Date: 27.12.12
 */

/**
 * Производит выстрел от имени указанного пользователя
 *
 * Производит выстрел от указанного пользователя. При выстреле противника
 * инициализирует тактику при попадании
 *
 * @param {Number} i_left     смещение от левого края поля (в клетках)
 * @param {Number} i_top      смещение от верхнего края поля (в клетках)
 * @param {String} s_user     инициатор выстрела: enemy - противник
 *                                       user - игрок
 * @return {String}  результат выстрела:
 *                     game-over - игра окончена
 *                     double - выстрел в эту клетку уже производился
 *                     hit - попадание
 *                     miss - промах
 */
function shut(i_left,i_top,s_user){
    var a_ship = {};
    var a_cell_blocked = {};
    var s_field = '';
    if(s_user === 'user'){
        a_ship = a_ship_enemy;
        a_cell_blocked = a_cell_enemy;
        s_field = 'enemy';
    }else{
        a_ship = a_ship_user;
        a_cell_blocked = a_cell_block;
        s_field = 'user';
    }
    if(a_ship['i_ship_live'] == 0){
        alert('Игра окончена!');
        return 'game-over';
    }
    var i_index = (i_top - 1) * FIELD_SIZE + i_left;
    var a_field = {};
    a_field[i_index] = {'i_left' : i_left, 'i_top' : i_top, 's_img' : 'miss'};
    var is_hit = a_cell_blocked[i_index] && a_cell_blocked[i_index].length > 1;
    if(is_hit){
        a_ship[a_cell_blocked[i_index]]['i_cell_live'] --;
        if(s_user === 'enemy')
            setTarget(i_index);
        else
            showStatus('Ваш выстрел: ', i_left, i_top);
        a_field[i_index]['s_img'] = 'ship-hit';
        if(a_ship[a_cell_blocked[i_index]]['i_cell_live'] == 0){
            a_ship['i_ship_live'] --;
            if(s_user === 'enemy'){
                dump('ship was killed!');
                a_cell_cross = {};
                a_cell_ship = {};
                showStatus('Один из ваших кораблей погиб!');
            }else{
                showStatus('Вы подбили один из кораблей противника!');
            }
            for(var i in a_ship[a_cell_blocked[i_index]]['a_shadow']){
                if(!(i in a_cell_blocked)){
                    a_cell_blocked[i] = '1';
                    a_field[i] = {
                        'i_left' : i - (Math.ceil(i / FIELD_SIZE) - 1) * FIELD_SIZE,
                        'i_top' : Math.ceil(i / FIELD_SIZE),
                        's_img' : 'miss'
                    };
                }
            }
        }
        else if(s_user === 'enemy')
            showStatus('Один из ваших кораблей ранен!');
        else if(s_user === 'user')
            showStatus('Вы ранили один из кораблей противника!');
        a_cell_blocked[i_index] = '2';
    }
    else if(!a_cell_blocked[i_index]){
        a_cell_blocked[i_index] = '1';
        a_field[i_index]['s_img'] = 'miss';
        if(s_user === 'user')
            showStatus('Ваш выстрел: ', i_left, i_top);
    }
    else
        return 'double';

    for(var i in a_field){
        var o_img = document.getElementById(s_field + '-cell-' + a_field[i]['i_top'] + '-' + a_field[i]['i_left']);
        if(!elementExist(o_img))
            return 'image-nx';
        o_img.src = 'image/' + a_field[i]['s_img'] + '.jpg';
    }

    if(a_ship['i_ship_live'] == 0){
        alert('Игра окончена! Вы ' + (s_user === 'user'?'победили!:)':'проиграли!:('));
        return 'game-over';
    }
    if(s_user === 'user'){
        a_ship_enemy = a_ship;
        a_cell_enemy = a_cell_blocked;
    }else{
        a_ship_user = a_ship;
        a_cell_block = a_cell_blocked;
        delete a_cell_cross[i_index];
    }
    return is_hit?'hit':'miss';
}

/**
 * Обработчик клика на поле для выстрела в режиме игры
 *
 * Производит выстрел пользователя при на клетку поля противника
 *
 * @param event      объект состояния
 * @return {Boolean} успешность
 */
function shutUser(event)
{
    if(!can_shut)
        return false;
    var mouse_x = 0;
    var mouse_y = 0;
    var s_result = '';
    if (document.attachEvent != null){
        mouse_x = window.event.clientX;
        mouse_y = window.event.clientY;
    }else if (!document.attachEvent && document.addEventListener){
        mouse_x = event.clientX;
        mouse_y = event.clientY;
    }
    mouse_x = Math.ceil((mouse_x - FIELD_MARGIN_LEFT_GAME - (FIELD_SIZE + 1) * CELL_SIZE) / (CELL_SIZE + 2 * FIELD_BORDER));
    mouse_y = Math.ceil((mouse_y - FIELD_MARGIN_TOP_GAME) / (CELL_SIZE + 2 * FIELD_BORDER));
    if(mouse_x < 1)
        return false;
    if(mouse_x > FIELD_SIZE)
        return false;
    if(mouse_y < 1)
        return false;
    if(mouse_y > FIELD_SIZE)
        return false;

    s_result = shut(mouse_x, mouse_y, 'user');
    if(s_result === 'hit' || s_result === 'miss')
        showStatus('', '', '', s_result !== 'miss'?'user':'enemy');
    if(s_result !== 'miss')
        return false;

    //выстрел противника
    enemyShut();
    return true;
}

/**
 * Выстрел противника
 *
 * Производит выстрел противника
 *
 * @return {Boolean}
 */
function enemyShut(){
    can_shut = false;
    var mouse_x = 0;
    var mouse_y = 0;
    var s_result = '';
    do{
        var has_error = false;
        //определяем, куда стрелять
        if(arrayLength(a_cell_ship) > 0){
            var i_index = arrayRandom(a_cell_cross);
            mouse_y = Math.ceil(i_index / FIELD_SIZE);
            mouse_x = i_index - (mouse_y - 1) * FIELD_SIZE;
        }else{
            mouse_x = getRandom(1, FIELD_SIZE);
            mouse_y = getRandom(1, FIELD_SIZE);
            i_index = ((mouse_y - 1) * FIELD_SIZE + mouse_x);
        }
        //пробуем сделать выстрел
        if((i_index in a_cell_block && a_cell_block[i_index].length > 1) || !(i_index in a_cell_block)){
            showStatus('Выстрел противника: ', mouse_x, mouse_y);
            s_result = shut(mouse_x, mouse_y, 'enemy');      //выстрел пошел
            showStatus('', '', '', s_result === 'hit' || s_result === 'double'?'enemy':'user');
        }else{
            //выстрел не удался - в эту клетку уже стреляли
            has_error = true;
            delete a_cell_cross[i_index];
        }
    }
    while(has_error);
    if(s_result === 'hit' || s_result === 'double')
        setTimeout(enemyShut,SHUT_TIME);
    else
        can_shut = true;
    return true;
}

/**
 * Тактика для следующих ходов для AI
 *
 * Устанавивает клетки для обязательной проверки. Некоторые из этих клеток
 * принадлежат раненному противником кораблю
 *
 * @param {Number} i_index  клетка, в которую был произведен выстрел
 */
function setTarget(i_index){
    a_cell_ship[i_index] = i_index;
    if(arrayLength(a_cell_ship) == 1)
        a_cell_cross = cellCrossShadow(i_index);
    else{
        var a_param = arrayMinMax(a_cell_ship);
        var i_add = Math.abs(a_param['i_min'] - a_param['i_max']);
        a_cell_cross = {};
        if(i_add < FIELD_SIZE){
            //корабль расположен горизонтально
            if(a_param['i_min'] - (Math.ceil(a_param['i_min'] / FIELD_SIZE) - 1) * FIELD_SIZE - 1 >= 1)
                a_cell_cross[parseInt(a_param['i_min']) - 1] = parseInt(a_param['i_min']) - 1;
            if(a_param['i_max'] - (Math.ceil(a_param['i_max'] / FIELD_SIZE) - 1) * FIELD_SIZE + 1 <= FIELD_SIZE)
                a_cell_cross[parseInt(a_param['i_max']) + 1] = parseInt(a_param['i_max']) + 1;
        }else{
            //корабль расположен вертикально
            if(Math.ceil(a_param['i_min'] / FIELD_SIZE) - 1 >= 1)
                a_cell_cross[parseInt(a_param['i_min']) - FIELD_SIZE] = parseInt(a_param['i_min']) - FIELD_SIZE;
            if(Math.ceil(a_param['i_max'] / FIELD_SIZE) + 1 <= FIELD_SIZE)
                a_cell_cross[parseInt(a_param['i_max']) + FIELD_SIZE] = parseInt(a_param['i_max']) + FIELD_SIZE;
        }
    }
    for(var i in a_cell_cross){
        if(i in a_cell_block && a_cell_block[i].length == 1)   //если клетка стрелянная
            delete a_cell_cross[i];
    }
}

/**
 * Визуализация действий пользователя и противника
 *
 * Отображает статус игры: кто ходит и что произошло
 *
 * @param {String} s_message сообщение для вывода
 * @param {Number} x         смещение от левого края поля (в клетках)
 * @param {Number} y         смещение от верхнего края поля (в клетках)
 */
function showStatus(s_message, x, y, s_user){
    var s_string = s_message;
    if(x)
        s_string += ' ' + (I_SIMBOL % 2 == 1 ? A_SIMBOL[y] : '' + y) + (I_SIMBOL > 1 ? A_SIMBOL[x] : '' + x);
    if(s_string)
        s_string += '<br/>';
    if(s_user&&s_user === 'enemy')
        s_string += 'Стреляет противник<br/>';
    else if(s_user)
        s_string += 'Ваш ход<br/>';
    $('#battleship-status').html($('#battleship-status').html() + s_string);
    $('#battleship-status').scrollTo('max');
}