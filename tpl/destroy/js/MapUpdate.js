/**
 * Обновление игрового поля
 */

function MapUpdate () {
    var i, j;
    for(i = 0; i < 10; i++)
        for(j = 0; j < 10; j++)
            document.f[('img'+((10 * i) + j))].src = 'images/image' + level[i][j] + '.gif';
}