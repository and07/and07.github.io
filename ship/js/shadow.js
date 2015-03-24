/**
 * Скрипты для получения тени корабля
 *
 * User: DevilRep
 * Date: 13.12.12
 */

/**
 * Находит тень корабля - все клетки, касающиеся клеток корабля
 *
 * @param {object} a_data    массив, который может содержать следующие смещения:
 *                             i_index - левая верхняя клетка корабля
 *                             i_left - смещение корабля от левого края (в клетках)
 *                             i_top - смещение корабля от верхнего края (в клетках)
 *                             i_height - высота корабля (в клетках)
 *                             i_width - ширина корабля (в клетках)
 *                             id - идентификатор корабля
 *                             without_shadow - вернуть массив занятых кораблем клеток
 * @return {Object}          тень - массив, ключ - номер клетки
 */
function shipShadow(a_data){
    if(!a_data['i_index']&&(!a_data['i_left']||!a_data['i_top']))
        return {};

    var i_height = 0;
    var i_width = 0;
    if(a_data['id']){
        var o_img = document.getElementById(a_data['id']);
        if(!elementExist(o_img,'ship'))
            return {};
        i_height = Math.round(o_img.height / (CELL_SIZE + 2 * FIELD_BORDER));
        i_width = Math.round(o_img.width / (CELL_SIZE + 2 * FIELD_BORDER));
    }else if(a_data['i_height'] && a_data['i_width']){
        i_height = a_data['i_height'];
        i_width = a_data['i_width'];
    }
    else
        return {};
    var index = 0;
    if(a_data['i_index'])
        index = a_data['i_index'];
    else if(a_data['i_left'] && a_data['i_top'])
        index = (parseInt(a_data['i_top']) - 1) * FIELD_SIZE + parseInt(a_data['i_left']);
    else
        return {};
    var a_result = {};
    var with_shadow = true;
    if(a_data['without_shadow'])
        with_shadow = false;
    //учтем расположение корабля
    for(var i = 0; i < i_height; i ++){
        for(var j = 0; j < i_width; j ++){
            var a_cell = cellShadow(parseInt(index) + i * FIELD_SIZE + j, with_shadow);
            for(var k in a_cell)
                a_result[k] = a_cell[k];
        }
    }
    return a_result;
}

/**
 * Возвращает тень клетки - все смежные клетки
 *
 * @param {Number} index         номер клетки
 * @param {Boolean} with_shadow  вернуть только клетку(false) или еще и тень(true)
 * @return {Object}
 */
function cellShadow(index,with_shadow){
    var a_cell = {};
    var i_max = 0;
    var i_min = 0;
    if(with_shadow){
        i_max = 1;
        i_min = -1;
    }
    for(var i = i_min; i <= i_max; i ++){
        for(var j= i_min; j <= i_max; j ++){
            var i_row = Math.ceil(index / FIELD_SIZE);
            var i_col = index % FIELD_SIZE;
            if(i_col == 0)
                i_col = FIELD_SIZE;
            if(i_col + j > 0 && i_col + j <= FIELD_SIZE && i_row + i > 0 && i_row + i <= FIELD_SIZE)
                a_cell[i * FIELD_SIZE + j + index] = {'i_row' : i_row + i,'i_col' : i_col + j};
        }
    }
    return a_cell;
}


/**
 * Крестовая тень корабля
 *
 * Возвращает четыре клетки, окружающие указанную:
 *   - на ряд выше
 *   - на ряд ниже
 *   - клетка левее
 *   - клетка правее
 *
 * @param {Number} i_index   исходная клетка
 * @return {Object}
 */
function cellCrossShadow(i_index)
{
    var a_cell = {};
    //верхняя клетка
    if(i_index - FIELD_SIZE >= 1)
        a_cell[i_index - FIELD_SIZE] = i_index - FIELD_SIZE;
    //нижняя клетка
    if(i_index + FIELD_SIZE <= FIELD_SIZE * FIELD_SIZE)
        a_cell[i_index + FIELD_SIZE] = i_index + FIELD_SIZE;
    //левая клетка
    var i_left = i_index - (Math.ceil(i_index / FIELD_SIZE) - 1) * FIELD_SIZE;
    if(i_left - 1 >= 1)
        a_cell[i_index - 1] = i_index - 1;
    //правая клетка
    if(i_left + 1 <= FIELD_SIZE)
        a_cell[i_index + 1] = i_index + 1;
    return a_cell;
}