/**
 * Падение квадратиков вниз на игровом поле
 */

function FallOfSquares () {
    var a = new Array(10);
    var ia, ja;
    for(var i = 0; i < 10; i++)
        a[i] = new Array(10);
    for(var i = 0; i < 10; i++)
        for(var j = 0; j < 10; j++)
            a[i][j] = 0;
    for(var j = 0; j < 10; j++) {
        ja = j;
        ia = 9;
        for(var i = 9; i >= 0; i--) {
            if(level[i][j] != 0) {
                a[ia][ja] = level[i][j];
                ia--;
            }
        }
    }
    for(var i = 0; i < 10; i++)
        for(var j = 0; j < 10; j++)
            level[i][j] = a[i][j];
}