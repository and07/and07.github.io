/**
 * Обработчик нажатия на картинку
 *
 * @param num код картинки от 0 до 99
 */

function ImageClick (num) {
    var i, j, flag;
    i = div(num, 10);
    j = num % 10;
    if (level[i][j] != 0) {
        flag = PossibleToKill(i, j);
        if (flag == 1) {
            KillSquare(i, j, level[i][j]);
            FallOfSquares();
            ShiftOfColumns();
            MapUpdate();
        }
    }
    flag = GameOver();
    if(flag == 1) {
        alert('Ходов больше нет! Вы проиграли!');
        init();
        MapUpdate();
    } else if(flag == 2) {
        alert('Поздравляю! Вы выиграли!!!');
        init();
        MapUpdate();
    }
    if(flag == 0) alert('Еще есть ходы! Продолжайте...');
}