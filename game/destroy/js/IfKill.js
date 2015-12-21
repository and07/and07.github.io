/**
 * Проверка на возможность уничтожения области
 *
 * @param i Строка, в которой находится проверяемый квадратик
 * @param j Столбец, в котором находится проверяемый квадратик
 *
 * @return Результат проверки: 0 - нельзя применить уничтожение
 *                             1 - можно применить удаление 
 */

function IfKill (i, j, color) {
    if (level[i][j] == color)
    {
        if((i != 0) && (level[i-1][j] == color)) return 1;
        if((i != 9) && (level[i+1][j] == color)) return 1;
        if((j != 0) && (level[i][j-1] == color)) return 1;
        if((j != 9) && (level[i][j+1] == color)) return 1;
    }
    return 0;
}