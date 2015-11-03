/**
 * Главная проверка на возможность уничтожения области
 *
 * @param i Строка, в которой находится проверяемый квадратик
 * @param j Столбец, в котором находится проверяемый квадратик
 *
 * @return Результат проверки: 0 - нельзя применить уничтожение
 *                             1 - можно применить удаление 
 */

function PossibleToKill (i, j) {
    var color, rez;
    color = level[i][j];
    level[i][j] = 7;
    rez = 0;
    if(i != 0) rez += IfKill(i-1, j, color);
    if(i != 9) rez += IfKill(i+1, j, color);
    if(j != 0) rez += IfKill(i, j-1, color);
    if(j != 9) rez += IfKill(i, j+1, color);
    rez += IfCenter(i,j,color);
    level[i][j] = color;
    if(rez > 0) return 1;
    return 0;
}