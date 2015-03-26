/*
//http://spiritloose.net/misc/popupmenu/

  popupmenu.js - simple JavaScript popup menu library.

  Copyright (C) 2006 Jiro Nishiguchi <jiro@cpan.org> All rights reserved.
  This is free software with ABSOLUTELY NO WARRANTY.

  You can redistribute it and/or modify it under the modified BSD license.

  Usage:
    var popup = new PopupMenu();
    popup.add(menuText, function(target){ ... });
    popup.addSeparator();
    popup.bind('targetElement');
    popup.bind(); // target is PopupMenu.doc;
*/
var PopupMenu = function(doc) {
    PopupMenu.doc = doc;
    this.init();
}

PopupMenu.doc = undefined;
PopupMenu.SEPARATOR = 'PopupMenu.SEPARATOR';
PopupMenu.current = null;
PopupMenu.addEventListener = function(element, name, observer, capture) {
    if (typeof element == 'string') {
        element = PopupMenu.doc.querySelector(element);
    }
    if (element.addEventListener) {
        element.addEventListener(name, observer, capture);
    } else if (element.attachEvent) {
        element.attachEvent('on' + name, observer);
    }
};
PopupMenu.prototype = {
    init: function() {
        this.items  = [];
        this.width  = 0;
        this.height = 0;
    },
    setSize: function(width, height) {
        this.width  = width;
        this.height = height;
        if (this.element) {
            var self = this;
            with (this.element.style) {
                if (self.width)  width  = self.width  + 'px';
                if (self.height) height = self.height + 'px';
            }
        }
    },
    bind: function(element) {
        var self = this;
        if (!element) {
            element = PopupMenu.doc;
        } else if (typeof element == 'string') {
            element = PopupMenu.doc.querySelector(element);
        }
        this.target = element;
        this.target.oncontextmenu = function(e) {
            e.stopPropagation();
            self.show.call(self, e);
            return false;
        };
        var listener = function() { self.hide.call(self) };
        PopupMenu.addEventListener(PopupMenu.doc, 'click', listener, true);
    },
    add: function(text, callback) {
        this.items.push({ text: text, callback: callback });
    },
    addSeparator: function() {
        this.items.push(PopupMenu.SEPARATOR);
    },
    setPos: function(e) {
        if (!this.element) return;
        if (!e) e = window.event;
        var x, y;
        if (window.opera) {
            x = e.clientX;
            y = e.clientY;
        } else if (PopupMenu.doc.all) {
            x = PopupMenu.doc.body.scrollLeft + event.clientX;
            y = PopupMenu.doc.body.scrollTop + event.clientY;
        } else if (PopupMenu.doc.layers || PopupMenu.doc.getElementById) {
            x = e.pageX;
            y = e.pageY;
        }
        this.element.style.top  = y + 'px';
        this.element.style.left = x + 'px';
    },
    show: function(e) {
        if (PopupMenu.current && PopupMenu.current != this) return;
        PopupMenu.current = this;
        if (this.element) {
            this.setPos(e);
            this.element.style.display = '';
        } else {
            this.element = this.createMenu(this.items);
            this.setPos(e);
            PopupMenu.doc.body.appendChild(this.element);
        }
    },
    hide: function() {
        PopupMenu.current = null;
        if (this.element) this.element.style.display = 'none';
    },
    createMenu: function(items) {
        var self = this;
        var menu = PopupMenu.doc.createElement('div');
        with (menu.style) {
            if (self.width)  width  = self.width  + 'px';
            if (self.height) height = self.height + 'px';
            border     = "1px solid gray";
            background = '#FFFFFF';
            color      = '#000000';
            position   = 'absolute';
            display    = 'block';
            padding    = '2px';
            cursor     = 'default';
        }
        for (var i = 0; i < items.length; i++) {
            var item;
            if (items[i] == PopupMenu.SEPARATOR) {
                item = this.createSeparator();
            } else {
                item = this.createItem(items[i]);
            }
            menu.appendChild(item);
        }
        return menu;
    },
    createItem: function(item) {
        var self = this;
        var elem = PopupMenu.doc.createElement('div');
        elem.style.padding = '4px';
        var callback = item.callback;
        PopupMenu.addEventListener(elem, 'click', function(_callback) {
            
            return function(e) {
            e.stopPropagation();
                self.hide();
                _callback(self.target);
            };
        }(callback), true);
        PopupMenu.addEventListener(elem, 'mouseover', function(e) {
            e.stopPropagation();
            elem.style.background = '#B6BDD2';
        }, true);
        PopupMenu.addEventListener(elem, 'mouseout', function(e) {
            e.stopPropagation();
            elem.style.background = '#FFFFFF';
        }, true);
        elem.appendChild(PopupMenu.doc.createTextNode(item.text));
        return elem;
    },
    createSeparator: function() {
        var sep = PopupMenu.doc.createElement('div');
        with (sep.style) {
            borderTop = '1px dotted #CCCCCC';
            fontSize  = '0px';
            height    = '0px';
        }
        return sep;
    }
};

