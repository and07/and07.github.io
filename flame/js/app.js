/**
 * DEMO
 */
var opt =  {
        data:[],
        name:[],
        message:[],
        uf: {   
                Ag: [0, 5, 6, 7, 14, 15, 33], 
                zg: [1, 9, 17, 35, 53, 85, 117], 
                tg: [8, 16, 34, 52, 84, 116], 
                xg: [4, 13, 31, 32, 50, 51, 83], 
                Ib: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29,38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 71, 72, 73, 74, 75, 76, 77, 78, 79, 103, 104, 105, 106, 107, 108, 109, 110, 111], 
                Cg: [12, 30, 48, 49, 80, 81, 82, 112, 113, 114, 115], 
                lg: [2, 10, 18, 36, 54, 86], 
                mg: [3, 11, 19, 37, 55, 87], 
                vg: [56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70], 
                kg: [88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102]
        }, 
        param: {
            name: 'DEMO', 
            type:"paraflow",//default paraflow more "sphere","helix","wall of fame","periodic","paraflow"
            rgb: [23,152,202], //default 73,160,154
            //size_items : {small:[160, 120], big: [880,660]},
        }
    };

//data name message
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
var img = ['Koala.jpg','Desert.jpg','Jellyfish.jpg','Lighthouse.jpg','Penguins.jpg'];
for(var i=0; i< 100; i++)
{
    opt.data.unshift('<img src="img/'+img[getRandomInt(0,5)]+'" width ="95%" >');
    opt.name.unshift('Koala'+i);
    opt.message.unshift('best'+i);
}

opt.data.push('<img src="img/Koala.jpg" width ="200px">');
opt.name.push('Klast');
opt.message.push('last');

opt.data.unshift('XXX');
opt.name.unshift('test');
opt.message.unshift('100');

var a = flame("#main", opt);
