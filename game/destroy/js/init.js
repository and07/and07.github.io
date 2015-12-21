/**
 * Инициализация игрового поля
 * Игровое поле генерируется рандомно
 */

function init () {
    var gri;
    for(var i = 0; i < 10; i++)
        level[i] = new Array(10);
    for(var i = 0; i < 10; i++)
        for(var j = 0; j < 10; j++) {
            gri = getRandomImage();
            level[i][j] = gri;
        }
    FallOfSquares();
    ShiftOfColumns();
}