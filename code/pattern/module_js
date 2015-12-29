
//http://habrahabr.ru/post/218485/

// Модуль представляет из себя переменную, которой присвоено значение самовызывающейся анонимной функции
// Функция возвращает объект, предоставляющий публичный API для работы с модулем

var App = (function(){
    //Тут можно определить приватные переменные и методы
    //Например
    var someArray = []; //Не будет доступен по ссылке App.someArray, не как либо еще вне объекта

    //Объект, содержащий публичное API
    return {
        init: function(){
            // Инициализация модуля. В ней мы инициализируем все остальные модули на странице
            Profile.init();
            Portfolio.init();
        }
    }
})();

//И инициализируем наш глобальный модуль
App.init();


/********************************************************************/
var Profile = (function(){
    //Приватная переменная хранящая путь до сервера, предоставляющего информацию для модуля
    var url = 'http://someweb.com';
    //Приватная переменная хранящая корневой html элемент, в котором отрисовывается модуль
    var el = '.div-profile';

    return {
        //Инициализация модуля
        init: function(){
            // Получим список пунктов меню и аватарку с сервера
            var profileData = this.getData(url);
        },
        getData: function(url){
            /*
            * Тут будет код ajax запроса на сервер, который в случае успеха сохранит результат в переменную res
            */

            //Отрисуем наши данные
            this.render(res);
        },
        render: function(){
            /*
            * Тут будет код создания html разметки, с использованием вашего любимого шаблонизатора.
            * Допустим результирующая строка будет сохранена в переменную html
            */

            //Добавим полученную разметку в корневой элемент модуля. 
//Для простоты представим что на проекте используется jQuery
            $(el).html(html);

            //И привяжем DOM события к нужным элементам модуля
            this.event();
        },
        event: function(){
            //Пусть пункты меню имеют класс .menu-item
            //И содержат атрибут data-list-id
            $('.menu-item').click(function(){
                var id = $(this).data('list-id');

                //Теперь самое важное. Генерируем событие, что пользователь кликнул пункт. 
                //На это событие и будут подписываться другие модули
                //В триггере передадим id выбранного пункта
                $(window).trigger('clickItem', {id: id});
            });
        }
    }
})();

/***********************************************************************/
var Portfolio = (function(){

    //Ссылка на текущий объект
    $this = this;
        var el = '.portfolio'

    return {
        init: function(){

            //Повесим слушатель нашего кастомного события. В функцию обработчик передадим пришедшие данные
            $(window).on('clickItem', function(e, data){
                $this.getData(data.id)
            });
        },
        getData: function(id){
            /*
            * Тут сделаем запрос на сервер и получим наши работы в портфолио. Пусть они так же сохраняются в res
            */
            this.render(res);
        },
        render: function(data){
            /*
            * И снова отрисовываем данные удобным вам способом
            */
        },
        event: function(){
            /*
            * Навесим нужные события
            */
        }
    }
});

/*************************************************************************
Например мы захотим добавить новый модуль, который что то делает после того, как пользователь выбрал пункт в профиле. Нам достаточно подписать этот модуль на событие 'clickItem' и выполнить нужные действия.

Мы хотим добавить всплывающее окно, появляющееся при клике на работе в портфолио? Не вопрос. В методе event модуля Portfolio добавим нечто вроде
//'.portfolio-item' - класс-обертка, для каждой работы
$('.portfolio-item').click(function(){
    $(window).trigger('showModal');
});


Теперь нам нужно подписать модуль, генерирующий всплывающие окна, по всему нашему приложению — на событие 'showModal' и все.
***************************************************************************/


/**************************************************************************/

     var _asyncFunction = function(text,time,cb){ 
        var cb = cb;
        setTimeout(function(){
            console.log(text);
            cb();
        }, time)
    };

    var asyncFunction = function(text,cb){ 
        setTimeout(function(){
            console.log(text);
            cb();
        }, 3000)
    };

    var asyncFunction1 = function(text,cb){ 
        setTimeout(function(){
            console.log(text);
            cb();
        }, 1000)
    };

    function callback(){
        console.log('world is wonderful!');
    } 


/*
CALASS
http://jsboom.ru/deffered-%D1%80%D0%B0%D0%B7%D0%BB%D0%B8%D1%87%D0%BD%D1%8B%D0%B5-%D0%B0%D0%BB%D0%B3%D0%BE%D1%80%D0%B8%D1%82%D0%BC%D1%8B-%D0%B8-%D0%B2%D0%B0%D1%80%D0%B8%D0%B0%D0%BD%D1%82%D1%8B-%D1%80%D0%B5%D0%B0%D0%BB%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D0%B8/



*/
    function Promise(){
        this.arrFunction = [];
    }

    Promise.prototype.then = function(func){
        var args = Array.prototype.slice.call(arguments,1);
        this.arrFunction.push({'func':func, 'args':args});  
        return this;
    }

    Promise.prototype.all = function(func){
        if (func instanceof Array){
            for(var i=0; i<func.length; i++){
                this.arrFunction.push({'func':func[i][0], 'args':func[i].slice(1)});
            }
        }
        return this;
    }    

    Promise.prototype.execute = function(fn){
        if (this.arrFunction.length>0){            
            var counter = this.arrFunction.length;
            var curStep =  this.arrFunction;
            for(var j=0; j<counter;j++){
                curStep[j].args.push(fn);
                curStep[j].func.apply(null, curStep[j].args);              
            }
        }
    }

/*
USE
*/

var myPromise = new Promise();
myPromise.all([[asyncFunction, 'finished 1.1'],[asyncFunction, 'finished 1.2'],[asyncFunction, 'finished 1.3']])
.all([[_asyncFunction, '_finished 1.1',400],[_asyncFunction, '_finished 1.2',2000],[_asyncFunction, '_finished 1.3', 1000]])
.then(asyncFunction, 'finished 1')
.then(asyncFunction1, 'finished 2')
.execute(callback);
