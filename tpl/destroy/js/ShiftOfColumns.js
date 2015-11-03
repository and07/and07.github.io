/**
 * Сдвиг колонок к центру в кучку
 */

function ShiftOfColumns () {
    var a = new Array(10);
    var d,new_j, columns;
    columns = 0;
    for(var i = 0; i < 10; i++) {
        if(level[9][i] != 0) columns++;
        a[i] = new Array(10);
    }
    for(var i = 0; i < 10; i++)
        for(var j = 0; j < 10; j++)
            a[i][j] = 0;
    d = div(columns, 2);
    new_j = 5 - d;
    for(var j = 0; j < 10; j++)
        if(level[9][j] != 0) { 
            for(var i = 0; i < 10; i++)
                a[i][new_j] = level[i][j];
            new_j++;
        }
    for(var i = 0; i < 10; i++)
        for(var j = 0; j < 10; j++)
            level[i][j] = a[i][j];
}