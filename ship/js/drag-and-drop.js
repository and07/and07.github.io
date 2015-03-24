/**
 * Скрипты, отвечающие за захват, движение и падение корабля во время передвижения по полю
 * User: DevilRep
 * Date: 13.12.12
 */

/**
 * Обработка старта перемещения корабля в режиме редактора
 *
 * @param event
 * @param ui         перемещаемый объект
 * @return {Boolean} успешность: при false движение прекратится
 */
function shipStartDrag(event, ui){
    if(!can_move)
        return false;
    i_ship_left = ui.offset.left - FIELD_MARGIN_LEFT_EDITOR - (FIELD_SIZE + 1) * (CELL_SIZE + 2 * FIELD_BORDER) + FIELD_BORDER;
    i_ship_top = ui.offset.top - FIELD_MARGIN_TOP_EDITOR;

    if(a_ship_user[ui.helper.attr('id')]){
        o_ship = a_ship_user[ui.helper.attr('id')];
        delete a_ship_user[ui.helper.attr('id')];
        is_repeat_move = true;
    }else{
        getCountShip(ui.helper.attr('id'), -1);
        o_ship = {
            'id' : ui.helper.attr('id'),
            'is_gorisontal' : true
        };
    }
    is_gorisontal_start = o_ship['is_gorisontal'];
    blockedField(true);
    return true;
}

/**
 * Движение корабля в режиме редактора
 *
 * @param event двигаемый объект
 */
function shipDrag(event){
}

/**
 * Падение корабля на поле
 *
 * @param event      событие
 * @param ui         перемещаемый объект
 * @return {Boolean} успешность
 */
function shipDrop(event, ui){
    var x = Math.ceil((ui.offset.left - FIELD_MARGIN_LEFT_EDITOR) / (CELL_SIZE));
    var y = Math.ceil((ui.offset.top - FIELD_MARGIN_TOP_EDITOR) / (CELL_SIZE));
    if(x < 1)
        x = 1;
    if(x > FIELD_SIZE)
        x = FIELD_SIZE;
    if(y < 1)
        y = 1;
    if(y > FIELD_SIZE)
        y = FIELD_SIZE;
    //учтем расположение корабля
    var o_img1 = document.getElementById(ui.helper.attr('id'));
    var i_height = Math.round(o_img1.height / (CELL_SIZE + 2 * FIELD_BORDER));
    var i_width = Math.round(o_img1.width / (CELL_SIZE + 2 * FIELD_BORDER));
    var is_exist = false;
    for(var i = 0; i < i_height; i ++){
        for(var j = 0; j < i_width; j ++){
            if(a_cell_block[(y - 1 + i) * FIELD_SIZE + x + j])
                is_exist = true;
        }
    }
    if(is_exist)
    {
        can_move = false;
        if(is_gorisontal_start != o_ship['is_gorisontal'])
            shipRotate(o_ship);
        ui.helper.animate({
                left: i_ship_left,
                top: i_ship_top
            },
            SPEED_ANIMATION_REVERT,
            null,
            function(){
                //глобальная блокировка от движения во время возврата
                can_move = true;
            });
        if(!is_repeat_move)
            getCountShip(ui.helper.attr('id'), 1);
        else{
            a_ship_user[ui.helper.attr('id')] = o_ship;
            o_ship = null;
        }
    }else{
        var a_cell = shipShadow({
                'i_index' : (y - 1) * FIELD_SIZE + x,
                'id' : ui.helper.attr('id')}
        );
        for(var i in a_cell){
            var o_img = document.getElementById('user-cell-' + a_cell[i]['i_row'] + '-' + a_cell[i]['i_col']);
            if(!elementExist(o_img,'img'))
                return false;
            a_cell_block[i] = o_img;
        }
        a_ship_user[ui.helper.attr('id')] = {
            'a_shadow' : a_cell,
            'i_index' : (y - 1) * FIELD_SIZE + x,
            'id' : ui.helper.attr('id'),
            'is_gorisontal' : o_ship['is_gorisontal']
        };
        if(!is_repeat_move)
            i_ship_set ++;
    }
    is_repeat_move = false;
    //покраска всех недоступных клеток
    blockedField(false);
    return false;
}