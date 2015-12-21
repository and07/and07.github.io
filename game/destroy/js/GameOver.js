/**
 * Проверка окончания игры
 *
 * @return Текущее состояние игры: 0 - Еще есть ходы
 *                                 1 - Игра проиграна
 *                                 2 - Игра выиграна
 */

function GameOver () {
    var flag1, flag2;
    flag2 = 0;
    for(var i = 0; i < 10; i++)
        for(var j = 0; j < 10; j++)
            if (level[i][j] != 0) {
                flag2 = 1;
                flag1 = PossibleToKill(i, j);
                if(flag1 == 1) return 0;
            }
    if(flag2 == 0) return 2; 
    return 1;
}