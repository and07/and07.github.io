/**
 * Производится генерация кода страницы игрового поля
 * Игровое поле является квадратом из цветных картинок 10х10
 */
 
function C_game () {
    var i, j;
    for (i = 0; i < 10; i++) {
        document.write('<tr>');
        for (j = 0; j < 10; j++) {
            document.write('<td align="center">');
            document.write('<a href="javascript:ImageClick(' + ((10 * i) + j) + ')">');
            document.write('<img src="images/image' + level[i][j] + '.gif" name="img' + ((10 * i) + j) + '" border="1">');
            document.write('</a></td>');
        }
        document.write('</tr>');
    }
}