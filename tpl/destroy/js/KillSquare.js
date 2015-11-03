/**
 * Уничтожение квадратов
 * Поиск соседних квадратиков одного цвета осуществляется волновым алгоритмом
 *
 * @param i Строка, в которой находится проверяемый квадратик
 * @param j Столбец, в котором находится проверяемый квадратик
 * @param color Цвет проверяемого квадратика
 */

function KillSquare (i, j, color) {
    if(level[i][j] == color) {
        level[i][j] = 0;
        if((i != 0) && (level[i-1][j] == color)) KillSquare(i-1, j, color);
        if((i != 9) && (level[i+1][j] == color)) KillSquare(i+1, j, color);
        if((j != 0) && (level[i][j-1] == color)) KillSquare(i, j-1, color);
        if((j != 9) && (level[i][j+1] == color)) KillSquare(i, j+1, color);
    }
}