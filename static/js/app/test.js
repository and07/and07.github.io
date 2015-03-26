// ============= EVENTS =================

var handlers = {
  'user': {},
  'book': {},
  'message': {},
  '_error': [] // допустим, ошибки не зависят от namespace
};

events = [ 'update', 'create', 'delete', 'list' ];

for (var ei = events.length; ei--;) {
  for (var ns in handlers) { // мой объект чист, поэтому не нужно `hasOwnProperty`
    handlers[ns][events[ei]] = [];
  }
};

// ============= SUBSCRIBE/FIRE =================

// теперь объект handlers можно наполнять ссылками
// на "слушателей", группируя их по неймспейсу
// и типу события

// подписаться на событие в неймспейсе
function subscribe(ns, event, handler) {
  handlers[ns][event].push(handler);
}

// подписаться на сообщения об ошибках
function subscribe_errors(handler) {
  handlers._error.push(handler);
}

// сообщить о произошедшем в неймспейсе сообытии
function fire(ns, event, e) {
  var e_handlers = handlers[ns][event],
      hname = 'on_'+ns+'_'+event,
      handler;
  for (var ei = e_handlers.length; ei--;) {
    handler = e_handlers[ei][hname];
    handler.call(handler, e);
  }
}

// сообщить о произошедшей ошибке
function fire_error(err) {
  var e_handlers = handlers._error;
  for (var ei = e_handlers.length; ei--;) {
    e_handlers[ei].on_error.call(handler, err);
  }
}

// ============== PROXY =================

function UserAPI() {
    return { 'get_all': function(f) { f([1, 2], [ {}, {} ]); },
             'save':    function(user, f, errfunc) { f(user); }
           };
}

// некий proxy к серверному API,
// делает только асинхронные вызовы
var uapi = new UserAPI();

// ============== MYAPP ==================

// ваше приложение
function MyApp() {
  // TODO: сделать функцию subscribe_all('user', this)
  subscribe('user','list', this);
  subscribe('user','update', this);
  //. . .
  subscribe_errors(this);
}
// запросить список пользователей
MyApp.prototype.requestUsers = function() {
  uapi.get_all(function(order, res) {
    fire('user', 'list', {
      order: order, list: res
    });
  });
};
// обновить данные о пользователе
// (может вызываться при отправке формы заполнения профиля)
MyApp.prototype.updateUser = function(user) {
  uapi.save(user, function(user) {
    fire('user', 'update', user);
  }, function(err) {
    fire_error(err);
  });
};
// этот метод будет вызван при срабатывании события user/list
MyApp.prototype.on_user_list = function(users) {
  console.log('handled', users);
  //. . . // обновление UI
  //. . . // при необходимости можно выбросить другое событие
}
// этот метод будет вызван при срабатывании события user/update
MyApp.prototype.on_user_update = function(user) {
  console.log('handled', user);
  //. . . // обновление UI
  //. . . // при необходимости можно выбросить другое событие
}
// этот метод будет вызван при ошибке
MyApp.prototype.on_error = function(err) {
  //. . . // нотификация об ошибке, паника, кони, люди
}

var my_app = new MyApp();
my_app.requestUsers();
my_app.updateUser({ 'foo': 'bar' });
