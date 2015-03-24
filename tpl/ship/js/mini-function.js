//мини-функции: используются для разных действий

/**
 * Проверяет существование элемента. Если элемента нет, то выводит сообщение.
 *
 * @param {Object} o_elem     элемент
 * @param {String} s_name     имя элемента
 * @return {Boolean}          существует ли элемент
 */
function elementExist(o_elem,s_name){
    if(!o_elem){
        if(!s_name)
            alert('Not exist element!');//для поддержки вызова без указания имени
        else
            alert('Element "'+s_name+'" not exist!');
        return false;
    }
    return true;
}

/**
 * Отладочная функция.
 *
 * Выводит переменную в специальный контейнер в зависимости от типа параметра
 * или явно указанного типа
 *
 * @param {Object} obj  переменная
 * @param {String} type тип переменной
 */
function dump(obj,type){
    var o_log = document.getElementById('battleship-log');
    var result = "";
    if(type && type == 'string' || typeof(obj) === 'string'){
        result += obj;
        if(!o_log)
            result += "\n";
        else
            result += "<br/>";
    }
    else{
        for (var i in obj){
            result += i + " " + obj[i];
            if(!o_log)
                result+= "\n";
            else
                result+= "<br/>";
        }
    }
    if(!o_log)
        alert(result);
    else
        o_log.innerHTML += result + "------------------------------------<br/>";
}

/**
 * Возвращает случайное число в диапазоне [min,max]
 *
 * @param {Number} min       минимально допустимое значение
 * @param {Number} max       максимально допустимое значение
 * @return {Number}          случайное число
 */
function getRandom(min,max){
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Возвращает длину ассоциативного массива
 *
 * @param {Object} a_array   ассоциативный массив
 * @return {Number}          длина
 */
function arrayLength(a_array){
    var n = 0;
    for(var i in a_array){
        n ++;
    }
    return n;
}

/**
 * Случайное число из массива
 *
 * Возвращает случайное значение ключа из хеш-массива.
 * Используется для определения следующего выстрела после попадания в корабль
 * пользователя
 *
 * @param {Object} a_array   исходный массив, ключ - число
 * @return {Number}          случайное значение ключа
 */
function arrayRandom(a_array){
    var i_length = arrayLength(a_array);
    var i_index = getRandom(0, i_length - 1);
    for(var i in a_array){
        if(i_index == 0)
            return i;
        i_index --;
    }
    return 0;
}


/**
 * Поиск ограничений массива
 *
 * Ищет минимальное и максимальное значения ключа из хеш-массива.
 * Используется для определения клеток, в которые необходимо выстрелить при
 * ранении корабля пользователя более одно раза
 *
 * @param {Object}  a_array   исходный массив, ключ - число
 * @return {Object}           массив со смещениями:
 *                              i_max - максимальное значение ключа
 *                              i_min - минимальное значение ключа
 */
function arrayMinMax(a_array){
    var i_min = FIELD_SIZE * FIELD_SIZE;
    var i_max = 1;
    for(var i in a_array){
        if(i < i_min)
            i_min = i;
        if(i > i_max)
            i_max = i;
    }
    return {
        'i_max' : i_max,
        'i_min' : i_min
    };
}