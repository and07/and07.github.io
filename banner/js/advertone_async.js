(function(undefined) {
    if (!window.console || !window.console.log) {
        window.console = {
            log: function() {}
        }
    }
    if (!window.getComputedStyle) {
        window.getComputedStyle = function(e, t) {
            this.el = e;
            this.getPropertyValue = function(t) {
                var n = /(\-([a-z]){1})/g;
                if (t == "float") t = "styleFloat";
                if (n.test(t)) {
                    t = t.replace(n, function() {
                        return arguments[2].toUpperCase()
                    })
                }
                return e.currentStyle[t] ? e.currentStyle[t] : null
            };
            return this
        }
    }
    try {
        if (window.theObject !== undefined) {
            window.theObject.make();
            return
        }
        window.theObject = {};
        var Logger;
        var AdvertoneGlobalSettings = {
            ID: Math.random().toString(36).substr(2, 15),
            head: document.getElementsByTagName("head")[0],
            STAT_URL: "//stats.advertone.ru/codestat",
            LOGGER_URL: "//stats.advertone.ru/codelog"
        };

        function inArray(e, t) {
            var n;
            if (e.indexOf) {
                n = e.indexOf(t);
                if (n || n == 0) return n
            } else {
                for (n = 0; n < e.length; ++n) {
                    if (e[n] == t) {
                        return n
                    }
                }
            }
            return -1
        }
        var symbols = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            randStrs = [""];

        function randomStr(e) {
            var t = symbols.length,
                n = t - 10,
                i, r;
            e = e || 9;
            while (!r || inArray(randStrs, r) !== -1) {
                r = symbols.charAt(Math.floor(Math.random() * n)), ++e;
                for (i = 1; i < e; i++) {
                    r += symbols.charAt(Math.floor(Math.random() * t))
                }
            }
            randStrs.push(r);
            return r
        }
        var scripts = document.getElementsByTagName("script"),
            i, base_url, stats_url;

        function _clean_user_url(e) {
            return e && e.replace(/^https?:\/\//i, "").replace(/^\/*/i, "//").replace(/\/+$/i, "")
        }
        for (i = 0; script_node = scripts[i++];) {
            if (script_node.className != "AdvertoneJS") {
                continue
            }
            base_url = _clean_user_url(script_node.getAttribute("data-main-url")), stats_url = _clean_user_url(script_node.getAttribute("data-stats-url"));
            if (base_url && base_url.length && stats_url && stats_url.length) {
                AdvertoneGlobalSettings.BASE_URL = base_url;
                AdvertoneGlobalSettings.STATIC_URL = base_url + "/static";
                AdvertoneGlobalSettings.STAT_URL = stats_url + "/codestat";
                AdvertoneGlobalSettings.LOGGER_URL = stats_url + "/codelog";
                break
            }
            match = script_node.src.search(/\/js\/advertone_async(_\d+\.\d+)?.js/i);
            if (match != -1) {
                AdvertoneGlobalSettings.STATIC_URL = script_node.src.substring(0, match);
                match = AdvertoneGlobalSettings.STATIC_URL.search(/static./i);
                if (match != -1) {
                    AdvertoneGlobalSettings.BASE_URL = AdvertoneGlobalSettings.STATIC_URL.replace(/static./i, "www.")
                } else {
                    AdvertoneGlobalSettings.BASE_URL = AdvertoneGlobalSettings.STATIC_URL
                }
                match = AdvertoneGlobalSettings.BASE_URL.search(/\w\/\w/i);
                if (match != -1) {
                    AdvertoneGlobalSettings.BASE_URL = AdvertoneGlobalSettings.BASE_URL.substr(0, match + 1)
                }
                break
            }
        }

        function postData(url, params) {
            var script = document.createElement("script"),
                idPref = AdvertoneGlobalSettings.ID + Math.random().toString(36).substr(2, 2),
                burl = AdvertoneGlobalSettings.BASE_URL,
                isStaging = burl.indexOf("staging") != -1,
                postfix = isStaging ? "s/" : "p/",
                url = [url, idPref, postfix].join("/"),
                paramList = [],
                paramVal;
            if (isStaging) {
                params = params || {};
                params.stid = +(burl.indexOf("staging2") != -1)
            }
            if (params) {
                url += "?";
                for (param in params) {
                    paramVal = params[param];
                    if (paramVal === 0 || paramVal && (paramVal.length === undefined || paramVal.length)) {
                        paramList.push(param + "=" + (typeof paramVal == "Array" ? paramVal.join(",") : paramVal))
                    }
                }
                url += paramList.join("&")
            }
            if ("" == "v" && window.XDomainRequest) {
                xdr = new XDomainRequest;
                if (xdr) {
                    xdr.onload = function() {
                        eval(xdr.responseText)
                    };
                    xdr.timeout = 1e3;
                    try {
                        xdr.open("GET", url);
                        xdr.send()
                    } catch (e) {
                        setTimeout(function() {
                            postData(url)
                        }, 800)
                    }
                } else {
                    setTimeout(function() {
                        postData(url)
                    }, 800)
                }
            } else {
                script.src = url;
                script.id = idPref;
                AdvertoneGlobalSettings.head.appendChild(script)
            }
        }

        function stringify(e) {
            if (typeof e == "string") return e;
            var t = e ? e.toString() : "";
            if (t.match(/\[.*[oO]bject.*\]/)) {
                t = [];
                for (var n in e) {
                    t.push(n + ": " + e[n])
                }
                t = t.join(", ")
            }
            return t
        }
        Logger = {
            autosend: true,
            buffer: [],
            maxLength: 2e3,
            baseLength: AdvertoneGlobalSettings.LOGGER_URL.length + 10,
            browserLog: function(e, t) {
                t = t ? t : "";
                Logger.console("Logger log: " + String(e) + t)
            },
            errorLog: function(e, t) {
                t = t ? t : "";
                Logger.console("Logger error: " + String(e) + t)
            },
            clear: function() {
                Logger.LoggerData = {
                    l: [],
                    lm: [],
                    e: []
                };
                Logger.EstimatedLength = Logger.baseLength
            },
            bufferize: function() {
                if (!(Logger.LoggerData.l.length || Logger.LoggerData.lm.length || Logger.LoggerData.e.length)) {
                    return
                }
                Logger.buffer.push(Logger.LoggerData);
                Logger.clear()
            },
            log: function(e, t, n) {
                if (!n) {
                    t = stringify(t);
                    Logger.browserLog(e, t);
                    if (t.length > Logger.maxLength - Logger.baseLength - 6) {
                        t = t.substring(0, Logger.maxLength - Logger.baseLength - 9) + "..."
                    }
                    var i = 6 + t ? t.length : 0;
                    if (Logger.EstimatedLength + i > Logger.maxLength) {
                        Logger.bufferize()
                    }
                    Logger.EstimatedLength += i
                }
                if (t) {
                    Logger.LoggerData.lm.push([Logger.LoggerData.l.length, t].join(","))
                }
                Logger.LoggerData.l.push(Number(e))
            },
            error: function(e, t) {
                var n = t.message || t.description || stringify(t);
                Logger.errorLog(e, n);
                var i = 12 + n ? n.length : 0;
                if (i > Logger.maxLength - Logger.baseLength - 12) {
                    n = n.substring(0, Logger.maxLength - Logger.baseLength - 15) + "...";
                    i = n.length
                }
                if (Logger.EstimatedLength + i > Logger.maxLength) {
                    Logger.bufferize()
                }
                Logger.EstimatedLength += i;
                Logger.LoggerData.e.push(Logger.LoggerData.l.length);
                Logger.log(e, n || "empty error msg", true);
                if (Logger.autosend) Logger.send()
            },
            send: function(e) {
                Logger.bufferize();
                e = e || AdvertoneGlobalSettings.LOGGER_URL;
                while (Logger.buffer.length) {
                    postData(e, Logger.buffer.pop())
                }
            },
            has_errors: function() {
                return Logger.LoggerData.e.length > 0
            }
        };
        Logger.clear();
        AdvertoneGlobalSettings.Logger = Logger;
        window.theObject.Logger = Logger;

        function getParameterByName(e) {
            e = e.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var t = "[\\?&]" + e + "=([^&#]*)";
            var n = new RegExp(t);
            var i = n.exec(window.location.search);
            if (i == null) return "";
            else return decodeURIComponent(i[1].replace(/\+/g, " "))
        }
        var parameter = getParameterByName("advertonetest");
        var parameterLog = getParameterByName("advertonelog");
        if (!parameterLog) {
            Logger.browserLog = function() {};
            Logger.errorLog = function() {}
        }
        if (parameter == "testsend") {
            Logger.send();
            Logger.log(5999);
            Logger.log(5999, "Test Log");
            Logger.log(5999, {
                test: "object",
                prop: 2
            });
            Logger.log(5999);
            Logger.error(5999, "Test Error");
            Logger.error(5999, {
                test: "Err object",
                prop: 12
            });
            Logger.send()
        }

        function bind(e, t) {
            if (typeof e === "function") {
                if (e.bind !== undefined) {
                    return e.bind(t)
                } else {
                    return function(n) {
                        return e.apply(t, n)
                    }
                }
            } else {
                return e
            }
        }

        function isElement(e) {
            return typeof HTMLElement === "object" ? e instanceof HTMLElement : e && typeof e === "object" && e !== null && e.nodeType === 1 && typeof e.nodeName === "string"
        }

        function getHTML(e) {
            var t = e.outerHTML;
            if (t) {
                return t
            }
            t = document.createElement("div");
            t.appendChild(e.cloneNode(true));
            return t.innerHTML
        }
        if (!parameter) {
            Logger.console = function(e) {};
            Logger.alert = function(e) {}
        } else if (parameter == "div" || parameter == "sdiv") {
            Logger.console_div = document.createElement("div");
            Logger.console_div.style.backgroundColor = "#ffffff";
            Logger.console_div.style.color = "#000000";
            var logger_wait = setInterval(function() {
                var e = document.getElementsByTagName("body");
                if (!e || !e.length) return;
                e = e[0];
                if (!e.firstElementChild && !document.body.children.length) return;
                clearInterval(logger_wait);
                var t = document.body.firstElementChild || document.body.children[0];
                e.insertBefore(Logger.console_div, t)
            }, 100);
            Logger.console = function(e) {
                var t = document.createElement("div");
                if (isElement(e)) {
                    e = getHTML(e)
                } else {
                    e = e ? e.toString() : ""
                }
                e = e.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                t.innerHTML = e;
                Logger.console_div.appendChild(t)
            };
            if (parameter == "div") {
                Logger.alert = bind(window.alert, window)
            } else {
                Logger.alert = Logger.console
            }
        } else if (parameter == "log") {
            Logger.console = bind(console.log, console);
            Logger.alert = bind(console.warn, console)
        } else {
            Logger.console = bind(console.log, console);
            Logger.alert = bind(window.alert, window)
        }
        var classNames = {
                script_id_prefix: "adv_script_",
                button_prf: randomStr(),
                slider_button: randomStr(),
                slider_button_disabled: randomStr(),
                slider_button_active: randomStr(),
                slider_pull_container: randomStr(),
                slider_buttons_container: randomStr(),
                container_class_prefix: randomStr() + "_",
                main_div_id: randomStr(),
                div_spinlock: randomStr(),
                div_mobile: "mobile",
                block_class: "AdvertoneBlock",
                data_ablock: "data-ablock",
                data_group: "data-group",
                data_loaded: "data-" + randomStr()
            },
            timeoutNames = {
                noopAnimation: randomStr(),
                CheckPreviewResize: randomStr(),
                ts_dom_load_prf: randomStr() + "_",
                checkCallback: randomStr(),
                makeABlocks: randomStr(),
                isAB: randomStr(),
                checkReadyState: randomStr(),
                deferredTBlocks: randomStr()
            },
            consts = {
                initInjKey: randomStr()
            };
        var NavigationFactory = {
            create: function(e, t) {
                Logger.log(0);
                var n = Advertone.settings.ROTATION_TYPES;
                switch (e.settings.rotation_type) {
                    case n.STATIC:
                        return new Static(e, t);
                    case n.SLIDER:
                        return new Pool(e, t);
                    default:
                        Logger.error(1, "Unexpected rotation type: " + e.settings.rotation_type);
                        Logger.console("NavigationFactory error: Unexpected rotation type")
                }
            }
        };

        function Navigation() {}
        Navigation.prototype = {
            animate: function() {},
            getCurrentBlock: function() {},
            animationSuccess: function(e) {},
            animationFail: function(e, t) {}
        };

        function Pool(e, t) {
            if (!t || t.length == 0) {
                Logger.console("Pool error: constructor got empty rs");
                Logger.error(2, "Empty rs");
                return
            }
            var n = this,
                i = Advertone.settings;
            n.total_count = e.settings.limit;
            n.auto_change = !!e.settings.timeout;
            n.loaded_count = 0;
            n.current = null;
            n.tblocks = [];
            n.tblockSuccess = function(e, t) {
                Logger.log(3);
                if (e < n.tblocks.length && n.tblocks[e]) {
                    Logger.console("Pool error: SECOND CALLBACK FOR THE SAME POSITION?!", e, t);
                    Logger.error(4, "Repeated callback: " + e + " / " + t);
                    return false
                }
                n.tblocks[e] = t;
                n.loaded_count++;
                n.buttons.enable(e);
                if (n.loaded_count == 1) n.animate(e, true)
            };
            n.tblockFail = function(e) {
                Logger.log(5);
                Logger.console("Pool error: tb creation has failed", e)
            };
            n.initTblocks = function() {
                Logger.log(6);
                e.nav = n;
                var i, o, s, a, l;
                for (i = 0; i < t.length; i++) {
                    r(i, e, t)
                }
            };

            function r(e, t, i) {
                var r = function(t, n, i, r) {
                    new Tblock(t, n[e], function(t) {
                        i(e, t)
                    }, function(t) {
                        r(e, t)
                    })
                };
                setTimeout(function() {
                    r(t, i, n.tblockSuccess, n.tblockFail)
                }, 0)
            }
            n.getNextTblock = function(e) {
                if (n.loaded_count == 0) return;
                var t;

                function i(e) {
                    if (e >= n.tblocks.length) e = 0;
                    if (t == undefined) t = e;
                    else if (e == t) return false;
                    if (n.tblocks[e] && n.tblocks[e].c) return e;
                    return i(e + 1)
                }
                if (!e && e !== 0) e = n.current ? Advertone.t.inArray(n.tblocks, n.current) + 1 : 0;
                var r = i(e);
                if (r !== false) return n.tblocks[r];
                return false
            };
            n.checkTblock = function(e) {
                for (var t = 0; t < n.tblocks.length; t++)
                    if (n.tblocks[t] == e) return t;
                return -1
            };
            n.initCarouselButtons = function() {
                Logger.console("initCarouselButtons");
                var t = e.prf,
                    i = e.settings,
                    r = e.c["outest"],
                    o = n.total_count,
                    s = Advertone.settings.head,
                    a = "20px",
                    l = i.width,
                    c, u, d, f, g, h, m, v;
                d = [];
                d.id_prefix = p(classNames.button_prf);
                d.add_button = function() {
                    var e = document.createElement("div"),
                        t = d.length,
                        n;
                    e.id = d.id_prefix + t;
                    e.index = t;
                    n = [p(classNames.slider_button), p(classNames.slider_button_disabled)].join(" ");
                    e.className = n;
                    e.onclick = function() {
                        var e = this;
                        _(e)
                    };
                    d.buttons_container.appendChild(e);
                    d.push(e)
                };
                d.remove_button = function(e) {
                    d[e].style = "display: none;";
                    d[e].className = ""
                };
                d.activate = function(e) {
                    var t, n, i;
                    if (e == undefined) return;
                    for (i = 0; i < d.length; i++)
                        if (i != e) d.deactivate(i);
                    n = d[e].className;
                    t = p(classNames.slider_button_active);
                    if (n.indexOf(t) == -1) d[e].className = n + " " + t
                };
                d.deactivate = function(e) {
                    if (e == undefined) return;
                    d.remove_class(e, classNames.slider_button_active)
                };
                d.remove_class = function(e, t) {
                    var n = d[e].className.split(" "),
                        i = Advertone.t.inArray(n, p(t));
                    if (i == -1) return;
                    n.splice(i, 1).join(" ");
                    d[e].className = n
                };
                d.enable = function(e) {
                    if (e == undefined) return;
                    d.remove_class(e, classNames.slider_button_disabled)
                };
                d.disable = function(e) {
                    if (e == undefined) return;
                    d[e].className = d[e].className + " " + p(classNames.slider_button_disabled)
                };
                d.isDisabled = function(e) {
                    return d[e].className.search(p(classNames.slider_button_disabled)) >= 0
                };
                d.findActive = function() {
                    var e;
                    for (var t = 0; t < o; ++t) {
                        if (d[t].className.search(p(classNames.slider_button_active)) >= 0) {
                            e = t;
                            break
                        }
                    }
                    return e
                };

                function p(e) {
                    return t + "_" + e
                }

                function _(e) {
                    return y(d.findActive(), e.index)
                }

                function y(e, t) {
                    if (e == t) return false;
                    if (d.isDisabled(t)) return false;
                    d.deactivate(e);
                    d.activate(t);
                    return n.animate(t, true)
                }
                u = document.createElement("div");
                f = p(classNames.slider_pull_container);
                u.className += " " + f;
                d.main_container = u;
                c = document.createElement("div");
                f = p(classNames.slider_buttons_container);
                c.className = f;
                d.buttons_container = c;
                for (var b = 0; b < o; ++b) d.add_button();
                m = document.createElement("style");
                m.type = "text/css";
                h = ["." + p(classNames.slider_pull_container) + "{" + "overflow: visible;}", "." + p(classNames.slider_buttons_container) + "{" + "display:inline-block; text-align:center;" + "height:" + a + "; width:" + l + "}", "." + p(classNames.slider_button) + "{" + "border-radius:999px;" + "width:10px; height:10px;" + "border: 2px solid;" + "background-color: rgba(0,0,0,0); border-color: black;" + "display: inline-block;" + "cursor:pointer; margin: 5px;" + "}", "." + p(classNames.slider_button_disabled) + "{" + "border-color: rgba(0,0,0,0.3);" + "cursor:default;" + "}", "." + p(classNames.slider_button_active) + "{" + "background: -webkit-radial-gradient(25% 25%, closest-corner,white,orange);" + "background: -o-radial-gradient(25% 25%, closest-corner,white,orange);" + "background: -moz-radial-gradient(25% 25%, closest-corner,white,orange);" + "background: radial-gradient(25% 25%, closest-corner,white,orange);" + "background-color: red;" + "cursor:default;" + "}"].join(" ");
                if (m.styleSheet) m.styleSheet.cssText = h;
                else {
                    v = document.createTextNode(h);
                    m.appendChild(v)
                }
                s.appendChild(m);
                g = r.parentNode;
                g.insertBefore(c, r);
                g.insertBefore(u, c);
                u.appendChild(r);
                return d
            };
            n.buttons = n.initCarouselButtons();
            n.initTblocks()
        }
        Pool.prototype = new Navigation;
        Pool.prototype.animate = function(e, t) {
            var n = this.getNextTblock(e);
            if (!n) {
                Logger.console("Pool error: can't call animation - no next container");
                return
            }
            Logger.log(7);
            Advertone.Animation.show(n, t)
        };
        Pool.prototype.getCurrentBlock = function() {
            return this.current ? this.current : null
        };
        Pool.prototype.getBlockIndex = function(e) {
            return Advertone.t.inArray(this.tblocks, e)
        };
        Pool.prototype.animationSuccess = function(e) {
            var t = this.checkTblock(e);
            if (t < 0) {
                Logger.console("Pool error: animation returned unexpected container ", e)
            } else {
                this.current = this.tblocks[t];
                this.buttons.activate(t)
            }
            if (this.auto_change) this.animate()
        };
        Pool.prototype.animationFail = function(e, t) {
            Logger.console("Pool error: anmation failed for tblock", t, e);
            Logger.error(8, e)
        };

        function Static(e, t) {
            if (!t || t.length != 1) {
                Logger.console("Static error: constructor got bad rs", t);
                return
            }
            var n = this;
            n.tblock = null;
            n.is_shown = false;
            n.tblockSuccess = function(e) {
                n.tblock = e;
                n.animate()
            };
            n.tblockFail = function() {
                Logger.console("Static tblockFail");
                Logger.console("static error: tb creation has failed")
            };
            n.initTblocks = function() {
                e.nav = n;
                var i = t[0];
                setTimeout(function() {
                    new Tblock(e, i, n.tblockSuccess, n.tblockFail)
                }, 0)
            };
            n.initTblocks()
        }
        Static.prototype = new Navigation;
        Static.prototype.animate = function(e) {
            Logger.console("in animate");
            if (!e && this.is_shown || !this.tblock || !this.tblock.c) return;
            Advertone.Animation.show(this.tblock, true)
        };
        Static.prototype.getCurrentBlock = function() {
            return this.is_shown ? this.tblock : null
        };
        Static.prototype.getLoadedTblocks = function() {
            return this.tblock && this.tblock.c ? [this.tblock] : []
        };
        Static.prototype.animationSuccess = function(e) {
            this.is_shown = this.tblock && this.tblock == e;
            if (!this.is_shown) Logger.console("Static error: animation returned unexpected container ", e)
        };
        Static.prototype.animationFail = function(e, t) {
            Logger.console("Static error: animation failed for tblock ", t, e)
        };

        function Tblock(e, t, n, i) {
            var r = 1;
            var o = this,
                s = Advertone.Gsys,
                a;
            o.sid = t.sid;
            o.type = t.type;
            o.bid = e.id;
            o.lock_type = t.spinlock || 0;
            o.tbid = t.bid;
            o.block_code = t.code;
            a = s.sysSettings[o.sid].types[o.type];
            o.c = Advertone.t.create_container(e);
            Advertone.clickCounter.registerBlock(o);
            e.c[-1].appendChild(o.c);
            o.decline = function() {};
            o.loadCode = function(e) {
                try {
                    Advertone.Inj.init();
                    var t = {
                        block: o,
                        key: consts.initInjKey
                    };
                    if (e) {
                        Advertone.t.deepCopy(e, t)
                    }
                    if (a.forced_view) {
                        Advertone.Animation.show(o, !0)
                    }
                    Advertone.Inj.documentWrite(o.block_code, t)
                } catch (n) {
                    Logger.console("Tblock error: eval_code exception occurred: ablock =" + o.bid + "; tblock = " + o.tbid + ";.\n" + n);
                    i(o);
                    return false
                }
                return true
            };
            o.codeReady = function() {
                Logger.console("Code Ready!");
                n(o)
            };

            function l(e) {
                var t = ["table", "td", "img", "iframe", "param", "a", "ins", "div"],
                    n = Advertone.t.inArray(t, e.tagName.toLowerCase()) != -1,
                    i = e.style.display != "none";
                return n && i
            }
            o.appendToContainer = function(e) {
                o.c.appendChild(child)
            };
            if (o.block_code) {
                if (!a.deferred_load) {
                    s.ask(o)
                } else {
                    Advertone.deferredTBlocks.push(o)
                }
            } else {
                o.codeReady()
            }
        }
        BaseStates = function() {
            this.inactive = 0;
            this.waiting = 999
        };
        FlagsObject = function() {
            var e = 0;

            function t(e) {
                return 1 << e
            }
            this.dropAll = function() {
                e = 0
            };
            this.set = function(n) {
                e |= t(n)
            };
            this.drop = function(n) {
                this.set(n);
                e ^= t(n)
            };
            this.check = function(n) {
                return Boolean(e & t(n))
            };
            this.checkAll = function() {
                var e = true;
                for (var t = 0; t < arguments.length && e; ++t) e = this.check(arguments[t]);
                return e
            };
            this.checkAny = function() {
                var e = false;
                for (var t = 0; t < arguments.length && !e; ++t) e = this.check(arguments[t]);
                return e
            }
        };
        DimensionObject = function(e) {
            var t = e.split(/\d+/);
            this.measure = t[t.length - 1];
            this.total = Number(e.substr(0, Advertone.t.inArray(e, this.measure)));
            this.max = function(e) {
                if (this.measure && e.measure && this.measure != e.measure) {
                    throw this.measure + " and " + e.measure + " are different mesures, can`t be compared."
                }
                if (this.total >= e.total) return this;
                return e
            };
            this.toString = function() {
                return this.total + this.measure
            };
            this.halfStr = function() {
                return this.total / 2 + this.measure
            };
            this.equal = function(e) {
                return (!this.measure || !e.measure || this.measure == e.measure) && this.total == e.total
            }
        };
        BaseAnimation = function() {
            var e = new BaseStates,
                t = this;
            this.blockData = {};
            this.version = "BaseAnimation";

            function n() {
                return {
                    needRestyle: true,
                    nowState: e.inactive,
                    settingsChanged: true,
                    flags: new FlagsObject
                }
            }

            function i(e) {
                return {
                    library: {},
                    settings: e,
                    inner: {},
                    outer: {
                        css: {},
                        keyframes: {},
                        style: undefined
                    },
                    state: n()
                }
            }
            this.show = function(n, i) {
                Logger.console("Base Show! " + n.bid);
                Logger.log(6e3, n.bid);
                var r = t.blockData[n.bid];
                var o = r.ABlock;
                var s = o.nav;
                var a = r.state;
                var l = i ? 0 : r.delay;
                if (r.state.nowState == e.waiting) r.state.timeouts.clear_all();
                r.state.timeouts.set(timeoutNames.noopAnimation, function() {
                    var t = s.getCurrentBlock();
                    if (a.gHeight.measure != "auto") {
                        o.c.outest.style.height = a.gHeight.toString()
                    }
                    if (a.gWidth.measure != "auto") {
                        o.c.outest.style.width = a.gWidth.toString()
                    }
                    if (t) t.c.style.display = "none";
                    n.c.style.display = "block";
                    if (a.gHeight.measure == "auto") {
                        o.c.outest.style.minHeight = Math.max(o.c.outest.clientHeight, new DimensionObject(o.c.outest.style.minHeight).total) + "px"
                    }
                    if (a.gWidth.measure == "auto") {
                        o.c.outest.style.minWidth = Math.max(o.c.outest.clientWidth, new DimensionObject(o.c.outest.style.minWidth).total) + "px"
                    }
                    s.animationSuccess(n);
                    r.state.nowState = e.inactive;
                    if (window.AdvertoneDashboardMode) {
                        var i = 10,
                            l = 10;

                        function c(e) {
                            var t = e.ABlock.c.outest.clientWidth,
                                n = e.ABlock.c.outest.clientHeight;
                            previewTransForm(t, n)
                        }
                        r.ABlock.intervals.set(timeoutNames.CheckPreviewResize, function() {
                            c(r)
                        }, i, l)
                    }
                }, l);
                r.state.nowState = e.waiting
            };
            this.inited = function() {
                var e, n, i = [];
                for (n in t.blockData) {
                    if (t.blockData[n]) i.push(t.blockData[n].ABlock)
                }
                return i
            };
            this.init = function(n) {
                Logger.log(6001);
                if (t.blockData[n.id]) {
                    if (t.blockData[n.id].transition.outer.style) t.blockData[n.id].transition.outer.style.parentNode.removeChild(t.blockData[n.id].transition.outer.style);
                    if (t.blockData[n.id].effect.outer.style) t.blockData[n.id].effect.outer.style.parentNode.removeChild(t.blockData[n.id].effect.outer.style);
                    if (t.blockData[n.id].interactive.outer.style) t.blockData[n.id].interactive.outer.style.parentNode.removeChild(t.blockData[n.id].interactive.outer.style)
                }
                t.blockData[n.id] = {
                    ABlock: n,
                    nowAnimation: {},
                    effect: i(n.settings.animate.effect),
                    interactive: i(n.settings.animate.interactive),
                    transition: i(n.settings.animate.transition),
                    state: {
                        timeouts: new Advertone.Timeouts,
                        nowState: e.inactive,
                        flags: new FlagsObject
                    },
                    delay: n.settings.timeout
                };
                var r = t.blockData[n.id].state;
                r.height = new DimensionObject(n.settings.height);
                r.width = new DimensionObject(n.settings.width);
                r.gHeight = new DimensionObject(n.settings.height);
                r.gWidth = new DimensionObject(n.settings.width);
                if (r.height.measure == "%") {
                    r.height.measure = "auto";
                    r.gHeight.measure = "auto"
                }
                if (r.width.measure == "%") {
                    r.width.measure = "auto";
                    r.gWidth.measure = "auto"
                }
                Advertone.stoped = false
            };
            this.stopAll = function(i) {
                Logger.log(6002);
                var r = t.blockData[i.id];
                r.state.timeouts.clear_all();
                r.state.nowState = e.inactive;
                if (r.effect.state.outer && r.effect.state.outer.style) r.effect.state.outer.style.parentNode.removeChild(r.effect.state.outer.style);
                r.effect.state = n();
                if (r.interactive.state.outer && r.interactive.state.outer.style) r.interactive.state.outer.style.parentNode.removeChild(r.interactive.state.outer.style);
                r.interactive.state = n();
                if (r.transition.state.outer && r.transition.state.outer.style) r.transition.state.outer.style.parentNode.removeChild(r.transition.state.outer.style);
                r.transition.state = n();
                Advertone.stoped = true
            }
        };
        var Detector = function() {
            var e = this,
                t, n;
            this.Device = new function() {
                var e = this,
                    t = window.navigator.userAgent.toLowerCase(),
                    n = function(e) {
                        return t.indexOf(e) !== -1
                    },
                    i = !1;
                this.isIphone = function() {
                    if (n("iphone")) return "iphone"
                };
                this.isIpod = function() {
                    if (n("ipod")) return "ipod"
                };
                this.isIpad = function() {
                    if (n("ipad")) return "ipad"
                };
                var r;
                this.isIOS = function() {
                    if (r === undefined) r = e.isIphone() || e.isIpod() || e.isIpad() ? "ios" : "";
                    return r
                };
                this.isKindle = function() {
                    if (!n("android") && n("silk/")) return "kindle"
                };
                this.isAndroid = function() {
                    if (n("android") || e.isKindle()) return "android"
                };
                this.isAndroidPhone = function() {
                    return e.isAndroid() && n("mobile") && !e.isKindle()
                };
                this.isAndroidTablet = function() {
                    return e.isAndroid() && !n("mobile") || e.isKindle()
                };
                this.isBlackberry = function() {
                    if (n("blackberry") || n("bb10") || n("rim")) return "blackberry"
                };
                this.isBlackberryPhone = function() {
                    return e.isBlackberry() && !n("tablet")
                };
                this.isBlackberryTablet = function() {
                    return e.isBlackberry() && n("tablet")
                };
                this.isWindows = function() {
                    if (n("windows")) return "windows"
                };
                this.isWindowsPhone = function() {
                    return e.isWindows() && n("phone")
                };
                this.isWindowsTablet = function() {
                    return e.isWindows() && n("touch")
                };
                this.isFxos = function() {
                    if ((n("(mobile;") || n("(tablet;")) && n("; rv:")) return "fxos"
                };
                this.isFxosPhone = function() {
                    return e.isFxos() && n("mobile")
                };
                this.isFxosTablet = function() {
                    return e.isFxos() && n("tablet")
                };
                this.isMeego = function() {
                    if (n("meego")) return "meego"
                };
                this.isMobile = function() {
                    if (e.isAndroidPhone() || e.isIphone() || e.isIpod() || e.isWindowsPhone() || e.isBlackberryPhone() || e.isFxosPhone() || e.isMeego()) return "phone"
                };
                this.isTablet = function() {
                    if (e.isIpad() || e.isAndroidTablet() || e.isBlackberryTablet() || e.isWindowsTablet() || e.isFxosTablet()) return "tablet"
                };
                this.isPortrait = function() {
                    if (Math.abs(window.orientation) !== 90) return "portrait"
                };
                this.isLandscape = function() {
                    if (Math.abs(window.orientation) === 90) return "landscape"
                };
                this.isFirefox = function() {
                    if (n("firefox")) return "firefox"
                };
                this.isChrome = function() {
                    if (n("chrome")) return "chrome"
                };
                this.isDefaultAndroid = function() {
                    return !e.isIOS() && !e.isFirefox() && !e.isChrome()
                };
                this.isOperaMini = function() {
                    if (n("opera mini")) return "opera mini"
                };
                var o;
                this.getType = function() {
                    if (o === undefined) {
                        o = e.isMobile() || e.isTablet() || "desktop"
                    }
                    return o
                };
                this.getOS = function() {
                    return e.isIOS() || e.isAndroid() || e.isWindows() || e.isBlackberry() || e.isFxos() || e.isMeego || "undefined"
                };
                this.getBrowser = function() {
                    return e.isFirefox() || e.isChrome() || e.isOperaMini() || ""
                };
                this.getOrientation = function() {
                    return e.isPortrait() || e.isLandscape() || "undefined"
                };
                this.getDevice = function() {
                    Logger.log(702);
                    Logger.console("Device is_check " + i);
                    if (!i) {
                        i = !0;
                        Logger.log(703);
                        Logger.console("Device ua " + navigator.userAgent.toLowerCase() + " " + e.isAndroid());
                        return e.isAndroid() || e.isIphone() || e.isIpad() || e.isIpod() || e.isBlackberry() || e.isWindows() || e.isFxos() || e.isMeego() || ""
                    } else {
                        Logger.log(704);
                        return ""
                    }
                }
            };
            this.isIE = function() {
                if (t !== undefined) return t;
                var e = navigator.userAgent.toLowerCase();
                return e.indexOf("msie") != -1 ? parseInt(e.split("msie")[1]) : e.search(/trident/) != -1 ? 11 : false
            };
            var i, r = randomStr(),
                o, s = randomStr(),
                a, l = "pagead2.googlesyndication.com.adsense",
                c, u = function() {
                    if (n !== undefined || c !== undefined) {
                        Logger.log(719);
                        return n
                    }
                    var e = document.getElementsByTagName("head")[0],
                        t = e.childNodes,
                        i = t.length,
                        r, o, s;
                    Logger.log(720);
                    for (s = 0; s < i; ++s) {
                        r = t[s];
                        if (r.nodeType === 8) {
                            o = r.textContent || r.innerText || "";
                            if (o.indexOf("Adguard") > -1) {
                                n = !0;
                                break
                            }
                        }
                    }
                    Logger.log(721);
                    c = !n ? !1 : !0;
                    return n
                },
                d;
            this.isAB = function() {
                n = u();
                Logger.log(711);
                if (n !== undefined) return n;
                Logger.log(712);
                if (i === undefined || o === undefined || a === undefined) {
                    Logger.log(713);

                    function e() {
                        Logger.log(714);
                        if (n !== undefined) return;
                        Logger.log(715);
                        if (!a.status || o.style.display.indexOf("none") > -1 || i.style.visibility == "hidden" || i.clientHeight == 0) {
                            Logger.log(716);
                            n = !0
                        } else {
                            Logger.log(717);
                            n = !1
                        }
                        i.parentNode.removeChild(i);
                        o.parentNode.removeChild(o);
                        a.link.parentNode.removeChild(a.link);
                        i = o = a.link = a = undefined;
                        Logger.log(718)
                    }
                    i = document.createElement("iframe");
                    o = document.createElement("img");
                    i.id = r;
                    i.style.display = "block";
                    i.style.border = "none";
                    i.style.position = "absolute";
                    o.id = s;
                    o.src = AdvertoneGlobalSettings.STATIC_URL + "/adimages/advertisement.png";
                    i.src = AdvertoneGlobalSettings.STATIC_URL + "/adimages/advertisement.html";
                    A_t.loadScript(l);
                    a = Advertone.settings.SCRIPTS_LOADED[l];
                    o.style.position = "absolute";
                    o.style.width = i.style.width = "1px";
                    o.style.height = i.style.height = "1px";
                    o.style.top = i.style.top = "-1000px";
                    o.style.left = i.style.left = "-1000px";
                    A_t.insertFirst(i, document.body);
                    A_t.insertFirst(o, document.body);
                    Advertone.timeouts.set(timeoutNames.isAB, e, 200)
                }
                return n
            };
            var f = function() {
                Logger.log(700);
                t = e.isIE();
                Logger.log(706);
                guarantyBody("isAB_wait", e.isAB);
                Logger.log(701)
            };
            f()
        };

        function GlobalSys() {
            Logger.log(705);
            var MAX_CHECK_DOM_RETRIES = 2e3,
                lockingPref = "adv-lock-",
                prefLen = 9,
                self = this,
                stackTraceLimitExist = Error.hasOwnProperty("stackTraceLimit"),
                stack = stacktrace();
            this.sysPool = {};
            this.lockDict = {};
            this.sysSettings = {};
            this.activeBlocks = {};
            this.foreignBlocks = {};
            this.aBlockLockDict = {};
            this.gLock = {
                DocWr: {
                    needsLock: !stack || !stack.length || !stackTraceLimitExist || Advertone.settings.isIE10,
                    isLocked: false
                }
            };
            this.queue = {
                _queue: {},
                _ablockQueue: {},
                _globalQueue: [],
                pop: function(e, t) {
                    return this.getQueue(e, t).pop()
                },
                push: function(e, t, n) {
                    if (n) {
                        if (typeof this._ablockQueue[n] == "undefined") this._ablockQueue[n] = [];
                        this._ablockQueue[n].unshift(t)
                    } else if (e) {
                        if (typeof this._queue[e] == "undefined") this._queue[e] = [];
                        this._queue[e].unshift(t)
                    } else this._globalQueue.unshift(t)
                },
                isNotEmpty: function(e, t) {
                    return this.getQueue(e, t).length
                },
                getQueue: function(e, t) {
                    if (t) return this._ablockQueue[t] || [];
                    if (e) return this._queue[e] || [];
                    return this._globalQueue
                }
            };
            this.changeLockState = function(e) {
                return function(t) {
                    var n = this.sysSettings[t],
                        i = n.selectors,
                        r = createMap(i, false),
                        o = changeContainersLockState(e),
                        s = this.activeBlocks[t],
                        a;
                    if (s) {
                        a = getContainers(this.sysPool[t] || [], n, s.type);
                        o(a, r)
                    }
                    o(this.foreignBlocks[t], r)
                }
            };
            this.lockBlocks = this.changeLockState(addPref);
            this.unlockBlocks = this.changeLockState(removePref);
            this.check = function(e) {
                this.checkTScriptDomReady(e, 0)
            };
            this.getLock = function(e, t) {
                return t ? this.aBlockLockDict[t] : e ? this.lockDict[e] : this.gLock.DocWr.isLocked
            };
            this.setLock = function(e, t, n) {
                if (n) this.aBlockLockDict[n] = t;
                if (e) this.lockDict[e] = t;
                else this.gLock.DocWr.isLocked = t
            };
            this.setSystem = function(e) {
                var t = this.sysSettings,
                    n = this;

                function i(e, n) {
                    var i = t[e].types;
                    if (i.hasOwnProperty(n.type)) {
                        ++i[n.type].amt
                    } else {
                        i[n.type] = deepCopy(n.type_settings || {});
                        i[n.type].amt = 1;
                        i[n.type].insert = 0;
                        if (i[n.type].one_script) {
                            i[n.type].pool = []
                        }
                    }
                }
                forEach(function(e) {
                    var r = e.sid;
                    if (t.hasOwnProperty(r)) {
                        i(r, e);
                        return
                    }
                    t[r] = {
                        types: {}
                    };
                    i(r, e);
                    delete e["type"];
                    delete e["type_settings"];
                    delete e["sid"];
                    deepCopy(e, t[r]);
                    n.foreignBlocks[r] = findForeigners(n.sysSettings[r].selectors)
                }, e)
            };
            this.ask = function(e) {
                var t = e.sid,
                    n = e.bid,
                    i = this.sysPool[t] || [],
                    r = this.sysSettings[t],
                    o = this,
                    s = function(t, n) {
                        if (Advertone.t.inArray(i, e) != -1) return;
                        if (o.getLock(t, n)) {
                            o.queue.push(t, e, n)
                        } else {
                            o.setLock(t, true, n);
                            o.lockBlocks(t || e.sid);
                            o.activate(e)
                        }
                    },
                    a = Advertone.aBlocks[n],
                    l = a.settings.force_slider_order;
                if (!this.gLock.DocWr.needsLock || r.no_document_write) {
                    Logger.log(701);
                    if (e.lock_type >= 1 || this.sysSettings[t].types[e.type].spinlock > 1) {
                        Logger.log(702);
                        if (r.max && !!i && r.max <= i.length) {
                            e.decline()
                        } else {
                            s(t, l && n)
                        }
                    } else {
                        Logger.log(703);
                        e.loadCode()
                    }
                } else {
                    Logger.log(704);
                    s()
                }
            };
            this.unlock = function(e) {
                var t = e.sid,
                    n = e.bid,
                    i = this.sysSettings[t],
                    r = Advertone.aBlocks[n],
                    o = r.settings.force_slider_order,
                    s = this;
                ++i.types[e.type].insert;
                if (e.lock_type == 0 && i.types[e.type].spinlock == 1) return;
                (function(e, n) {
                    var i = !s.queue.isNotEmpty(e),
                        r = !s.queue.isNotEmpty(null, n),
                        o, a;
                    if (i && r) {
                        s.unlockBlocks(t);
                        s.setLock(e, false, n)
                    } else {
                        if (!i) {
                            a = s.queue.pop(e);
                            if (t != a.sid) s.unlockBlocks(t);
                            s.lockBlocks(a.sid);
                            s.activate(a)
                        }
                    }
                })(!this.gLock.DocWr.needsLock || i.no_document_write ? t : null, o && n)
            };
            this.activate = function(block) {
                Logger.log(705);
                var self = this,
                    sid = block.sid,
                    type = block.type,
                    ssets = this.sysSettings[sid],
                    stsets = ssets.types[type],
                    options = {};
                if (stsets.one_script) {
                    if (stsets.insert + 1 != stsets.amt) {
                        options.only_html = !0;
                        stsets.pool.push(block)
                    } else {
                        stsets.pool = []
                    }
                }
                eval(ssets.cleanSys);
                this.activeBlocks[sid] = block;
                block.loadCode(options)
            };
            this.checkTScriptDomReady = function(e, t) {
                var n = this,
                    i = e.c,
                    r = e.sid,
                    o = e.type,
                    s = n.sysSettings[r],
                    a = getTimeouts(e.bid),
                    l = [],
                    c = Advertone.settings.STAT_URL + "/" + e.tbid,
                    u, d, f, g, h;

                function m(e) {
                    var t = ["table", "td", "img", "iframe", "param", "yatag", "embed", "object"],
                        n, i, r, o, s;
                    for (n = 0; n < t.length; n++) {
                        r = e.getElementsByTagName(t[n]);
                        if (r.length) {
                            return true
                        }
                    }
                    return false
                }
                d = i.getElementsByTagName("ins");
                for (h = 0; h < d.length; h++) {
                    if (d[h].getAttribute("fake") == "fake") {
                        try {
                            d[h].parentNode.removeChild(d[h])
                        } catch (v) {
                            Logger.console("Error: can't delete fake ins")
                        }
                        f = !0;
                        break
                    }
                }
                if (!f) {
                    u = i.getElementsByTagName("script");
                    if (u.length) {
                        l = i.getElementsByTagName("iframe");
                        for (h = 0; h < l.length; h++) {
                            if (l[h].src || m(l[h].contentDocument || l[h].contentWindow.document)) {
                                g = true;
                                break
                            }
                        }
                    }
                }
                if (f || g || !u.length || m(i)) {
                    try {
                        a.clear(timeoutNames.ts_dom_load_prf + r + "_" + e.tbid);
                        n.sysPool[r] = n.sysPool[r] ? n.sysPool[r] : [];
                        n.sysPool[r].push(e);
                        Logger.console("DOM ready! " + e.bid + ", " + e.tbid);
                        n.unlock(e);
                        e.codeReady(true);
                        if (e.tbid && +e.tbid > 0) {
                            postData(c + "/1", {
                                lt: (new Date).getTime() - Advertone.settings.start,
                                adbl: +Advertone.Detect.isAB() || 0
                            })
                        }
                    } catch (v) {
                        Logger.error(706, v);
                        Logger.console("Error in Dom ready");
                        Logger.console(v.message);
                        throw v
                    }
                } else if (t < MAX_CHECK_DOM_RETRIES) {
                    this.setBlockTimeout(e, a, t)
                } else {
                    Logger.log(707);
                    Logger.console("DOM failed! " + e.bid + ", " + e.tbid);
                    this.unlock(e);
                    if (e.tbid && +e.tbid > 0) {
                        postData(c + "/0", {
                            adbl: +Advertone.Detect.isAB()
                        })
                    }
                }
            };
            this.setBlockTimeout = function(e, t, n) {
                var i = this;
                t.set(timeoutNames.ts_dom_load_prf + e.sid + "_" + e.tbid, function() {
                    i.checkTScriptDomReady(e, n + 1)
                }, 13)
            };

            function findForeigners(e) {
                Logger.log(708);
                var t = createMap(e, true),
                    n = [],
                    i, r, o;
                for (i in t) {
                    if (t.hasOwnProperty(i) && t[i].hasOwnProperty("elems")) {
                        r = t[i].elems;
                        o = t[i].attrs;
                        r = filter(function(e) {
                            var t = false,
                                n, i, r, s, a, l, c, u;
                            for (c = 0; c < o.length; c++) {
                                n = o[c];
                                i = n.atr;
                                r = n.value;
                                if (attrIs(i, "class")) {
                                    s = e.className;
                                    if (s) {
                                        a = s.split(/\s+/);
                                        for (u = 0; u < a.length; u++)
                                            if (a[u].search(r) == 0) return true
                                    }
                                } else if (attrIs(i, "id")) {
                                    t = e.id.search(r) == 0
                                } else {
                                    if (typeof r === "undefined") t = hasAttr(e, i) && e.getAttribute(i).search(lockingPref) == -1;
                                    else t = hasAttr(e, i) && e.getAttribute(i).search(r) == 0
                                }
                            }
                            return t
                        }, r);
                        n.push.apply(n, r)
                    }
                }
                return n
            }

            function getContainers(e, t, n) {
                Logger.log(709);
                var r = [],
                    o = t.types[n],
                    s = o.spinlock;
                forEach(function(e) {
                    if (s == 3 && e.type == n && Advertone.t.inArray(o.pool, e) > -1) return;
                    var t = e.c,
                        a = t.getElementsByTagName("*");
                    r.push(t);
                    try {
                        r.push.apply(r, a)
                    } catch (c) {
                        l = r.length;
                        for (i = 0; i < a.length; i++)
                            if (a[i]) {
                                r[l + i] = a[i]
                            }
                    }
                }, e);
                return r
            }

            function changeContainersLockState(e) {
                Logger.log(710);
                return function(t, n) {
                    var i = handleClassPref(e);
                    forEach(function(t) {
                        var r = t.tagName.toLowerCase(),
                            o, s, a, l;
                        if (!n.hasOwnProperty(r)) return;
                        s = n[r].attrs;
                        for (o = 0; o < s.length; o++) {
                            a = s[o].atr;
                            l = s[o].value;
                            if (attrIs(a, "class")) i(t, l);
                            else t.setAttribute(a, e(t.getAttribute(a)))
                        }
                    }, t)
                }
            }

            function removePref(e) {
                return e && e.search(lockingPref) == 0 ? e.slice(prefLen) : e || ""
            }

            function addPref(e) {
                return e && e.search(lockingPref) == 0 ? e : lockingPref + (e || "")
            }

            function attrIs(e, t) {
                return e.search(t) == 0
            }

            function hasAttr(e, t) {
                return e.hasAttribute ? e.hasAttribute(t) : e.getAttributeNode(t).specified
            }

            function handleClassPref(e) {
                return function(t, n) {
                    var i = t.className.split(/\s+/),
                        r = map(function(t) {
                            return t.search(n) != -1 ? e(t) : t
                        }, i);
                    t.className = r.join(" ")
                }
            }

            function createMap(e, t) {
                var n = {};
                if (!e) return {};
                forEach(function(e) {
                    var i = e.tag.slice(),
                        r = e.atrs;
                    if (!n.hasOwnProperty(i)) {
                        n[i] = {};
                        if (t) n[i].elems = document.getElementsByTagName(i);
                        n[i].attrs = r
                    } else {
                        [].push.apply(n[i].attrs, r)
                    }
                }, e);
                return n
            }
            if (window.TESTMODE) {
                this.lockForeigners = function(e, t) {
                    var n = createMap(t, false);
                    changeContainersLockState(addPref)(e, n)
                };
                this.unlockForeigners = function(e, t) {
                    var n = createMap(t, false);
                    changeContainersLockState(removePref)(e, n)
                };
                this.findForeigners = findForeigners;
                this.removePref = removePref;
                this.addPref = addPref;
                this.attrIs = attrIs;
                this.hasAttr = hasAttr;
                this.createMap = createMap
            }
        }

        function AdvertoneInjector() {
            var e = [],
                t = document.open,
                n = document.close,
                i = document.write,
                r = document.writeln,
                o = Advertone.Gsys.gLock["DocWr"].needsLock,
                s = 0,
                a = 0,
                l = this;
            this.init = function() {
                Logger.log(500);
                l.wrln = !1
            };
            setInjectorDocumentMethods = function() {
                document.open = l.documentStub;
                document.close = l.documentStub;
                document.write = l.documentWrite;
                document.writeln = l.documentWriteln
            };
            setDefaultDocumentMethods = function() {
                document.open = t;
                document.close = n;
                document.write = i;
                document.writeln = r
            };
            var c = function(e, t) {
                Logger.log(530, e.id);
                document.write = e.documentWrite;
                document.writeln = e.documentWriteln;
                if (document.write !== e.documentWrite) {
                    Logger.console("Not overriden docWr!");
                    Logger.error(531, "Not overriden docWr");
                    throw Error("Not overriden docWr!")
                }
                if (!l.wrln) {
                    Logger.log(532);
                    document.write(t)
                } else {
                    Logger.log(533);
                    document.writeln(t)
                }
                document.write = l.documentWrite;
                document.writeln = l.documentWriteln;
                Logger.log(534)
            };
            var u = function(e, t) {
                var n = Advertone.settings,
                    o = document.readyState == "complete",
                    s = n.doc_wr === i,
                    a = n.doc_wrln === r;
                if (!l.wrln && (!s || !o)) {
                    Logger.console("DocWr!");
                    Logger.log(!s ? 519 : 520);
                    if (t === undefined) {
                        i.call(document, e)
                    } else {
                        i.call(document, e, t)
                    }
                } else if (l.wrln && (!a !== r || !o)) {
                    Logger.log(!a ? 521 : 522);
                    if (t === undefined) {
                        r.call(document, e)
                    } else {
                        r.call(document, e, t)
                    }
                } else {
                    Logger.log(523);
                    Logger.console("DOM LOAD! document.write doesn't work");
                    Logger.console("DOM LOAD! document.write doesn't work")
                }
            };
            var d = function(e, t) {
                for (var n = 0, i = t.length; n < i; ++n) {
                    if (e.indexOf(t[n]) > -1) {
                        return !0
                    }
                }
                return !1
            };
            var f = function(t, n) {
                Logger.log(507);
                if (n !== undefined) {
                    if (n.key !== consts.initInjKey) {
                        u(t, n);
                        return
                    }
                    Logger.log(501);
                    var i = new Injector(n);
                    Logger.log(502);
                    setInjectorDocumentMethods();
                    i.insert(t);
                    if (i.finished) {
                        Logger.log(503);
                        delete i;
                        setDefaultDocumentMethods()
                    } else {
                        i.id = s++;
                        Logger.log(504, i.id);
                        e.push(i)
                    }
                } else {
                    if (o) {
                        Logger.log(505);
                        if (e.length) {
                            c(e[0], t)
                        } else {
                            u(t)
                        }
                    } else {
                        Logger.log(506);
                        var r = stacktrace(),
                            a, l;
                        if (r && r.length) {
                            for (m = r.length - 1; m > -1; m--) {
                                if (r[m].search(/https?:\/\/.*?/) > -1) {
                                    a = m;
                                    break
                                }
                            }
                            if (a !== undefined && a != -1) {
                                l = r[a].match(/(https?:\/\/[^\"\'\)\>\s]+)/)[1];
                                if (l) {
                                    end = l.search(/(:\d*?:?\d*?\s*?)$/);
                                    if (end != -1) l = l.substring(0, end)
                                }
                            }
                        }
                        if (l) {
                            Logger.log(510);
                            var f, g, h, m, v;
                            for (m = 0, v = e.length; m < v; ++m) {
                                g = e[m];
                                if (l.indexOf(g.src) > -1) {
                                    f = g;
                                    break
                                }
                            }
                            if (!f) {
                                for (m = 0, v = e.length; m < v; ++m) {
                                    g = e[m];
                                    h = g.srcHistory;
                                    if (h && h.length && d(l, h)) {
                                        f = g;
                                        break
                                    }
                                }
                            }
                            if (f) {
                                Logger.log(511);
                                c(f, t)
                            } else {
                                Logger.log(512);
                                u(t)
                            }
                        } else {
                            Logger.log(518);
                            Logger.console("!Src");
                            u(t)
                        }
                    }
                }
            };
            this.documentWrite = function(e, t) {
                Logger.log(540);
                l.wrln = !1;
                f(e, t)
            };
            this.documentWriteln = function(e, t) {
                Logger.log(541);
                l.wrln = !0;
                f(e, t)
            };
            this.documentStub = function() {};
            this.del = function(t) {
                Logger.log(542, t);
                var n, i;
                for (n = 0; n < e.length; ++n) {
                    if (e[n].id == t) {
                        i = !0;
                        break
                    }
                }
                if (i) {
                    Logger.log(543);
                    e.splice(n, 1)
                } else {
                    Logger.error(544, "not found inj");
                    Logger.console("not found inj")
                }
                if (!e.length) {
                    setDefaultDocumentMethods()
                }
                return e.length
            }
        }

        function Injector(e) {
            var t = this,
                n, i, r, o = !1,
                s = [],
                a = [],
                l = "",
                c = "";
            this.id = undefined;
            this.src = undefined;
            this.srcHistory = [];
            if (e !== undefined) {
                Logger.log(550);
                if (e.block) {
                    Logger.log(552);
                    t.block = e.block;
                    n = t.block.c
                }
                if (e.only_html) {
                    Logger.log(553);
                    o = e.only_html
                }
            } else {
                Logger.error(554, "!options");
                Logger.console("!options")
            }
            var u = function(e) {
                Logger.log(555);
                m(e)
            };
            var d = function(e) {
                Logger.log(556);
                e += "\n";
                m(e)
            };
            this.documentWrite = u;
            this.documentWriteln = d;
            var f = function(e) {
                Logger.log(635);
                var t = [],
                    n, i, r;
                for (n in Advertone.aBlocks)
                    if (Advertone.aBlocks.hasOwnProperty(n)) {
                        r = Advertone.aBlocks[n].c[-1].getElementsByTagName("script");
                        for (i = 0; i < r.length; i++) {
                            if (r[i].getAttribute("src") == e && !r[i].a_load) t.push(r[i])
                        }
                    }
                return t
            };
            var g = function(e) {
                return e
            };
            var h = function(e, t) {
                Logger.log(558);
                var n = document.createElement("div");
                if (typeof e == "object" && e.parentNode) {
                    Logger.log(559);
                    n.appendChild(e)
                } else if (typeof e == "object" && e.length) {
                    Logger.log(560);
                    while (e.length) {
                        n.appendChild(e[0])
                    }
                } else {
                    Logger.log(561);
                    if (Advertone.settings.isIE9) {
                        Logger.log(562);
                        var i = e.split(/\s+src\s*?=/),
                            r = i[0],
                            o;
                        for (o = 1; o < i.length; o++) {
                            if (/<script[^>]*?$/.test(i[o - 1])) r += " _src=" + i[o];
                            else r += " src=" + i[o]
                        }
                        e = r;
                        n.innerHTML = "<span>.</span>" + e;
                        n.removeChild(n.childNodes[0])
                    } else {
                        Logger.log(563);
                        n.innerHTML = e
                    }
                }
                if (!t) {
                    if (!n.innerHTML) {
                        c += e
                    } else {
                        var s = [],
                            a = {};
                        for (var o = 0, u = n.childNodes, d = u.length, f; o < d; ++o) {
                            if (u[o].nodeType == 3) {
                                c += u[o].textContent || u[o].innerText || "";
                                s.push(u[o])
                            } else if (c) {
                                if (l != c) {
                                    l = c;
                                    c = "";
                                    f = h(l, !0);
                                    a[s.length - 1] = f.childNodes;
                                    l = ""
                                }
                            }
                        }
                        for (o = 0, d = s.length; o < d; ++o) {
                            if (a[o]) {
                                for (var g = 0, m = a[o].length; g < m; ++g) {
                                    n.insertBefore(a[o][g], s[o])
                                }
                            }
                        }
                        for (o = 0, d = s.length; o < d; ++o) {
                            n.removeChild(s[o])
                        }
                    }
                }
                return n
            };
            var m = function(e, t) {
                Logger.log(557);
                var n = h(e, t);
                _(n);
                var i = n.childNodes;
                while (i.length) {
                    v(i[0])
                }
            };
            var v = function(e) {
                Logger.log(580);
                if (i) {
                    Logger.log(581);
                    try {
                        i.parentNode.insertBefore(e, i.nextSibling);
                        r = i
                    } catch (t) {
                        Logger.log(582, "!currentNode");
                        Logger.console("inj warning: currentNode removed");
                        try {
                            r.parentNode.insertBefore(e, r.nextSibling)
                        } catch (t) {
                            Logger.error(583, "!previousCurrentNode o_0");
                            Logger.console("inj error: previousCurrentNode removed o_0???");
                            n.appendChild(e)
                        }
                    }
                } else {
                    Logger.log(584);
                    try {
                        n.appendChild(e)
                    } catch (t) {
                        Logger.error(585, "!containerNode o_0");
                        Logger.console("inj error: containerNode removed")
                    }
                }
                i = e
            };

            function p(e) {
                Logger.log(630);
                var t = document.createElement("ins");
                t.setAttribute("fake", "fake");
                t.style.display = "none";
                n.appendChild(t)
            }
            var _ = function(e) {
                Logger.log(570);
                var t = e.getElementsByTagName("script"),
                    n;
                for (n = t.length - 1; n >= 0; n--) {
                    (function() {
                        var e = t[n],
                            i;
                        if (!o) {
                            Logger.log(571);
                            i = document.createComment("Script placeholder");
                            e.parentNode.insertBefore(i, e);
                            s.unshift({
                                placeholder: i,
                                node: e
                            })
                        } else {
                            Logger.console("only_html");
                            Logger.log(572)
                        }
                        e.parentNode.removeChild(e)
                    })()
                }
            };
            var y = function(e) {
                var t = [];
                for (var n = 0; n < e.length; ++n) {
                    t.push({
                        src: e[n].node.src,
                        html: e[n].node.innerHTML
                    })
                }
                return t
            };
            var b = function(e, n) {
                Logger.log(600);
                var r = "restoreScript" + t.id;
                var o = function() {
                    if (c) {
                        l = "";
                        m(c, !0);
                        c = ""
                    }
                    if (e.length) {
                        Logger.log(601);
                        var r = e.shift(),
                            s;
                        i = r.placeholder;
                        if (Advertone.settings.isIE9) {
                            Logger.log(602);
                            s = r.node.getAttribute("_src");
                            if (s) r.node.removeAttribute("_src")
                        } else {
                            Logger.log(603);
                            s = r.node.src
                        }
                        var u = document.createElement("script");
                        for (var d = 0, g = r.node.attributes, h = g.length; d < h; d++) u.setAttribute(g[d].nodeName, g[d].nodeValue);
                        Logger.log(604);
                        if (s) {
                            Logger.log(605);
                            t.src = s;
                            if (Advertone.Gsys.sysSettings[t.block.sid].types[t.block.type].injSH) t.srcHistory.push(s);
                            var v = f(s);
                            if (v.length == 1) {
                                Logger.log(606);
                                e.unshift(r);
                                k(v[0], o);
                                return
                            } else if (v.length > 1) {
                                Logger.error(607, "inj err: bl_scripts.len==" + v.length + ">1");
                                Logger.console("injector kosiyak", v)
                            }
                            Logger.log(608);
                            u.src = s;
                            if (r.node.innerHTML) {
                                u.innerHTML = r.node.innerHTML
                            }
                            k(u, function() {
                                Logger.log(609);
                                u.a_load = true;
                                document.write = t.documentWrite;
                                document.writeln = t.documentWriteln;
                                o();
                                document.write = Advertone.Inj.documentWrite;
                                document.writeln = Advertone.Inj.documentWriteln
                            });
                            r.placeholder.parentNode.insertBefore(u, r.placeholder);
                            a.push(r.placeholder)
                        } else if (r.node.innerHTML) {
                            Logger.log(610);
                            try {
                                Logger.log(611);
                                var p = window.navigator.userAgent,
                                    _ = p.match(/Opera[ \/]+\w+\.\w+/i);
                                if (_) {
                                    Logger.log(612);
                                    _ = p.search(/Version[ \/]+\w+\.\w+/i);
                                    if (_ != -1) {
                                        Logger.log(613);
                                        _ = p.substr(_ + 8);
                                        _ = _.substr(0, _.search(/\./));
                                        if (_ <= 11) {
                                            Logger.log(614, "Opera problem:" + _);
                                            throw "Opera problem!"
                                        }
                                    }
                                }
                                if (Advertone.settings.isIE9) {
                                    Logger.log(615);
                                    throw "Ia-ia"
                                } else {
                                    Logger.log(616);
                                    u.innerHTML = r.node.innerHTML;
                                    if (u.innerHTML != r.node.innerHTML) {
                                        Logger.log(617);
                                        throw "Error"
                                    }
                                }
                                r.placeholder.parentNode.insertBefore(u, r.placeholder);
                                a.push(r.placeholder)
                            } catch (y) {
                                if (r.node.type == "text/javascript") w(r.node.innerHTML, r.placeholder)
                            }
                            o()
                        } else {
                            Logger.log(618);
                            o()
                        }
                    } else {
                        Logger.log(619);
                        n()
                    }
                };
                o()
            };
            var k = function(e, t) {
                function n(e) {
                    if (!Advertone.Detect.isAB()) {
                        Logger.log(627, "AdBlock == " + Advertone.Detect.isAB() + " src == " + this.src);
                        Logger.error(627, e)
                    }
                    Logger.console("Script error!");
                    Logger.console("AdBlock: " + Advertone.Detect.isAB());
                    Logger.console(e);
                    Logger.console(this.src);
                    t()
                }

                function i() {
                    t()
                }

                function r() {
                    if (e.readyState == "loaded" || e.readyState == "complete") {
                        Logger.log(623);
                        t();
                        e.onload = e.onreadystatechange = null
                    }
                }
                Logger.log(620);
                if (e.addEventListener) {
                    Logger.log(621);
                    e.addEventListener("error", n, true);
                    e.addEventListener("load", i, true)
                } else if (e.attachEvent) {
                    Logger.log(622);
                    e.attachEvent("onerror", n, true);
                    e.attachEvent("onload", i, true);
                    e.attachEvent("onreadystatechange", r, true)
                } else {
                    Logger.error(624, "inj err: attach listeners");
                    throw Error("Failed to attach listeners to script.")
                }
            };
            var A = function(e) {
                window.execScript ? execScript(e) : window.eval(e)
            };
            var w = function(e, n) {
                Logger.log(625);
                try {
                    e = e.replace("<!--", "//<!--");
                    e = e.replace("-->", "//-->");
                    A(e)
                } catch (i) {
                    Logger.log(626, t.block.bid + "/" + t.block.tbid);
                    Logger.log(626, e);
                    Logger.error(626, i);
                    Logger.console("Injector error:");
                    Logger.console(i);
                    Logger.console(e);
                    Advertone.timeouts.set("Failed_Script_Load" + t.block.tbid, function() {
                        Advertone.Gsys.checkTScriptDomReady(t.block, 100500)
                    }, 1e3)
                }
            };
            var L = function(e) {
                Logger.log(590);
                return function() {
                    document.write = t.documentWrite;
                    document.writeln = t.documentWriteln;
                    e.apply(this, arguments);
                    Logger.log(592);
                    b(s, function() {
                        S.call()
                    })
                }
            };
            var S = function() {
                Logger.log(594);
                t.finished = true;
                if (t.id !== undefined) {
                    if (Advertone.Inj.del(t.id)) {
                        document.write = Advertone.Inj.documentWrite;
                        document.writeln = Advertone.Inj.documentWriteln
                    }
                }
                Advertone.Gsys.check(t.block)
            };
            this.insert = L(function(e) {
                Logger.log(591);
                u(e)
            });
            this.setContainer = function(e) {
                if (e) {
                    Logger.log(631);
                    n = e
                } else {
                    Logger.error(632, "!container");
                    Logger.console(632)
                }
            };
            var T = function(e) {
                if (e) {
                    Logger.log(633);
                    i = e;
                    n = e.parentNode
                } else {
                    Logger.error(634, "!sibling");
                    Logger.console(632)
                }
            };
            var B = function() {
                return i
            };
            this.setSibling = T;
            this.getSibling = B;
            this.documentWrite = u
        }

        function locat_search(e) {
            return document.location.href.search(e)
        }

        function map(e, t) {
            var n, i = [];
            for (n = 0; n < t.length; n++) i[n] = e(t[n], n);
            return i
        }

        function forEach(e, t) {
            for (var n = 0; n < t.length; n++) e(t[n], n)
        }

        function filter(e, t) {
            var n, i = [];
            for (n = 0; n < t.length; n++)
                if (e(t[n], n)) i.push(t[n]);
            return i
        }

        function deepCopy(e, t) {
            var n = t || (e.constructor === Array ? [] : {}),
                i;
            for (i in e) {
                if (e[i] && typeof e[i] === "object") {
                    n[i] = e[i].constructor === Array ? [] : {};
                    deepCopy(e[i], n[i])
                } else {
                    n[i] = e[i]
                }
            }
            return n
        }

        function getTimeouts(e) {
            return Advertone.aBlocks[e].timeouts
        }

        function stacktrace() {
            var e, t, n, i;
            try {
                throw new AdvertoneError
            } catch (r) {
                e = [];
                if (!r.stacktrace && !(window.opera && r.message) && r.stack) {
                    t = r.stack.split(/\s*\n\s*/);
                    i = t.length;
                    for (n = 0; n < i; n++) e.push(t[n]);
                    e.shift()
                }
            }
            return e
        }

        function refHandler() {
            var e = document.referrer,
                t = {
                    G: [/(\.|\/)google\.\w+/i],
                    Y: [/(\.|\/)yandex\.\w+/i, /(\.|\/)ya\.ru/i]
                },
                n, i;
            for (key in t)
                if (t.hasOwnProperty(key)) {
                    n = t[key];
                    for (i = 0; i < n.length; i++)
                        if (n[i].test(e)) return key
                }
            return null
        }

        function inherit(e, t) {
            function n(e, t) {
                if (!this.hasOwnProperty("__proto__")) this.__proto__ = arguments.callee.prototype;
                this.__proto__ = new e(t[2], t[3], t[4], t[5]);
                this.__proto__.constructor = this;
                this.parent = this.__proto__;
                if (Advertone.settings.isIE10) {
                    for (prop in this.parent) {
                        if (this.parent.hasOwnProperty(prop) && Advertone.t.inArray(IE_prop_black_list, prop) == -1) {
                            this[prop] = this.parent[prop]
                        }
                    }
                }
            }
            if (!n.hasOwnProperty("bind")) e.extend = n;
            else n.bind(e);
            e.extend(t, arguments)
        }

        function AdvertoneError() {
            var e;
            try {
                e = Error.stackTraceLimit
            } catch (t) {}
            Error.stackTraceLimit = Infinity;
            inherit(this, Error);
            Error.stackTraceLimit = e
        }

        function ClickCounter() {
            var e = Advertone.t;
            var t = [],
                n = [],
                i = false,
                r = [],
                o = {},
                s = -1,
                a = true,
                l = Advertone.Detect.Device.isMobile(),
                c = new Advertone.Timeouts;
            var u = {
                latency: 500,
                keyUpLatency: 200,
                refocusLatency: 200,
                clickResolve: 200
            };
            var d = {
                clickLeave: e.randomStr(),
                freeKey: e.randomStr(),
                refocusTime: e.randomStr(),
                blurName: e.randomStr(),
                clickResolveName: e.randomStr()
            };

            function f() {
                a = false;
                c.set(d.clickResolveName, function() {
                    a = true
                }, u.clickResolve)
            }

            function g(e) {
                if (e == -1) return;
                f();
                Logger.console("Clicked!!!");
                if (r[e].tbid && +r[e].tbid > 0) {
                    var t = Advertone.settings.STAT_URL + "/" + r[e].tbid;
                    postData(t)
                }
            }

            function h(o) {
                if (!a) return;
                if (o == -1) return;
                var s = r[o],
                    c = l && (i && e.inArray(t, o) != -1) || !l && (Advertone.Gsys.sysSettings[s.sid].types[s.type].iframe && e.inArray(n, o) != -1 || e.inArray(n, o) != -1 && e.inArray(t, o) != -1);
                if (c) g(o)
            }

            function m(n) {
                return function(i) {
                    if (e.inArray(t, n) == -1) {
                        t.push(n)
                    }
                    c.set(d.clickLeave + n, function() {
                        var i = e.inArray(t, n);
                        if (i != -1) {
                            t.splice(i, 1)
                        }
                    }, u.latency);
                    h(n)
                }
            }

            function v(e) {
                return function(t) {
                    s = e
                }
            }

            function p(e) {
                return function(e) {
                    s = -1
                }
            }

            function _() {
                return function(t) {
                    function a(t) {
                        if (t != -1) {
                            c.set(d.blurName, function() {
                                var i = e.inArray(n, t);
                                if (i != -1) {
                                    n.splice(i, 1)
                                }
                            }, u.latency)
                        } else {
                            if (r.length) t = 0;
                            c.set(d.blurName, function() {
                                i = false
                            }, u.latency)
                        }
                        var o = r[t];
                        if (o) {
                            c.set(d.refocusTime, function() {
                                o.c.tabIndex = 1;
                                o.c.focus();
                                o.c.tabIndex = ""
                            }, u.refocusLatency)
                        }
                    }
                    if (l) {
                        i = true;
                        a(-1);
                        for (var f = 0; f < r.length; ++f) {
                            h(f)
                        }
                    }
                    if (s == -1) return;
                    var g = r[s];
                    var m = o[17],
                        v = o[18],
                        p = o[91],
                        _ = o[27],
                        y = o[9],
                        b = o[83],
                        k = o[46],
                        A = o[87],
                        w = !(m && (y || v && k || _ || b || A) || v || p || y);
                    if (w) {
                        a(s);
                        if (e.inArray(n, s) == -1) {
                            n.push(s)
                        }
                        h(s)
                    }
                }
            }

            function y() {
                return function(e) {
                    o[e.keyCode] = true
                }
            }

            function b() {
                return function(e) {
                    c.set(d.freeKey + e.keyCode, function() {
                        o[e.keyCode] = false
                    }, u.keyUpLatency)
                }
            }
            this.registerBlock = function(t) {
                if (e.inArray(r, t) == -1) {
                    var n = r.length;
                    r.push(t);
                    e.bindEvent(t.c, "click", m(n));
                    e.bindEvent(t.c, "mouseover", v(n));
                    e.bindEvent(t.c, "mouseout", p(n))
                }
            };
            e.bindEvent(window, "blur", _());
            e.bindEvent(window, "keydown", y());
            e.bindEvent(window, "keyup", b())
        }
        Logger.console("Advertone starts!");
        setTimeout(function() {
            postData(AdvertoneGlobalSettings.STAT_URL)
        }, 0);
        Logger.log(200);
        Advertone = {};
        Advertone.settings = {
            BASE_URL: AdvertoneGlobalSettings.BASE_URL,
            STATIC_URL: AdvertoneGlobalSettings.STATIC_URL,
            STAT_URL: AdvertoneGlobalSettings.STAT_URL,
            script_id_prefix: classNames.script_id_prefix,
            container_class_prefix: classNames.container_class_prefix,
            main_div_id: classNames.main_div_id,
            div_spinlock: classNames.div_spinlock,
            div_mobile: classNames.div_mobile,
            block_class: classNames.block_class,
            data_ablock: classNames.data_ablock,
            data_loaded: classNames.data_loaded,
            data_group: classNames.data_group,
            head: AdvertoneGlobalSettings.head,
            body: document.getElementsByTagName("body")[0],
            start: (new Date).getTime(),
            ALIAS: {
                gI: "getElementById",
                gTN: "getElementsByTagName",
                pN: "parentNode",
                rC: "removeChild",
                aC: "appendChild",
                hA: "hasAttribute",
                gA: "getAttribute",
                sA: "setAttribute",
                iO: "indexOf",
                iB: "insertBefore",
                cE: "createElement",
                tj: "text/javascript",
                tC: "textContent",
                onrSc: "onreadystatechange",
                rS: "readyState"
            },
            isIE: !1,
            isIE8: !1,
            isIE9: !1,
            isIE10: !1,
            doc_wr: document.write,
            doc_wrln: document.writeln,
            dom_ready: !1,
            animate: !1,
            cr_br_prefix: "",
            SCRIPTS_LOADED: {},
            STYLES_INSERT: {},
            ROTATION_TYPES: {
                STATIC: 0,
                SLIDER: 1
            }
        };
        Logger.log(203);
        Advertone.getcode_count = 0;
        Advertone.Gsys = new GlobalSys;
        Logger.log(206);
        Advertone.Inj = new AdvertoneInjector;
        Advertone.timoutsRefs = [];
        Logger.log(210);
        Advertone.Animation = new BaseAnimation;
        Advertone.aBlocks = {};
        Logger.log(215);
        var A_s = Advertone.settings,
            A_A = A_s.ALIAS,
            script_node, match, i;
        Logger.log(211);
        Advertone.t = {
            inArray: inArray,
            randomStr: randomStr,
            objUpdate: function(e, t) {
                var n;
                for (n in t)
                    if (t.hasOwnProperty(n)) e[n] = t[n]
            },
            objLength: function(e) {
                var t, n = 0;
                if (typeof e.length != "undefined") {
                    n = e.length
                } else if (typeof Object.keys != "undefined") {
                    n = Object.keys(e).length
                } else {
                    for (t in e)
                        if (e.hasOwnProperty(t)) n++
                }
                return n
            },
            bindEvent: function(e, t, n) {
                var i;
                if (typeof e.addEventListener != "undefined") {
                    e.addEventListener(t, n, false)
                } else if (e.attachEvent) {
                    e.attachEvent("on" + t, function() {
                        n.call(e)
                    })
                } else {
                    i = e["on" + t];
                    e["on" + t] = function() {
                        if (typeof i == "function") i();
                        n()
                    }
                }
            },
            unbindEvent: function(e, t, n) {
                var i;
                if (typeof e.removeEventHandler != "undefined") {
                    e.removeEventHandler(t, n, false)
                } else if (e.detachEvent) {
                    e.detachEvent("on" + t, n)
                }
            },
            insertFirst: function(e, t) {
                t.insertBefore(e, t.firstChild)
            },
            insertAfter: function(e, t) {
                while (t.nodeType != 1) t = t.nextSibling;
                return t.parentNode.insertBefore(e, t.nextSibling)
            },
            loadScript: function(e, t, n) {
                var i = this,
                    r = Advertone.settings,
                    o = r.SCRIPTS_LOADED,
                    s;
                if (o[e] && o[e].status !== undefined) return;
                s = document.createElement("script");
                o[e] = {
                    status: undefined,
                    link: s
                };
                s.async = true;
                s.src = r.STATIC_URL + "/js/" + e + ".js?a=" + Math.random();
                s.type = "text/javascript";
                if (n)
                    for (atr in n)
                        if (n.hasOwnProperty(atr)) s.setAttribute(atr, n(atr));
                i.bindEvent(s, "load", function() {
                    o[e].status = true;
                    if (t) t()
                });
                i.bindEvent(s, "error", function() {
                    o[e].status = false
                });
                r.head.appendChild(s)
            },
            checkNativeCode: function(e) {
                if (!e || !e.toString) return !1;
                var t = e.toString();
                return /\[native code\]/.test(t) || /\/\* source code not available \*\//.test(t)
            },
            getElementsByClass: function(e, t) {
                var n = this,
                    i;
                if (t && n.checkNativeCode(t.getElementsByClassName)) {
                    i = t.getElementsByClassName(e)
                } else if (n.checkNativeCode(document.getElementsByClassName)) {
                    i = document.getElementsByClassName(e)
                } else {
                    var t = t || document,
                        r = t.getElementsByTagName("*"),
                        o = r.length,
                        s = e.split(/\s+/),
                        a = s.length,
                        l, c;
                    i = [];
                    for (l = 0; l < o; ++l) {
                        for (c = 0; c < a; ++c) {
                            if (r[l].className.search("\\b" + s[c] + "\\b") != -1) {
                                i.push(r[l]);
                                break
                            }
                        }
                    }
                }
                return Array.prototype.slice.call(i || [])
            },
            createStyle: function(e, t, n, i) {
                var r = this,
                    o = Advertone.settings,
                    s = o.STYLES_INSERT,
                    a, l;
                if (n && s[n]) return;
                a = document.createElement("style");
                a.type = "text/css";
                if (n) {
                    a.id = n;
                    s[n] = a
                }
                if (i) a.setAttribute("class", i);
                if (a.styleSheet) a.styleSheet.cssText = e;
                else {
                    l = document.createTextNode(e);
                    a.appendChild(l)
                }
                if (!t) t = document.getElementsByTagName("head")[0];
                r.insertFirst(a, t);
                return a
            },
            replaceStyle: function(e, t, n, i) {
                var r = this,
                    o = Advertone.settings,
                    s = o.STYLES_INSERT,
                    a;
                if (n && s[n]) {
                    a = s[n];
                    s[n] = undefined;
                    r.createStyle(e, t, n, i);
                    a.parentNode.removeChild(a)
                } else {
                    r.createStyle(e, t, n, i)
                }
            },
            create_container: function(e, t, n) {
                var i = document.createElement("div");
                if (t) i.style.display = "block";
                else i.style.display = "none";
                if (!n) i.style["overflow"] = "hidden";
                i.style["position"] = "relative";
                return i
            },
            killTimeouts: function() {
                for (var e = 0; e < Advertone.timoutsRefs.length; e++) Advertone.timoutsRefs[e].clear_all()
            },
            killContainers: function() {
                var e = Advertone.aBlocks,
                    t, n;
                for (n in e) {
                    t = e[n].c["outest_outest"];
                    if (t && t.parentNode) {
                        t.parentNode.removeChild(t)
                    }
                }
            },
            killStyle: function(e) {
                var t = Advertone.settings.STYLES_INSERT[e];
                if (t) {
                    t.parentNode.removeChild(t);
                    Advertone.settings.STYLES_INSERT[e] = undefined
                }
            },
            deepCopy: deepCopy,
            forEach: function(e, t) {
                if (t)
                    for (var n = 0; n < t.length; n++) e(t[n], n)
            }
        };
        var A_t = Advertone.t;
        var onSuccessCallback = function(e, t, n) {
            Advertone.t.forEach(function(e) {
                Advertone.Gsys.setSystem(e)
            }, e);
            Advertone.t.forEach(function(e, t) {
                Advertone.aBlocks[e].onSuccess(n[t])
            }, t)
        };
        window.theObject.callBack = onSuccessCallback;
        var initAnimation = function() {
            var e = window.theObject.Logger,
                t = Advertone.settings,
                n = Advertone.t,
                i = t.isIE && t.isIE <= 10,
                r = ["constructor", "__proto__", "parent", "init", "stopAll"],
                o;

            function s(e, t) {
                function i(e, t) {
                    if (!this.hasOwnProperty("__proto__")) this.__proto__ = arguments.callee.prototype;
                    this.__proto__ = new e(t[2], t[3], t[4], t[5]);
                    this.__proto__.constructor = this;
                    this.parent = this.__proto__;
                    if (Advertone.settings.isIE10) {
                        for (prop in this.parent) {
                            if (this.parent.hasOwnProperty(prop) && n.inArray(r, prop) == -1) {
                                this[prop] = this.parent[prop]
                            }
                        }
                    }
                }
                if (!i.hasOwnProperty("bind")) e.extend = i;
                else i.bind(e);
                e.extend(t, arguments)
            }
            var a = function() {
                s(this, BaseStates);
                this.prepare = 1;
                this.ready = 2;
                this.animating = 3;
                this.restoring = 4
            };
            var l = ["noopAnimation", "slider", "slider1", "dissolve"];
            var c = function() {
                var e = this;
                this.tools = new w;
                this.flags = {};
                this.alwaysRestyle = false;
                this.prf = "";
                this.isNotAccurateAnimation = function(e) {
                    return n.inArray(l, e.transition.library.name) == -1
                };
                this.baseAsyncFunc = function(e, t, n, i) {
                    try {
                        e.state.timeouts.set(this.prf + n, t, this[i](e) || 0)
                    } catch (r) {
                        e.fail(r.toString(), r.stack)
                    }
                };
                this._init_settings = function(e) {
                    return e
                };

                function t(e, t) {
                    var n = e.nowAnimation,
                        i = e.ABlock.c.outest,
                        r, o = e.state,
                        s = t[0].toUpperCase() + t.substr(1),
                        a = false;
                    if (!i.style[t]) {
                        i.style[t] = o["g" + s].toString()
                    }
                    i.style[t] = i["client" + s] + "px";
                    r = new DimensionObject(i.style[t]);
                    if (!r.equal(o[t])) {
                        o[t] = r;
                        a = true
                    }
                    if (n.unloading) {
                        n.unloading.c.style[t] = i.style[t]
                    }
                    n.loading.c.style[t] = i.style[t];
                    return a
                }

                function i(e, t) {
                    var n = e.nowAnimation,
                        i = e.ABlock.c.outest,
                        r, o = e.state,
                        s = t[0].toUpperCase() + t.substr(1),
                        a = false;
                    i.style[t] = i["client" + s] + "px";
                    r = new DimensionObject(i.style[t]);
                    if (!r.equal(o[t])) {
                        o[t] = r;
                        a = true
                    }
                    if (n.unloading) {
                        n.unloading.c.style[t] = i.style[t]
                    }
                    n.loading.c.style[t] = i.style[t];
                    return a
                }
                this._freezeOuter = function(e) {
                    var n = e.nowAnimation,
                        r = e.ABlock.c.outest,
                        o, s, a = e.state,
                        l = false;
                    if (a.gWidth.measure == "auto") {
                        l |= i(e, "width")
                    } else {
                        l |= t(e, "width")
                    }
                    if (a.gHeight.measure == "auto") {
                        l |= i(e, "height")
                    } else {
                        l |= t(e, "height")
                    }
                    r.style.overflow = "";
                    if (l) {
                        e.resize()
                    }
                };

                function r(e, t) {
                    var n = e.nowAnimation,
                        i = e.ABlock.c.outest,
                        r = e.state,
                        o, s = t[0].toUpperCase() + t.substr(1),
                        a = false;
                    n.loading.c.style[t] = "";
                    if (n.unloading) {
                        n.unloading.c.style[t] = ""
                    }
                    i.style[t] = r["g" + s].toString();
                    o = new DimensionObject(i["client" + s] + "px");
                    if (!o.equal(r[t])) {
                        r[t] = o;
                        a = true
                    }
                    return a
                }

                function o(e, t) {
                    var n = e.nowAnimation,
                        i = e.ABlock.c.outest,
                        r = e.state,
                        o, s = t[0].toUpperCase() + t.substr(1),
                        a = false;
                    n.loading.c.style[t] = "";
                    if (n.unloading) {
                        n.unloading.c.style[t] = ""
                    }
                    i.style["min" + s] = r[t].max(new DimensionObject(i.style["min" + s])).toString();
                    i.style[t] = "";
                    o = new DimensionObject(i["client" + s] + "px");
                    if (!o.equal(r[t])) {
                        r[t] = o;
                        a = true
                    }
                    return a
                }
                this._freeOuter = function(e) {
                    var t = e.nowAnimation,
                        n = e.ABlock.c.outest,
                        i = e.state,
                        s = false;
                    if (i.gWidth.measure == "auto") {
                        s |= o(e, "width")
                    } else {
                        s |= r(e, "width")
                    }
                    if (i.gHeight.measure == "auto") {
                        s |= o(e, "height")
                    } else {
                        s |= r(e, "height")
                    }
                    n.style.overflow = "hidden";
                    if (s) {
                        e.resize()
                    }
                };
                this._freeBlockDisplay = function(e) {
                    e.nowAnimation.loading.c.style.display = "";
                    e.nowAnimation.unloading.c.style.display = ""
                };
                this._fixBlockDisplay = function(e) {
                    e.nowAnimation.unloading.c.style.display = "none";
                    e.nowAnimation.loading.c.style.display = "block"
                };
                this._clearPositions = function(e) {
                    e.nowAnimation.unloading.c.style.position = "";
                    e.nowAnimation.loading.c.style.position = ""
                };
                this._restorePositions = function(e) {
                    e.nowAnimation.unloading.c.style.position = "relative";
                    e.nowAnimation.loading.c.style.position = "relative"
                };
                this.getPrf = function(e) {
                    return e.ABlock.prf + "_" + this.prf + "__"
                }
            };
            var u = function(e, t) {
                s(this, c);
                this.flags = {
                    inStyle: 0,
                    styled: 1,
                    warped: 2,
                    inWarp: 3,
                    inUnwarp: 4,
                    need_resize: 5
                };
                this.name = e;
                this.type = "transition";
                this.prf = this.type + "_" + e;
                this.needResize = false;
                this.getWarpTime = function(e) {
                    return 0
                };
                this.getStyleTime = function(e) {
                    return 0
                };
                this._warpSync = function(e) {};
                this._warpAsync = function(e, t) {
                    this.baseAsyncFunc(e, t, "WarpAsyncWaitSuccess", "_warpSync")
                };
                this._styleSync = function(e) {};
                this._styleAsync = function(e, t) {
                    this.baseAsyncFunc(e, t, "StyleAsyncWaitSuccess", "_styleSync")
                };
                this._playSync = function(e) {
                    if (e.nowAnimation.unloading) e.nowAnimation.unloading.c.style.display = "none";
                    e.nowAnimation.loading.c.style.display = "block"
                };
                this._playAsync = function(e, t) {
                    this.baseAsyncFunc(e, t, "PlayAsyncWaitSuccess", "_playSync")
                };
                this._unwarpSync = function(e) {};
                this._unwarpAsync = function(e, t) {
                    this.baseAsyncFunc(e, t, "UnwarpAsyncWaitSuccess", "_unwarpSync")
                };
                this._onresize = function(e) {
                    if (this.needResize) e.transition.state.needRestyle = true
                };
                this.onresize = function(e) {
                    var t = e.transition.state;
                    if (t.flags.checkAny(this.flags.styled, this.flags.inStyle)) {
                        this._onresize(e)
                    }
                };
                this.warpAsync = function(e, t) {
                    var n = this;
                    var i = e.transition.state,
                        r = e.state.timeouts;
                    if (!i.flags.check(this.flags.styled) || i.settingsChanged) {
                        i.flags.drop(this.flags.warped);
                        r.set(this.prf + "NeedStyles", function() {
                            n.styleAsync(e, function() {
                                n.warpAsync(e, t)
                            })
                        }, 0);
                        return
                    }
                    if (i.flags.check(this.flags.warped)) {
                        r.set(this.prf + "WarpComplete", t, 0);
                        return
                    }
                    r.set(this.prf + "WarpInAction", function() {
                        n._freezeOuter(e);
                        i.flags.set(n.flags.inUnwarp);
                        n._warpAsync(e, function() {
                            i.flags.drop(n.flags.inUnwarp);
                            i.flags.set(n.flags.warped);
                            t()
                        })
                    }, 0)
                };
                this.styleAsync = function(e, t) {
                    var n = this;
                    var i = e.transition.state,
                        r = e.state,
                        o = e.transition.outer,
                        s = r.timeouts;
                    if (i.flags.check(this.flags.styled) && !i.needRestyle && !i.settingsChanged) {
                        s.set(this.prf + "StyleComplete", t, 0);
                        return
                    }
                    s.set(this.prf + "StyleInAction", function() {
                        i.flags.set(n.flags.inStyle);
                        n._styleAsync(e, function() {
                            i.flags.drop(n.flags.inStyle);
                            i.flags.set(n.flags.styled);
                            if (i.needRestyle) {
                                n.tools.guarantyCSS(n.getPrf(e), o)
                            }
                            i.needRestyle = n.alwaysRestyle;
                            i.settingsChanged = false;
                            t()
                        })
                    }, 0)
                };
                this.getPrepareTime = function(e) {
                    var t = 0;
                    if (!e.transition.state.flags.check(this.flags.styled)) t = this.getStyleTime(e);
                    return this.getWarpTime(e) + t
                };
                this.prepareAsync = this.warpAsync;
                this.playAsync = function(e, t) {
                    var n = this;
                    if (e.transition.state.flags.checkAll(this.flags.styled, this.flags.warped)) {
                        e.state.timeouts.set(this.prf + "Play", function() {
                            n._playAsync(e, t)
                        });
                        return
                    }
                    e.fail("There was try to run unready animation!")
                };
                this.unwarpAsync = function(e, t) {
                    var n = this;
                    var i = e.state.timeouts,
                        r = e.transition.state;
                    if (!r.flags.check(this.flags.warped)) {
                        i.set(this.prf + "UnwarpComplete", t, 0);
                        return
                    }
                    i.set(this.prf + "Unwarp", function() {
                        r.flags.set(n.flags.inUnwarp);
                        n._unwarpAsync(e, function() {
                            n._freeOuter(e);
                            r.flags.drop(n.flags.inUnwarp);
                            r.flags.drop(n.flags.warped);
                            if (r.needRestyle) r.flags.drop(n.flags.styled);
                            t()
                        })
                    }, 0)
                }
            };
            var d = function(e) {
                s(this, u, e);
                this.name = e;
                this._init_settings = function(e) {
                    return this.tools.initialize(e, {
                        duration: 1e3,
                        d: 0,
                        reversable: true
                    }, ["duration"])
                };
                this.getStyleTime = function(e) {
                    return 10
                };
                this.getWarpTime = function(e) {
                    return 10
                };
                var t = ["horizontal", "vertical"];
                var n = ["forward", "backward"];

                function i(e, i) {
                    var r = {},
                        o = ["Y", "X"][e],
                        s = [1, -1];
                    dirs = i.transition.settings.reversable ? 2 : 1;
                    for (var a = 0; a < dirs; ++a) {
                        r["flip_" + t[e] + "_front_" + n[a]] = {
                            "0%": {
                                transform: {
                                    value: "rotate" + o + "(0deg)",
                                    cr_br: true
                                },
                                opacity: {
                                    value: 1
                                }
                            },
                            "50%": {
                                opacity: {
                                    value: 1
                                }
                            },
                            "51%": {
                                opacity: {
                                    value: 0
                                }
                            },
                            "100%": {
                                transform: {
                                    value: "rotate" + o + "(" + s[a] * 180 + "deg)",
                                    cr_br: true
                                },
                                opacity: {
                                    value: 0
                                }
                            }
                        };
                        r["flip_" + t[e] + "_back_" + n[a]] = {
                            "0%": {
                                transform: {
                                    value: "rotate" + o + "(" + s[a] * -180 + "deg)",
                                    cr_br: true
                                }
                            },
                            "100%": {
                                transform: {
                                    value: "rotate" + o + "(0deg)",
                                    cr_br: true
                                }
                            }
                        }
                    }
                    return r
                }
                this._styleSync = function(e) {
                    var n = e.transition.settings,
                        r = e.transition.outer,
                        o = e.state.width,
                        s = e.state.height;
                    r.keyframes = {};
                    if (n.d == "r")
                        for (var a = 0; a < t.length; ++a) Advertone.t.objUpdate(r.keyframes, i(a, e));
                    else r.keyframes = i(n.d, e);
                    r.css = {
                        ".flipper": {
                            "transform-style": {
                                value: "preserve-3d",
                                cr_br: true
                            },
                            perspective: {
                                value: "1000px",
                                cr_br: true
                            }
                        },
                        ".front,.back": {
                            "backface-visibility": {
                                value: "hidden",
                                cr_br: true
                            },
                            position: {
                                value: "absolute"
                            },
                            top: {
                                value: "0"
                            },
                            left: {
                                value: "0"
                            },
                            "animation-fill-mode": {
                                value: "both",
                                cr_br: true
                            },
                            "animation-duration": {
                                value: n.duration + "ms",
                                cr_br: true
                            },
                            "animation-timing-function": {
                                value: "linear",
                                cr_br: true
                            }
                        },
                        ".flipper .front": {
                            "z-index": {
                                value: "2"
                            }
                        },
                        ".flipper.horizontal .back": {
                            transform: {
                                value: "rotateY(180deg)",
                                cr_br: true
                            }
                        },
                        ".flipper.vertical .back": {
                            transform: {
                                value: "rotateX(180deg)",
                                cr_br: true
                            }
                        },
                        ".vertical.forward.flip .back": {
                            "animation-name": {
                                value: "flip_vertical_back_forward",
                                cr_br: true
                            }
                        },
                        ".vertical.forward.flip .front": {
                            "animation-name": {
                                value: "flip_vertical_front_forward",
                                cr_br: true
                            }
                        },
                        ".horizontal.forward.flip .back": {
                            "animation-name": {
                                value: "flip_horizontal_back_forward",
                                cr_br: true
                            }
                        },
                        ".horizontal.forward.flip .front": {
                            "animation-name": {
                                value: "flip_horizontal_front_forward",
                                cr_br: true
                            }
                        },
                        ".vertical.backward.flip .back": {
                            "animation-name": {
                                value: "flip_vertical_back_backward",
                                cr_br: true
                            }
                        },
                        ".vertical.backward.flip .front": {
                            "animation-name": {
                                value: "flip_vertical_front_backward",
                                cr_br: true
                            }
                        },
                        ".horizontal.backward.flip .back": {
                            "animation-name": {
                                value: "flip_horizontal_back_backward",
                                cr_br: true
                            }
                        },
                        ".horizontal.backward.flip .front": {
                            "animation-name": {
                                value: "flip_horizontal_front_backward",
                                cr_br: true
                            }
                        }
                    }
                };
                this._warpSync = function(e) {
                    var t = e.transition.settings,
                        n = e.transition.inner,
                        i = e.ABlock.c,
                        r = e.nowAnimation.loading.c,
                        o = e.nowAnimation.unloading.c;
                    n.d = t.d == "r" ? this.tools.getRandomInt(0, 1) : +t.d;
                    n.forward = this.tools.getAnimationDirection(e);
                    this.tools.getClassList(i[-1]).add(this.getPrf(e) + "flipper");
                    this._clearPositions(e);
                    this.tools.getClassList(o).add(this.getPrf(e) + "front");
                    this.tools.getClassList(r).add(this.getPrf(e) + "back");
                    this._freeBlockDisplay(e);
                    if (n.d) {
                        this.tools.getClassList(i[-1]).add(this.getPrf(e) + "vertical")
                    } else {
                        this.tools.getClassList(i[-1]).add(this.getPrf(e) + "horizontal")
                    }
                    if (n.forward) {
                        this.tools.getClassList(i[-1]).add(this.getPrf(e) + "forward")
                    } else {
                        this.tools.getClassList(i[-1]).add(this.getPrf(e) + "backward")
                    }
                };
                this._playSync = function(e) {
                    this.tools.getClassList(e.ABlock.c[-1]).add(this.getPrf(e) + "flip");
                    return e.transition.settings.duration
                };
                this._unwarpSync = function(e) {
                    var t = e.transition.settings,
                        n = e.transition.inner,
                        i = e.ABlock.c,
                        r = e.nowAnimation.loading.c,
                        o = e.nowAnimation.unloading.c;
                    this._fixBlockDisplay(e);
                    this._restorePositions(e);
                    this.tools.getClassList(i[-1]).remove(this.getPrf(e) + "flipper");
                    if (n.d) {
                        this.tools.getClassList(i[-1]).remove(this.getPrf(e) + "vertical")
                    } else {
                        this.tools.getClassList(i[-1]).remove(this.getPrf(e) + "horizontal")
                    }
                    if (n.forward) {
                        this.tools.getClassList(i[-1]).remove(this.getPrf(e) + "forward")
                    } else {
                        this.tools.getClassList(i[-1]).remove(this.getPrf(e) + "backward")
                    }
                    this.tools.getClassList(i[-1]).remove(this.getPrf(e) + "flip");
                    this.tools.getClassList(o).remove(this.getPrf(e) + "front");
                    this.tools.getClassList(r).remove(this.getPrf(e) + "back")
                }
            };
            var f = function(e, t) {
                s(this, u, e);
                this.name = e;
                this.needResize = true;
                this._init_settings = function(e) {
                    var t = this.tools.initialize(e, {
                        duration: 1e3,
                        d: 0,
                        reversable: true
                    }, ["duration"]);
                    return t
                };
                this.getStyleTime = function(e) {
                    return 10
                };
                this.getWarpTime = function(e) {
                    return 10
                };
                var n = ["up", "down", "left", "right"];

                function i(e, t) {
                    var n = {
                        "100%": {
                            transform: {
                                value: "translate(0, 0)",
                                cr_br: true
                            }
                        }
                    };
                    switch (+t) {
                        case 0:
                            n["0%"] = {
                                transform: {
                                    value: "translate(0, " + e.state.height.toString() + ")",
                                    cr_br: true
                                }
                            };
                            break;
                        case 1:
                            n["0%"] = {
                                transform: {
                                    value: "translate(0, -" + e.state.height.toString() + ")",
                                    cr_br: true
                                }
                            };
                            break;
                        case 2:
                            n["0%"] = {
                                transform: {
                                    value: "translate(" + e.state.width.toString() + ", 0)",
                                    cr_br: true
                                }
                            };
                            break;
                        case 3:
                            n["0%"] = {
                                transform: {
                                    value: "translate(-" + e.state.width.toString() + ", 0)",
                                    cr_br: true
                                }
                            };
                            break;
                            throw "Slider получил некорректное направление: " + t
                    }
                    return n
                }

                function r(e) {
                    var t = {};
                    t[".animate." + n[e] + " .front"] = {
                        "animation-name": {
                            value: "slide_in_" + n[e],
                            cr_br: true
                        }
                    };
                    return t
                }

                function o(e, t) {
                    var n = {
                        "0%": {
                            transform: {
                                value: "translate(0, 0)",
                                cr_br: true
                            }
                        }
                    };
                    switch (+t) {
                        case 0:
                            n["100%"] = {
                                transform: {
                                    value: "translate(0, -" + e.state.height.toString() + ")",
                                    cr_br: true
                                }
                            };
                            break;
                        case 1:
                            n["100%"] = {
                                transform: {
                                    value: "translate(0, " + e.state.height.toString() + ")",
                                    cr_br: true
                                }
                            };
                            break;
                        case 2:
                            n["100%"] = {
                                transform: {
                                    value: "translate(-" + e.state.width.toString() + ", 0)",
                                    cr_br: true
                                }
                            };
                            break;
                        case 3:
                            n["100%"] = {
                                transform: {
                                    value: "translate(" + e.state.width.toString() + ", 0)",
                                    cr_br: true
                                }
                            };
                            break;
                            throw "Slider получил некорректное направление: " + t
                    }
                    return n
                }

                function a(e) {
                    var t = {};
                    t[".animate." + n[e] + " .back"] = {
                        "animation-name": {
                            value: "slide_out_" + n[e],
                            cr_br: true
                        }
                    };
                    return t
                }
                this._styleSync = function(e) {
                    var s = e.transition.settings,
                        l = e.transition.outer;
                    l.keyframes = {};
                    l.css = {
                        ".front": {
                            "animation-fill-mode": {
                                value: "both",
                                cr_br: true
                            },
                            "animation-timing-function": {
                                value: "ease-in-out",
                                cr_br: true
                            },
                            "animation-duration": {
                                value: e.transition.settings.duration + "ms",
                                cr_br: true
                            },
                            "z-index": {
                                value: "2"
                            },
                            position: {
                                value: "absolute"
                            },
                            opacity: {
                                value: 0
                            },
                            left: {
                                value: "0"
                            },
                            display: {
                                value: "block"
                            }
                        },
                        ".back": {
                            "animation-fill-mode": {
                                value: "both",
                                cr_br: true
                            },
                            "animation-timing-function": {
                                value: "ease-in-out",
                                cr_br: true
                            },
                            "animation-duration": {
                                value: e.transition.settings.duration + "ms",
                                cr_br: true
                            },
                            "z-index": {
                                value: "-2"
                            },
                            position: {
                                value: "absolute"
                            },
                            top: {
                                value: "0"
                            },
                            left: {
                                value: "0"
                            },
                            display: {
                                value: "block"
                            }
                        },
                        ".slider_container": {
                            "animation-timing-function": {
                                value: "ease-in-out",
                                cr_br: true
                            },
                            "animation-duration": {
                                value: s.duration + "ms",
                                cr_br: true
                            }
                        },
                        ".animate .front": {
                            top: {
                                value: 0
                            },
                            opacity: {
                                value: 1
                            }
                        }
                    };
                    if (s.d == "r" || s.reversable) {
                        for (var c = 0; c < n.length; ++c) {
                            l.keyframes["slide_in_" + n[c]] = i(e, c);
                            Advertone.t.objUpdate(l.css, r(c));
                            if (t) {
                                l.keyframes["slide_out_" + n[c]] = o(e, c);
                                Advertone.t.objUpdate(l.css, a(c))
                            }
                        }
                    } else {
                        l.keyframes["slide_in_" + n[s.d]] = i(e, s.d);
                        Advertone.t.objUpdate(l.css, r(s.d));
                        if (t) {
                            l.keyframes["slide_out_" + n[s.d]] = o(e, s.d);
                            Advertone.t.objUpdate(l.css, a(s.d))
                        }
                    }
                };
                this._warpSync = function(e) {
                    var t = e.transition.settings,
                        i = e.transition.inner,
                        r = e.ABlock.c,
                        o = e.nowAnimation.loading.c,
                        s = e.nowAnimation.unloading.c;
                    i.d = t.d == "r" ? this.tools.getRandomInt(0, n.length - 1) : t.reversable ? t.d ^ !this.tools.getAnimationDirection(e) : t.d;
                    this._clearPositions(e);
                    this.tools.getClassList(o).add(this.getPrf(e) + "front");
                    this.tools.getClassList(s).add(this.getPrf(e) + "back");
                    r[-1].style.position = "";
                    this.tools.getClassList(r[-1]).add(this.getPrf(e) + "slider_container");
                    i.overflow = r.outest.style.overflow;
                    r.outest.style.overflow = "hidden";
                    this._freeBlockDisplay(e);
                    this.tools.getClassList(r[-1]).add(this.getPrf(e) + n[i.d])
                };
                this._playSync = function(e) {
                    this.tools.getClassList(e.ABlock.c[-1]).add(this.getPrf(e) + "animate");
                    return e.transition.settings.duration
                };
                this._unwarpSync = function(e) {
                    var t = e.transition.inner,
                        i = e.ABlock.c,
                        r = e.nowAnimation.loading.c,
                        o = e.nowAnimation.unloading.c;
                    this._fixBlockDisplay(e);
                    i.outest.style.overflow = t.overflow;
                    this._restorePositions(e);
                    this.tools.getClassList(r).remove(this.getPrf(e) + "front");
                    this.tools.getClassList(o).remove(this.getPrf(e) + "back");
                    this.tools.getClassList(i[-1]).remove(this.getPrf(e) + "slider_container");
                    i[-1].style.position = "relative";
                    this.tools.getClassList(i[-1]).remove(this.getPrf(e) + n[t.d]);
                    this.tools.getClassList(i[-1]).remove(this.getPrf(e) + "animate")
                }
            };
            var g = function(e) {
                s(this, u, e);
                this.name = e;
                this._init_settings = function(e) {
                    return this.tools.initialize(e, {
                        duration: 1e3
                    }, ["duration"])
                };
                this.getStyleTime = function(e) {
                    return 10
                };
                this.getWarpTime = function(e) {
                    return 5
                };
                this._styleSync = function(e) {
                    var t = e.transition.settings,
                        n = e.transition.outer;
                    n.keyframes = {
                        disssolve_in: {
                            from: {
                                opacity: {
                                    value: 0
                                }
                            },
                            to: {
                                opacity: {
                                    value: 1
                                }
                            }
                        },
                        disssolve_out: {
                            from: {
                                opacity: {
                                    value: 1
                                }
                            },
                            to: {
                                opacity: {
                                    value: 0
                                }
                            }
                        }
                    };
                    n.css = {
                        ".dissolve_in": {
                            "z-index": {
                                value: "0"
                            },
                            position: {
                                value: "absolute"
                            },
                            top: {
                                value: "0"
                            },
                            left: {
                                value: "0"
                            },
                            display: {
                                value: "block"
                            },
                            opacity: {
                                value: 0
                            }
                        },
                        ".dissolve_out": {
                            "z-index": {
                                value: "2"
                            },
                            position: {
                                value: "absolute"
                            },
                            top: {
                                value: "0"
                            },
                            left: {
                                value: "0"
                            },
                            display: {
                                value: "block"
                            }
                        },
                        ".animate_dissolve .dissolve_in": {
                            "animation-name": {
                                value: "disssolve_in",
                                cr_br: true
                            }
                        },
                        ".animate_dissolve .dissolve_out": {
                            "animation-name": {
                                value: "disssolve_out",
                                cr_br: true
                            }
                        },
                        ".animate_dissolve>*": {
                            "animation-fill-mode": {
                                value: "both",
                                cr_br: true
                            },
                            "animation-timing-function": {
                                value: "linear",
                                cr_br: true
                            },
                            "animation-duration": {
                                value: t.duration + "ms",
                                cr_br: true
                            }
                        }
                    }
                };
                this._warpSync = function(e) {
                    this._clearPositions(e);
                    this.tools.getClassList(e.nowAnimation.loading.c).add(this.getPrf(e) + "dissolve_in");
                    this.tools.getClassList(e.nowAnimation.unloading.c).add(this.getPrf(e) + "dissolve_out");
                    this._freeBlockDisplay(e)
                };
                this._playSync = function(e) {
                    this.tools.getClassList(e.ABlock.c[-1]).add(this.getPrf(e) + "animate_dissolve");
                    return e.transition.settings.duration
                };
                this._unwarpSync = function(e) {
                    this._fixBlockDisplay(e);
                    this._restorePositions(e);
                    this.tools.getClassList(e.nowAnimation.loading.c).remove(this.getPrf(e) + "dissolve_in");
                    this.tools.getClassList(e.nowAnimation.unloading.c).remove(this.getPrf(e) + "dissolve_out");
                    this.tools.getClassList(e.ABlock.c[-1]).remove(this.getPrf(e) + "animate_dissolve")
                }
            };
            var h = function(e) {
                s(this, u, e);
                this.name = e;
                this.needResize = true;
                this._init_settings = function(e) {
                    return this.tools.initialize(e, {
                        duration: 1e3,
                        d: 0,
                        reversable: true
                    }, ["duration"])
                };
                this.getStyleTime = function(e) {
                    return 10
                };
                this.getWarpTime = function(e) {
                    return 10
                };
                var t = ["up", "down", "left", "right"];

                function n(e, n) {
                    var i = {},
                        r = n & 1 ? -1 : 1,
                        o = n & 2,
                        s = r * (o ? -90 : 90),
                        a = o ? "Y" : "X",
                        l = o ? "X" : "Y",
                        c = -(o ? r * e.state.width.total / 2 : r * e.state.height.total / 2),
                        u = o ? e.state.width.measure : e.state.height.measure;
                    i["card_out_" + t[n]] = {
                        from: {
                            transform: {
                                value: "translate" + l + "(" + c + u + ") rotate" + a + "(0) translate" + l + "(" + -c + u + ")",
                                cr_br: true
                            }
                        },
                        to: {
                            transform: {
                                value: "translate" + l + "(" + c + u + ") rotate" + a + "(" + s + "deg) translate" + l + "(" + -c + u + ")",
                                cr_br: true
                            }
                        }
                    };
                    i["card_in_" + t[n]] = {
                        from: {
                            transform: {
                                value: "translate" + l + "(" + c + u + ") rotate" + a + "(" + s + "deg) translate" + l + "(" + -c + u + ")",
                                cr_br: true
                            }
                        },
                        to: {
                            transform: {
                                value: "translate" + l + "(" + c + u + ") rotate" + a + "(0) translate" + l + "(" + -c + u + ")",
                                cr_br: true
                            }
                        }
                    };
                    return i
                }

                function i(e) {
                    var n = {};
                    n[".animate." + t[e] + " .front"] = {
                        "animation-name": {
                            value: "card_out_" + t[e],
                            cr_br: true
                        }
                    };
                    n[".animate_back." + t[e] + " .back"] = {
                        "animation-name": {
                            value: "card_in_" + t[e],
                            cr_br: true
                        }
                    };
                    return n
                }
                this._styleSync = function(e) {
                    var r = e.transition.settings,
                        o = e.transition.outer;
                    o.css = {
                        ".inversed .back": {
                            "z-index": {
                                value: 4
                            },
                            transform: {
                                value: "rotateY(180deg)",
                                cr_br: true
                            }
                        },
                        ".front": {
                            position: {
                                value: "absolute"
                            },
                            top: {
                                value: "0"
                            },
                            left: {
                                value: "0"
                            },
                            display: {
                                value: "block"
                            },
                            "z-index": {
                                value: 2
                            },
                            "backface-visibility": {
                                value: "hidden",
                                cr_br: true
                            }
                        },
                        ".back": {
                            position: {
                                value: "absolute"
                            },
                            top: {
                                value: "0"
                            },
                            left: {
                                value: "0"
                            },
                            display: {
                                value: "block"
                            },
                            "backface-visibility": {
                                value: "hidden",
                                cr_br: true
                            }
                        },
                        ".animate,.animate_back": {
                            perspective: {
                                value: "1000px",
                                cr_br: true
                            },
                            "transform-style": {
                                value: "preserve-3d",
                                cr_br: true
                            }
                        },
                        ".animate>.front": {
                            "animation-fill-mode": {
                                value: "both",
                                cr_br: true
                            },
                            "animation-timing-function": {
                                value: "ease-out",
                                cr_br: true
                            },
                            "animation-duration": {
                                value: r.duration + "ms",
                                cr_br: true
                            }
                        },
                        ".animate_back>.back": {
                            "animation-fill-mode": {
                                value: "both",
                                cr_br: true
                            },
                            "animation-timing-function": {
                                value: "linear",
                                cr_br: true
                            },
                            "animation-duration": {
                                value: r.duration + "ms",
                                cr_br: true
                            }
                        }
                    };
                    o.keyframes = {};
                    if (r.d == "r") {
                        for (var s = 0; s < t.length; ++s) {
                            Advertone.t.objUpdate(o.keyframes, n(e, s));
                            Advertone.t.objUpdate(o.css, i(s))
                        }
                    } else {
                        o.keyframes = n(e, r.d);
                        Advertone.t.objUpdate(o.css, i(r.d))
                    }
                };
                this._warpSync = function(e) {
                    var n = e.transition.settings,
                        i = e.transition.inner;
                    i.d = n.d == "r" ? this.tools.getRandomInt(0, t.length - 1) : n.d;
                    this._clearPositions(e);
                    this.tools.getClassList(e.nowAnimation.loading.c).add(this.getPrf(e) + "back");
                    this.tools.getClassList(e.nowAnimation.unloading.c).add(this.getPrf(e) + "front");
                    this.tools.getClassList(e.ABlock.c[-1]).add(this.getPrf(e) + t[i.d]);
                    if (n.reversable && !this.tools.getAnimationDirection(e)) {
                        this.tools.getClassList(e.ABlock.c[-1]).add(this.getPrf(e) + "inversed")
                    }
                    this._freeBlockDisplay(e)
                };
                this._playSync = function(e) {
                    if (e.transition.settings.reversable && !this.tools.getAnimationDirection(e)) {
                        this.tools.getClassList(e.ABlock.c[-1]).add(this.getPrf(e) + "animate_back")
                    } else {
                        this.tools.getClassList(e.ABlock.c[-1]).add(this.getPrf(e) + "animate")
                    }
                    return e.transition.settings.duration
                };
                this._unwarpSync = function(e) {
                    this._fixBlockDisplay(e);
                    this._restorePositions(e);
                    this.tools.getClassList(e.nowAnimation.unloading.c).remove(this.getPrf(e) + "front");
                    this.tools.getClassList(e.nowAnimation.loading.c).remove(this.getPrf(e) + "back");
                    this.tools.getClassList(e.ABlock.c[-1]).remove(this.getPrf(e) + t[e.transition.inner.d]);
                    if (e.transition.settings.reversable && !this.tools.getAnimationDirection(e)) {
                        this.tools.getClassList(e.ABlock.c[-1]).remove(this.getPrf(e) + "inversed")
                    }
                    if (e.transition.settings.reversable && !this.tools.getAnimationDirection(e)) {
                        this.tools.getClassList(e.ABlock.c[-1]).remove(this.getPrf(e) + "animate_back")
                    } else {
                        this.tools.getClassList(e.ABlock.c[-1]).remove(this.getPrf(e) + "animate")
                    }
                }
            };
            var m = function(e, t) {
                s(this, u, e);
                this.name = e;
                this.needResize = true;
                this._init_settings = function(e) {
                    return this.tools.initialize(e, {
                        duration: 1e3,
                        d: 0,
                        reversable: true
                    }, ["duration"])
                };
                this.getStyleTime = function(e) {
                    return 10
                };
                this.getWarpTime = function(e) {
                    return 10
                };
                var n = ["left", "right", "top", "bottom"];

                function i(e) {
                    return (1 - ((+e & 1) << 1)) * 90
                }

                function r(e, r) {
                    var o = {},
                        s = t ? 1 : -1,
                        a = s * i(r),
                        l = r & 2 ? "Y" : "X",
                        c = r & 2 ? s * e.state.width.total / 2 : s * e.state.height.total / 2,
                        u = r & 2 ? e.state.width.measure : e.state.height.measure;
                    o["spin_in_" + n[r]] = {
                        from: {
                            transform: {
                                value: "translateZ(" + c + u + ") rotate" + l + "(" + a + "deg) translateZ(" + -c + u + ")",
                                cr_br: true
                            }
                        },
                        to: {
                            transform: {
                                value: "translateZ(" + c + u + ") rotate" + l + "(0) translateZ(" + -c + u + ")",
                                cr_br: true
                            }
                        }
                    };
                    o["spin_out_" + n[r]] = {
                        from: {
                            transform: {
                                value: "translateZ(" + c + u + ") rotate" + l + "(0) translateZ(" + -c + u + ")",
                                cr_br: true
                            }
                        },
                        to: {
                            transform: {
                                value: "translateZ(" + c + u + ") rotate" + l + "(" + -a + "deg) translateZ(" + -c + u + ")",
                                cr_br: true
                            }
                        }
                    };
                    return o
                }

                function o(e) {
                    var t = {};
                    t[".animate." + n[e] + " .side"] = {
                        "animation-name": {
                            value: "spin_in_" + n[e],
                            cr_br: true
                        }
                    };
                    t[".animate." + n[e] + " .front"] = {
                        "animation-name": {
                            value: "spin_out_" + n[e],
                            cr_br: true
                        }
                    };
                    return t
                }
                this._styleSync = function(e) {
                    var t = e.transition.settings,
                        i = e.transition.outer;
                    i.css = {
                        ".front": {
                            position: {
                                value: "absolute"
                            },
                            top: {
                                value: "0"
                            },
                            left: {
                                value: "0"
                            },
                            display: {
                                value: "block"
                            },
                            "z-index": {
                                value: 2
                            }
                        },
                        ".side": {
                            position: {
                                value: "absolute"
                            },
                            top: {
                                value: "0"
                            },
                            left: {
                                value: "0"
                            },
                            display: {
                                value: "block"
                            },
                            transform: {
                                value: "rotateY(90deg)",
                                cr_br: true
                            }
                        },
                        ".animate": {
                            perspective: {
                                value: "1000px",
                                cr_br: true
                            },
                            "transform-style": {
                                value: "preserve-3d",
                                cr_br: true
                            }
                        },
                        ".animate>*": {
                            "animation-fill-mode": {
                                value: "both",
                                cr_br: true
                            },
                            "animation-timing-function": {
                                value: "ease-in-out",
                                cr_br: true
                            },
                            "animation-duration": {
                                value: t.duration + "ms",
                                cr_br: true
                            },
                            "backface-visibility": {
                                value: "hidden",
                                cr_br: true
                            }
                        }
                    };
                    i.keyframes = {};
                    if (t.d == "r" || t.reversable) {
                        for (var s = 0; s < n.length; ++s) {
                            Advertone.t.objUpdate(i.keyframes, r(e, s));
                            Advertone.t.objUpdate(i.css, o(s))
                        }
                    } else {
                        i.keyframes = r(e, t.d);
                        Advertone.t.objUpdate(i.css, o(t.d))
                    }
                };
                this._warpSync = function(e) {
                    var t = e.transition.settings,
                        i = e.transition.inner;
                    i.d = t.d == "r" ? this.tools.getRandomInt(0, n.length - 1) : t.reversable ? +t.d ^ !this.tools.getAnimationDirection(e) : +t.d;
                    this._clearPositions(e);
                    this.tools.getClassList(e.nowAnimation.loading.c).add(this.getPrf(e) + "side");
                    this.tools.getClassList(e.nowAnimation.unloading.c).add(this.getPrf(e) + "front");
                    this.tools.getClassList(e.ABlock.c[-1]).add(this.getPrf(e) + n[i.d]);
                    this._freeBlockDisplay(e)
                };
                this._playSync = function(e) {
                    this.tools.getClassList(e.ABlock.c[-1]).add(this.getPrf(e) + "animate");
                    return e.transition.settings.duration
                };
                this._unwarpSync = function(e) {
                    this._fixBlockDisplay(e);
                    this._restorePositions(e);
                    this.tools.getClassList(e.nowAnimation.unloading.c).remove(this.getPrf(e) + "front");
                    this.tools.getClassList(e.nowAnimation.loading.c).remove(this.getPrf(e) + "side");
                    this.tools.getClassList(e.ABlock.c[-1]).remove(this.getPrf(e) + n[e.transition.inner.d]);
                    this.tools.getClassList(e.ABlock.c[-1]).remove(this.getPrf(e) + "animate")
                }
            };
            var v = function(t, n) {
                s(this, c);
                this.flags = {
                    made: 0,
                    inMake: 1,
                    inReadingForTransition: 2,
                    inRestoringAfterTransition: 3,
                    readyForTransition: 4
                };
                this.name = t;
                this.type = n;
                this.prf = this.type + "_" + t;
                this.getBeforeTransitionTime = function(e) {
                    return 0
                };
                this._makeSync = function(e) {};
                this._makeAsync = function(e, t) {
                    this.baseAsyncFunc(e, t, "makeWaitSuccess", "_makeSync")
                };
                this._actBeforeTransitionSync = function(e) {};
                this._actBeforeTransitionAsync = function(e, t) {
                    this.baseAsyncFunc(e, t, "actBeforeTransitionWaitSuccess", "_actBeforeTransitionSync")
                };
                this._actAfterTransitionSync = function(e) {};
                this._actAfterTransitionAsync = function(e, t) {
                    this.baseAsyncFunc(e, t, "actAfterTransitionWaitSuccess", "_actAfterTransitionSync")
                };
                this._destroySync = function(e) {
                    this._actBeforeTransitionAsync(e, function() {})
                };
                this._destroyAsync = function(e, t) {
                    this.baseAsyncFunc(e, t, "destroyWaitSuccess", "_destroySync")
                };
                this._onresize = function(e) {};
                this.onresize = function(e) {
                    var t = e[this.type].state;
                    if (t.flags.checkAny(this.flags.made, this.flags.inMake)) {
                        this._onresize(e)
                    }
                };
                this.makeAsync = function(e, t) {
                    var n = this;
                    var i = e[this.type].state,
                        r = e[this.type].outer,
                        o = e.state.timeouts;
                    if (i.flags.check(this.flags.made)) {
                        o.set(this.prf + "MakeAsyncComplete", t, 0)
                    } else {
                        o.set(this.prf + "MakeAsync", function() {
                            i.flags.set(n.flags.inMake);
                            n._makeAsync(e, function() {
                                n.tools.guarantyCSS(n.getPrf(e), r);
                                i.needRestyle |= n.alwaysRestyle;
                                i.flags.drop(n.flags.inMake);
                                i.flags.set(n.flags.made);
                                t()
                            })
                        }, 0)
                    }
                };
                this.actBeforeTransitionAsync = function(e, t) {
                    var n = this;
                    var i = e[this.type].state,
                        r = e.state.timeouts,
                        o = e[this.type].outer;
                    if (!i.flags.check(this.flags.made)) {
                        r.set(this.prf + "NeedMakeAsync", function() {
                            i.flags.set(n.flags.readyForTransition);
                            t()
                        }, 0);
                        return
                    }
                    if (i.flags.check(this.flags.readyForTransition)) {
                        r.set(this.prf + "BeforeTransitionAsyncComplete", t, 0)
                    } else {
                        r.set(this.prf + "BeforeTransitionAsync", function() {
                            i.flags.set(n.flags.inReadingForTransition);
                            n._actBeforeTransitionAsync(e, function() {
                                i.flags.drop(n.flags.inReadingForTransition);
                                i.flags.set(n.flags.readyForTransition);
                                t()
                            })
                        }, 0)
                    }
                };
                this.actAfterTransitionAsync = function(t, n) {
                    var i = this;
                    var r = t[this.type].state,
                        o = t.state.timeouts,
                        s = t[this.type].outer;
                    if (!r.flags.check(this.flags.made)) {
                        o.set(this.prf + "NeedMakeAsync", function() {
                            i.makeAsync(t, function() {
                                i.actAfterTransitionAsync(t, n)
                            })
                        }, 0);
                        return
                    }
                    if (r.flags.check(this.flags.readyForTransition)) {
                        o.set(this.prf + "AfterTransitionAsyncComplete", function() {
                            if (r.needRestyle) {
                                i.tools.guarantyCSS(i.getPrf(t), s);
                                r.needRestyle = i.alwaysRestyle
                            }
                            r.flags.set(i.flags.inRestoringAfterTransition);
                            i._actAfterTransitionAsync(t, function() {
                                r.flags.drop(i.flags.inRestoringAfterTransition);
                                r.flags.drop(i.flags.readyForTransition);
                                n()
                            })
                        }, 0)
                    } else {
                        e.console("actAfterTransitionAsync error: after no before")
                    }
                };
                this.destroyAsync = function(e, t) {
                    var n = this;
                    e.state.timeouts.set(this.prf + "DestroyAsync", function() {
                        n._destroyAsync(e, function() {
                            e[n.type].state.flags.dropAll();
                            t()
                        })
                    }, 0)
                }
            };
            var p = function(e) {
                s(this, v, e, "interactive");
                this.name = e;
                this.type = "interactive";
                this.readyHover = function(e) {
                    var t = "hovered",
                        n = this,
                        i = e.ABlock.c.outest;

                    function r() {
                        i.classList.add(n.getPrf(e) + t)
                    }

                    function o() {
                        i.classList.remove(n.getPrf(e) + t)
                    }
                    if (Advertone.settings.isIE) {
                        i.onmouseover = r;
                        i.onmouseout = o;
                        this.hoverConst = "." + t
                    } else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile/i.test(navigator.userAgent)) {
                        return false
                    } else if (/IEMobile/i.test(navigator.userAgent)) {
                        return false
                    } else {
                        this.hoverConst = ":hover"
                    }
                    return true
                }
            };
            var _ = function(e) {
                s(this, p, e);
                this.name = e;
                var t = this;
                var n = ["up", "down", "left", "right"];
                this._init_settings = function(e) {
                    return this.tools.initialize(e, {
                        duration: 300,
                        d: 0,
                        scale: 1.2,
                        vertical: 40,
                        horizontal: 30,
                        angle: 2.5
                    })
                };

                function i(e, i) {
                    var r = {},
                        o = e.interactive.settings,
                        s = ".increase" + t.hoverConst + ".increase_" + n[i] + "," + t.hoverConst + ">.increase.increase_" + n[i];
                    if (+i < 2) r[s] = {
                        transform: {
                            value: "translate3d(0,0,0) scale(" + o.scale + ") translateY(" + ((i << 1) - 1) * o.horizontal + "px)",
                            cr_br: true
                        },
                        "box-shadow": {
                            value: "0 15px 35px rgba(0, 0, 0, 0.3)",
                            cr_br: true
                        }
                    };
                    else {
                        r[s] = {
                            transform: {
                                value: "translate3d(0,0,0) scale(" + o.scale + ") translate3d(0, " + -1 * o.horizontal + "px, 0) rotate(" + ((i - 2 << 1) - 1) * o.angle + "deg)",
                                cr_br: true
                            }
                        }
                    }
                    return r
                }
                this._makeSync = function(e) {
                    var t = e.interactive.settings,
                        r = e.interactive.outer;
                    if (!this.readyHover(e)) {
                        r.css = {};
                        r.keyframes = {};
                        return
                    }
                    r.css = {
                        ".increase": {
                            "list-style": {
                                value: "none"
                            },
                            position: {
                                value: "relative"
                            },
                            "box-shadow": {
                                value: "0 0 4px rgba(0, 0, 0, 0.2)",
                                cr_br: true
                            },
                            "border-radius": {
                                value: "5px",
                                cr_br: true
                            },
                            transition: {
                                value: "all " + t.duration + "ms ease-in",
                                cr_br: true
                            }
                        }
                    };
                    if (Advertone.settings.isIE) {
                        var o = e.ABlock.c.outest,
                            s = this;

                        function a() {
                            this.tools.getClassList(o).add(s.getPrf(e) + "hovered")
                        }

                        function l() {
                            this.tools.getClassList(o).remove(s.getPrf(e) + "hovered")
                        }
                        o.onmouseover = a;
                        o.onmouseout = l
                    }
                    if (t.d == "r") {
                        for (var c = 0; c < n.length; ++c) {
                            Advertone.t.objUpdate(r.css, i(e, c))
                        }
                    } else {
                        Advertone.t.objUpdate(r.css, i(e, t.d))
                    }
                };
                this._actBeforeTransitionSync = function(e) {
                    var t = e.ABlock.c;
                    this.tools.getClassList(t.outest).remove(this.getPrf(e) + "increase");
                    this.tools.getClassList(t.outest).remove(this.getPrf(e) + "increase_" + n[e.interactive.inner.d])
                };
                this._actAfterTransitionSync = function(e) {
                    var t = e.interactive.settings,
                        i = e.interactive.inner,
                        r = e.ABlock.c;
                    i.d = t.d == "r" ? this.tools.getRandomInt(0, n.length - 1) : t.d;
                    this.tools.getClassList(r.outest).add(this.getPrf(e) + "increase");
                    this.tools.getClassList(r.outest).add(this.getPrf(e) + "increase_" + n[i.d]);
                    return 0
                };
                this._destroySync = function(e) {
                    this._actBeforeTransitionSync(e)
                }
            };
            var y = function(e) {
                s(this, v, e, "effect");
                this.name = e;
                this.type = "effect"
            };
            var b = function(e) {
                s(this, y, e);
                var t = this;
                this.name = e;
                var n = ["&#10052;", "&#10053;", "&#10054;"];
                this._init_settings = function(e) {
                    return this.tools.initialize(e, {
                        circles: 1,
                        globalcircles: 1,
                        globalradius: 15,
                        main_angle_dispersion: 15,
                        angle_dispersion: 20,
                        velocity_dispersion: .3,
                        fall_time: 1e3,
                        dissolve_time: 1e3,
                        pause: 1e3,
                        main_angle: 0,
                        snow_buffer: 10,
                        type: 1,
                        min_radius: 5,
                        max_radius: 10,
                        n_flakes: 1e3
                    }, ["circles", "globalcircles", "globalradius", "main_angle_dispersion", "angle_dispersion", "velocity_dispersion", "fall_time", "dissolve_time", "pause", "main_angle", "snow_buffer", "min_radius", "max_raius", "n_flakes"])
                };

                function i(e, n, i) {
                    var r = i.effect.settings,
                        o = i.effect.inner,
                        s = i.effect.outer,
                        a = i.state.width,
                        l = i.state.height;
                    var c = r.type == "0" ? n / 2 : n;
                    var u = (Math.random() * r.angle_dispersion * 2 + o.mainAngle - r.angle_dispersion) / 180 * Math.PI;
                    var d = Math.random() * (o.maxVelocity - o.minVelocity) + o.minVelocity;
                    var f = Math.cos(u) * d;
                    var g = Math.sin(u) * d;
                    var h = Math.random() * (o.rightBottomPoint - o.leftBottomPoint) + o.leftBottomPoint;
                    var m = l.total - 2 * c;
                    var v = (Math.random() * 2 * r.velocity_dispersion + r.velocity_dispersion) * o.circles;
                    var p = (t.tools.getRandomInt(0, 1) * 2 - 1) * (o.circles + v);
                    v = (Math.random() * 2 * r.velocity_dispersion + r.velocity_dispersion) * o.globalCircles;
                    var _ = (t.tools.getRandomInt(0, 1) * 2 - 1) * (o.globalCircles + v);
                    var y = r.globalradius * (1 + (Math.random() * 2 * r.velocity_dispersion + r.velocity_dispersion));
                    var b = l.total - f * o.fallTime;
                    var k = m - b;
                    var A = g * o.fallTime;
                    var w = h - A;
                    s.keyframes["white_snow_flake_2_" + e] = {};
                    s.keyframes["white_snow_flake_2_" + e]["0%"] = {
                        transform: {
                            value: "rotate(0)",
                            cr_br: true
                        },
                        "transform-origin": {
                            value: r.globalradius + "px 50%",
                            cr_br: true
                        }
                    };
                    s.keyframes["white_snow_flake_2_" + e][o.endOfFlight + "%"] = {
                        transform: {
                            value: "rotate(" + _ + "deg)",
                            cr_br: true
                        },
                        "transform-origin": {
                            value: r.globalradius + "px 50%",
                            cr_br: true
                        }
                    };
                    s.keyframes["white_snow_flake_2_" + e]["100%"] = {
                        transform: {
                            value: "rotate(" + _ + "deg)",
                            cr_br: true
                        },
                        "transform-origin": {
                            value: r.globalradius + "px 50%",
                            cr_br: true
                        }
                    };
                    s.keyframes["white_snow_flake_" + e] = {};
                    s.keyframes["white_snow_flake_" + e]["0%"] = {
                        opacity: {
                            value: .95
                        }
                    };
                    s.keyframes["white_snow_flake_" + e][o.endOfFlight + "%"] = {
                        transform: {
                            value: "translate(" + A + "px, " + k + "px) rotate(" + p + "deg)",
                            cr_br: true
                        },
                        opacity: {
                            value: .95
                        }
                    };
                    s.keyframes["white_snow_flake_" + e][o.endOfDissolve + "%"] = {
                        transform: {
                            value: "translate(" + A + "px, " + k + "px) rotate(" + p + "deg)",
                            cr_br: true
                        },
                        opacity: {
                            value: 0
                        }
                    };
                    s.keyframes["white_snow_flake_" + e]["100%"] = {
                        transform: {
                            value: "translate(" + A + "px, " + (m + 2 * c + 2 * y) + "px)",
                            cr_br: true
                        },
                        opacity: {
                            value: 0
                        }
                    };
                    s.css[".white_snowflakes_container .play_trajectory_" + e] = {
                        "animation-name": {
                            value: "white_snow_flake_2_" + e + ",white_snow_flake_" + e,
                            cr_br: true
                        },
                        top: {
                            value: b + "px !important"
                        },
                        left: {
                            value: w + "px !important"
                        }
                    }
                }

                function r(e, r, o, s) {
                    var a = s.effect.settings,
                        l = s.effect.inner,
                        c = s.effect.outer,
                        u = s.state.width,
                        d = s.state.height;
                    var f = Math.random() * (a.max_radius - a.min_radius) + a.min_radius;
                    i(o, f, s);

                    function g() {
                        function e(e) {
                            return parseInt("0x" + e)
                        }

                        function n(t) {
                            if (t.indexOf("rgb") == 0) {
                                var n = /(\d+)/g,
                                    i = t.match(n),
                                    r;
                                if (i) {
                                    for (r = 0; r < 3; ++r) {
                                        i[r] = parseInt(i[r])
                                    }
                                    return i.slice(0, 3)
                                } else {
                                    return [255, 255, 255]
                                }
                            } else {
                                return [e(t.substr(0, 2)), e(t.substr(2, 2)), e(t.substr(4, 2))]
                            }
                        }
                        var i = [],
                            r;
                        for (r = 0; r < 3; ++r) {
                            i.push(t.tools.getRandomInt(n(a.color_1)[r], n(a.color_2)[r]))
                        }
                        return i
                    }
                    var h = g();
                    if (a.type == "0") {
                        return t.tools.make_container("div", t.getPrf(s) + "white_snowflake " + t.getPrf(s) + "play_trajectory_" + o, t.getPrf(s) + r, "width: " + f + "px; height: " + f + "px; " + "font-size:" + f + "px; color: rgb(" + h[0] + "," + h[1] + "," + h[2] + ");" + "text-align: center; vertical-align: middle; opacity: 0", n[t.tools.getRandomInt(0, n.length - 1)], e)
                    }
                    return t.tools.make_container("div", t.getPrf(s) + "white_snowflake " + t.getPrf(s) + "play_trajectory_" + o, t.getPrf(s) + r, "width: " + f * 2 + "px; height: " + f * 2 + "px; " + "border-radius:" + f + "px; " + "background-color: rgb(" + h[0] + "," + h[1] + "," + h[2] + "); " + " opacity: 0;", false, e)
                }
                this.shuffle = function(e) {
                    var n = e.effect.inner,
                        i;
                    for (var r = 0; r < n.snowflakes.length; ++r) {
                        i = -t.tools.getRandomInt(0, n.animationTime) + "ms";
                        n.snowflakes[r].style.setProperty("-" + Advertone.settings.cr_br_prefix + "-animation-delay", i);
                        n.snowflakes[r].style.setProperty("animation-delay", i)
                    }
                };
                this._destroySync = function(e) {
                    var n = e.effect.inner,
                        i = t.getPrf(e) + "white_snowflake",
                        r = Advertone.t.getElementsByClass(i),
                        o;
                    if (n.snowbox) {
                        while (r.length != 0) {
                            o = r.pop();
                            o.parentNode.removeChild(o)
                        }
                        this.tools.getClassList(n.snowbox).remove(t.getPrf(e) + "white_snowflakes_container")
                    }
                };
                this._makeAsync = function(e, n) {
                    var i = e.effect.settings,
                        r = e.effect.inner,
                        s = e.effect.outer,
                        a = e.state.width,
                        l = e.state.height,
                        c = e.ABlock.c;
                    r.fallTime = i.fall_time * l.total / 100;
                    r.animationTime = r.fallTime + i.dissolve_time + i.pause;
                    r.endOfFlight = r.fallTime / r.animationTime * 100;
                    r.endOfDissolve = i.dissolve_time / r.animationTime * 100 + r.endOfFlight;
                    r.mainAngle = i.main_angle + Math.random() * i.main_angle_dispersion * 2 - i.main_angle_dispersion;
                    r.leftAngle = (r.mainAngle + i.angle_dispersion) / 180 * Math.PI;
                    r.rightAngle = (r.mainAngle - i.angle_dispersion) / 180 * Math.PI;
                    r.minAngle = r.leftAngle * r.rightAngle <= 0 ? 0 : Math.min(Math.abs(r.leftAngle), Math.abs(r.rightAngle));
                    r.maxAngle = Math.max(Math.abs(r.leftAngle), Math.abs(r.rightAngle));
                    r.minVelocity = l.total / Math.cos(r.maxAngle) / r.fallTime;
                    r.maxVelocity = r.minVelocity * (1 + i.velocity_dispersion / 2) / (1 - i.velocity_dispersion / 2);
                    r.circles = 360 * i.circles;
                    r.globalCircles = 360 * i.globalcircles;
                    r.leftBottomPoint = r.rightAngle < 0 ? Math.tan(r.rightAngle) * l.total : 0;
                    r.rightBottomPoint = r.leftAngle > 0 ? a.total + Math.tan(r.leftAngle) * l.total : a.total;
                    s.keyframes = {};
                    s.css = {
                        ".white_snowflake": {
                            position: {
                                value: "absolute"
                            },
                            "z-index": {
                                value: 2e4
                            },
                            "animation-iteration-count": {
                                value: "infinite",
                                cr_br: true
                            },
                            "animation-timing-function": {
                                value: "linear",
                                cr_br: true
                            },
                            "animation-duration": {
                                value: r.animationTime + "ms",
                                cr_br: true
                            },
                            "text-align": {
                                value: "center"
                            },
                            "vertical-align": {
                                value: "middle"
                            }
                        },
                        ".white_snowflakes_container": {
                            position: {
                                value: "absolute"
                            },
                            top: {
                                value: 0
                            },
                            left: {
                                value: 0
                            },
                            overflow: {
                                value: "hidden"
                            }
                        }
                    };
                    r.snowHeap = 0;
                    r.snowbox = c.outest;
                    r.snowbox.style.overflow = "hidden";
                    r.snowflakes = [];
                    e.state.timeouts.set(t.prf + "fillBufer", function() {
                        o(e, n)
                    }, 5)
                };

                function o(e, n) {
                    var i = e.effect.inner,
                        s = e.effect.settings,
                        c = i.snowHeap + s.snow_buffer;
                    if (t.resize) {
                        e.state.timeouts.set(t.prf + "RESIZE", function() {
                            n();
                            l(e);
                            t.resize = false
                        }, 5)
                    }
                    for (; i.snowHeap < c; ++i.snowHeap) {
                        i.snowflakes.push(r(i.snowbox, "snowflake_" + i.snowHeap, i.snowHeap, e))
                    }
                    if (i.snowHeap < s.n_flakes) {
                        e.state.timeouts.set(t.prf + "fillBufer", function() {
                            o(e, n)
                        }, 5)
                    } else {
                        e.state.timeouts.set(t.prf + "buferFilled", function() {
                            a(e, n)
                        }, 5)
                    }
                }

                function a(e, n) {
                    var i = e.effect.inner;
                    t.shuffle(e);
                    t.tools.getClassList(i.snowbox).add(t.getPrf(e) + "white_snowflakes_container");
                    e.state.timeouts.set(t.prf + "snowFlakeMade", n, 0)
                }
                this._actAfterTransitionSync = function(e) {
                    if (this.isNotAccurateAnimation(e)) {
                        this.shuffle(e);
                        e.ABlock.c.outest.style.overflow = "";
                        this.tools.getClassList(e.ABlock.c.outest).add(t.getPrf(e) + "white_snowflakes_container")
                    }
                };
                this._actBeforeTransitionSync = function(e) {
                    if (this.isNotAccurateAnimation(e)) {
                        this.tools.getClassList(e.ABlock.c.outest).remove(t.getPrf(e) + "white_snowflakes_container");
                        e.ABlock.c.outest.style.overflow = "visible"
                    }
                };

                function l(e) {
                    var n = e.effect.inner,
                        i = e.effect.outer;
                    if (n.snowbox) {
                        t._actBeforeTransitionSync(e);
                        t._destroySync(e);
                        t._makeAsync(e, function() {
                            t.tools.guarantyCSS(t.getPrf(e), i);
                            t._actAfterTransitionSync(e)
                        })
                    }
                    e.effect.state.flags.dropAll();
                    e.effect.state.flags.set(t.flags.made)
                }
                this._onresize = function(e) {
                    if (e.effect.state.flags.check(this.flags.inMake)) {
                        this.resize = true;
                        return
                    }
                    l(e)
                }
            };
            var k = function(e) {
                s(this, y, e);
                var t = this;
                this.name = e;
                this._init_settings = function(e) {
                    return this.tools.initialize(e, {
                        inner_glow_blur_1: 0,
                        inner_glow_blur_2: 0,
                        inner_glow_width_1: 0,
                        inner_glow_width_2: 0,
                        glow_blur_1: 5,
                        glow_blur_2: 5,
                        glow_width_1: 10,
                        glow_width_2: 10,
                        color_1: "#DDFF00AA",
                        color_2: "#0088FFAA",
                        duration: 1e3
                    }, ["inner_glow_blur_1", "inner_glow_blur_2", "inner_glow_width_1", "inner_glow_width_2", "glow_blur_1", "glow_blur_2", "glow_width_1", "glow_width_2", "duration"])
                };
                this._makeSync = function(e) {
                    var t = e.effect.settings,
                        n = e.effect.outer;
                    n.keyframes = {
                        glow: {
                            from: {
                                "box-shadow": {
                                    value: "0px 0px " + t.glow_blur_1 + "px " + t.glow_width_1 + "px " + t.color_1 + ", inset 0px 0px " + t.inner_glow_blur_1 + "px " + t.inner_glow_width_1 + "px " + t.color_1,
                                    cr_br: true
                                }
                            },
                            to: {
                                "box-shadow": {
                                    value: "0px 0px " + t.glow_blur_2 + "px " + t.glow_width_2 + "px " + t.color_2 + ", inset 0px 0px " + t.inner_glow_blur_2 + "px " + t.inner_glow_width_2 + "px " + t.color_2,
                                    cr_br: true
                                }
                            }
                        }
                    };
                    n.css = {
                        ".glow": {
                            "animation-duration": {
                                value: t.duration + "ms",
                                cr_br: true
                            },
                            "animation-iteration-count": {
                                value: "infinite",
                                cr_br: true
                            },
                            "animation-direction": {
                                value: "alternate",
                                cr_br: true
                            },
                            "animation-timing-function": {
                                value: "linear",
                                cr_br: true
                            },
                            "animation-name": {
                                value: "glow",
                                cr_br: true
                            }
                        }
                    };
                    this.tools.getClassList(e.ABlock.c.outest).add(this.getPrf(e) + "glow")
                };
                this._actAfterTransitionSync = function(e) {
                    if (this.isNotAccurateAnimation(e)) this.tools.getClassList(e.ABlock.c.outest).add(this.getPrf(e) + "glow")
                };
                this._actBeforeTransitionSync = function(e) {
                    if (this.isNotAccurateAnimation(e)) this.tools.getClassList(e.ABlock.c.outest).remove(this.getPrf(e) + "glow")
                };
                this._destroySync = function(e) {
                    this.tools.getClassList(e.ABlock.c.outest).remove(this.getPrf(e) + "glow")
                }
            };
            var A = function(e) {
                s(this, y, e);
                var t = this;
                this.name = e;
                this._init_settings = function(e) {
                    return this.tools.initialize(e, {
                        x_variation: 2,
                        y_variation: 2,
                        rot: 0,
                        intensity: 0,
                        duration: 5,
                        pause: 5
                    }, ["x_variation", "y_variation", "rot", "intensity", "duration", "pause"])
                };
                this._makeSync = function(e) {
                    var t = e.effect.settings,
                        n = e.effect.outer;
                    var i = t.pause / 1e3 + t.duration / 1e3;
                    var r = t.duration / 1e3 / (8 * t.intensity + 2);
                    var o = t.pause / 1e3 / i * 100;
                    var s = r / i * 100;
                    var a = {
                        transform: {
                            value: "translate(0,0) rotate(0)",
                            cr_br: true
                        }
                    };
                    n.keyframes = {
                        banner_quake: {
                            "0%": a
                        }
                    };
                    var l = o;
                    n.keyframes["banner_quake"][l + "%"] = a;
                    l += s;
                    n.keyframes["banner_quake"][l + "%"] = {
                        transform: {
                            value: "translate(" + t.x_variation + "px," + -t.y_variation + "px) rotate(" + -t.rot + "deg)",
                            cr_br: true
                        }
                    };
                    l += s;
                    for (var c = 0; c < t.intensity; ++c) {
                        n.keyframes["banner_quake"][l + "%"] = {
                            transform: {
                                value: "translate(" + -t.x_variation + "px," + 2 * t.y_variation + "px) rotate(" + +t.rot + "deg)",
                                cr_br: true
                            }
                        };
                        l += s;
                        n.keyframes["banner_quake"][l + "%"] = {
                            transform: {
                                value: "translate(" + -t.x_variation + "px," + -2 * t.y_variation + "px) rotate(" + +t.rot + "deg)",
                                cr_br: true
                            }
                        };
                        l += s;
                        n.keyframes["banner_quake"][l + "%"] = {
                            transform: {
                                value: "translate(" + 2 * t.x_variation + "px," + t.y_variation + "px) rotate(" + -t.rot + "deg)",
                                cr_br: true
                            }
                        };
                        l += s;
                        n.keyframes["banner_quake"][l + "%"] = {
                            transform: {
                                value: "translate(" + -2 * t.x_variation + "px," + t.y_variation + "px) rotate(" + -t.rot + "deg)",
                                cr_br: true
                            }
                        };
                        l += s;
                        n.keyframes["banner_quake"][l + "%"] = {
                            transform: {
                                value: "translate(" + t.x_variation + "px," + -2 * t.y_variation + "px) rotate(" + +t.rot + "deg)",
                                cr_br: true
                            }
                        };
                        l += s;
                        n.keyframes["banner_quake"][l + "%"] = {
                            transform: {
                                value: "translate(" + t.x_variation + "px," + 2 * t.y_variation + "px) rotate(" + +t.rot + "deg)",
                                cr_br: true
                            }
                        };
                        l += s;
                        n.keyframes["banner_quake"][l + "%"] = {
                            transform: {
                                value: "translate(" + -2 * t.x_variation + "px," + -t.y_variation + "px) rotate(" + -t.rot + "deg)",
                                cr_br: true
                            }
                        };
                        l += s;
                        n.keyframes["banner_quake"][l + "%"] = {
                            transform: {
                                value: "translate(" + 2 * t.x_variation + "px," + -t.y_variation + "px) rotate(" + -t.rot + "deg)",
                                cr_br: true
                            }
                        };
                        l += s
                    }
                    n.keyframes["banner_quake"][l + "%"] = a;
                    n.keyframes["banner_quake"]["100%"] = a;
                    n.css = {
                        ".banner_quake": {
                            "animation-duration": {
                                value: i + "s",
                                cr_br: true
                            },
                            "animation-iteration-count": {
                                value: "infinite",
                                cr_br: true
                            },
                            "animation-name": {
                                value: "banner_quake",
                                cr_br: true
                            },
                            "animation-timing-function": {
                                value: "linear",
                                cr_br: true
                            },
                            position: {
                                value: "relative"
                            }
                        }
                    }
                };
                this._actAfterTransitionSync = function(e) {
                    this.tools.getClassList(e.ABlock.c.outest).add(this.getPrf(e) + "banner_quake")
                };
                this._actBeforeTransitionSync = function(e) {
                    this.tools.getClassList(e.ABlock.c.outest).remove(this.getPrf(e) + "banner_quake")
                }
            };
            var w = function() {
                var e = String["prototype"].trim || function() {
                    return this.replace(/^\s+|\s+$/g, "")
                };
                this.getClassList = function(t) {
                    if (t.classList) return t.classList;
                    var n = e.call(t.getAttribute("class") || ""),
                        i = n ? n.split(/\s+/) : [];
                    i._updateClassName = function() {
                        t.setAttribute("class", i.join(" "))
                    };
                    i.add = function(e) {
                        var t = Advertone.t.inArray(i, e);
                        if (t == -1) {
                            i.push(e);
                            i._updateClassName()
                        }
                    };
                    i.remove = function(e) {
                        var t = Advertone.t.inArray(i, e);
                        if (t != -1) {
                            i.splice(t, 1);
                            i._updateClassName()
                        }
                    };
                    return i
                };
                this.getAnimationDirection = function(e) {
                    var t = e.ABlock.nav,
                        n = e.nowAnimation;
                    if (!t.getBlockIndex) {
                        return true
                    }
                    return t.getBlockIndex(n.loading) > t.getBlockIndex(n.unloading)
                };
                this.getRandomInt = function(e, t) {
                    return Math.floor(Math.random() * (t - e + 1)) + e
                };
                this.initialize = function(e, t, n) {
                    for (var i in t) {
                        if (t.hasOwnProperty(i)) {
                            if (e[i] === undefined || isNaN(e[i]) && typeof e[i] == "number") {
                                e[i] = t[i]
                            }
                        }
                    }
                    if (n)
                        for (var r = 0; r < n.length; ++r)
                            if (e.hasOwnProperty(n[r])) {
                                e[n[r]] = Number(e[n[r]])
                            }
                    return e
                };
                this.make_css_property = function(e, t, n) {
                    var i = "{",
                        r, o, s, a, l, c = Advertone.settings.cr_br_prefix;
                    for (r in t) {
                        if (t.hasOwnProperty(r)) {
                            o = t[r].value;
                            if (r == "animation" || r == "animation-name") {
                                s = o.split(",");
                                o = "";
                                for (l = 0; l < s.length; l++) {
                                    o += e + s[l];
                                    if (l < s.length - 1) o += ","
                                }
                            }
                            a = r + ":" + o + ";";
                            if (t[r].cr_br) {
                                if (!n) {
                                    if (c && !t.hasOwnProperty("-" + c + "-" + r)) i += "-" + c + "-" + a
                                } else a += "#_#-browser_pref-#_#" + a
                            }
                            i += a
                        }
                    }
                    i += "}";
                    return i
                };
                this.make_keyframes_css = function(e, t) {
                    var n, i, r = "",
                        o, s = Advertone.settings.cr_br_prefix;
                    if (t)
                        for (n in t) {
                            if (t.hasOwnProperty(n)) {
                                i = e + n + "{";
                                for (o in t[n]) {
                                    if (t[n].hasOwnProperty(o)) {
                                        i += o;
                                        i += this.make_css_property(e, t[n][o], true)
                                    }
                                }
                                i += "}";
                                if (s) r += "@-" + s + "-keyframes " + i.replace(/#_#-browser_pref-#_#/g, "-" + s + "-");
                                r += "@keyframes " + i.replace(/#_#-browser_pref-#_#/g, "-" + s + "-")
                            }
                        }
                    return r
                };
                this.new_group_selector = function(e, t) {
                    var n = t.split("."),
                        i;
                    t = n[0];
                    for (i = 1; i < n.length; i++) t += "." + e + n[i];
                    n = t.split("#");
                    t = n[0];
                    for (i = 1; i < n.length; i++) t += "#" + e + n[i];
                    return t
                };
                this.make_css = function(e, t) {
                    var n, i, r = "";
                    for (n in t) {
                        if (t.hasOwnProperty(n)) {
                            i = n.split(" ");
                            for (o = 0; o < i.length; o++) {
                                r += o ? " " : "";
                                if (".#".indexOf(i[o].substring(0, 1)) > -1) r += i[o].substring(0, 1) + e + this.new_group_selector(e, i[o].substring(1));
                                else r += this.new_group_selector(e, i[o])
                            }
                            r += this.make_css_property(e, t[n])
                        }
                    }
                    return r
                };
                this.make_css_text = function(e, t) {
                    var n = "";
                    n += this.make_keyframes_css(e, t.keyframes);
                    n += this.make_css(e, t.css);
                    return n
                };
                this.guarantyCSS = function(e, t) {
                    if (!t.style) {
                        t.style = document.createElement("style");
                        t.style.type = "text/css";
                        t.style.id = e;
                        Advertone.settings.head.appendChild(t.style)
                    }
                    t.style.id = e;
                    var n = this.make_css_text(e, t);
                    if (!t.style.styleSheet) {
                        t.style.textContent = n
                    } else {
                        t.style.styleSheet.cssText = n
                    }
                };
                this.make_container = function(e, t, n, i, r, o) {
                    if (!e) e = "div";
                    var s = document.createElement(e);
                    if (t) s.setAttribute("class", t);
                    if (n) s.setAttribute("id", n);
                    if (i) s.setAttribute("style", i);
                    if (r) s.innerHTML = r;
                    if (o) o.appendChild(s);
                    return s
                }
            };
            var L = function() {
                this.getRealization = function(e) {
                    try {
                        return this[e]
                    } catch (t) {
                        return this["noopAnimation"]
                    }
                }
            };
            var S = function() {
                s(this, L);
                this.noopAnimation = new u("noopAnimation");
                this.flipper = new d("flipper");
                this.slider1 = new f("slider1", false);
                this.slider = new f("slider", true);
                this.dissolve = new g("dissolve");
                this.cube = new m("cube", false);
                this.inversed_cube = new m("inversed_cube", true);
                this.card = new h("card")
            };
            var T = new S;
            var B = function() {
                s(this, L);
                this.noopAnimation = new y("noopAnimation");
                this.white_snow = new b("white_snow");
                this.glow = new k("glow");
                this.banner_quake = new A("banner_quake")
            };
            var x = new B;
            var C = function() {
                s(this, L);
                this.noopAnimation = new p("noopAnimation");
                this.increase = new _("increase")
            };
            var P = new C;
            var D = function(t) {
                s(this, BaseAnimation);
                var n = {
                    transitionReadyToStart: 0,
                    delayComplete: 1,
                    effectBeforeTransition: 2,
                    interactiveBeforeTransition: 3,
                    effectAfterTransition: 4,
                    interactiveAfterTransition: 5,
                    unwarped: 6
                };
                var i = this;
                var r = new a;

                function o(e) {
                    return e && e.n ? e.n : "noopAnimation"
                }

                function l(e) {
                    if (!e.state.flags.checkAll(n.effectAfterTransition, n.interactiveAfterTransition, n.unwarped)) {
                        return
                    }
                    e.state.nowState = r.inactive
                }

                function c(e) {
                    e.state.flags.set(n.effectAfterTransition);
                    l(e)
                }

                function u(e) {
                    e.state.flags.set(n.interactiveAfterTransition);
                    l(e)
                }

                function d(e) {
                    e.state.flags.set(n.unwarped);
                    l(e)
                }

                function f(e) {
                    e.state.timeouts.set("effectAfterTransition", function() {
                        e.effect.library.actAfterTransitionAsync(e, function() {
                            c(e)
                        })
                    }, 0);
                    e.state.timeouts.set("interactiveAfterTransition", function() {
                        e.interactive.library.actAfterTransitionAsync(e, function() {
                            u(e)
                        })
                    }, 0);
                    e.state.timeouts.set("transitionAfterUnwarp", function() {
                        e.transition.library.unwarpAsync(e, function() {
                            d(e)
                        })
                    }, 0);
                    e.state.nowState = r.restoring;
                    e.ABlock.nav.animationSuccess(e.nowAnimation.loading)
                }

                function g(e) {
                    if (!e.state.flags.checkAll(n.effectBeforeTransition, n.interactiveBeforeTransition)) {
                        return
                    }
                    e.state.flags.dropAll();
                    e.state.timeouts.set("transitionInAction", function() {
                        e.transition.library.playAsync(e, function() {
                            f(e)
                        })
                    }, 0);
                    e.state.nowState = r.animating
                }

                function h(e) {
                    e.state.flags.set(n.effectBeforeTransition);
                    g(e)
                }

                function m(e) {
                    e.state.flags.set(n.interactiveBeforeTransition);
                    g(e)
                }

                function v(e) {
                    if (!e.state.flags.checkAll(n.transitionReadyToStart, n.delayComplete)) {
                        return
                    }
                    e.state.flags.dropAll();
                    var t = e.effect.library.getBeforeTransitionTime(e);
                    var i = e.interactive.library.getBeforeTransitionTime(e);
                    var o = Math.max(t, i);
                    e.state.timeouts.set("effectBeforeTransition", function() {
                        e.effect.library.actBeforeTransitionAsync(e, function() {
                            h(e)
                        })
                    }, t);
                    e.state.timeouts.set("interactiveBeforeTransition", function() {
                        e.interactive.library.actBeforeTransitionAsync(e, function() {
                            m(e)
                        })
                    }, i);
                    e.state.nowState = r.ready
                }

                function p(e) {
                    e.state.flags.set(n.delayComplete);
                    v(e)
                }

                function _(e) {
                    e.state.flags.set(n.transitionReadyToStart);
                    v(e)
                }

                function y(e, t) {
                    e.state.timeouts.set("mayStartAnimation", function() {
                        p(e)
                    }, t);
                    var n = e.nowAnimation.unloading = e.ABlock.nav.getCurrentBlock();
                    if (n == e.nowAnimation.loading && !window.AdvertoneDashboardMode) {
                        e.ABlock.nav.animationSuccess(n);
                        e.state.nowState = r.inactive;
                        return
                    }
                    if (n) {
                        if (e.transition.library.name == "noopAnimation") {
                            e.transition.state.needRestyle = true;
                            e.transition.state.settingsChanged = true
                        }
                        e.transition.library = T.getRealization(o(e.transition.settings))
                    } else {
                        e.transition.library = T.getRealization("noopAnimation")
                    }
                    var i = e.transition.library.getPrepareTime(e);
                    if (t > i << 1) {
                        t = t - i * 1.5
                    } else if (t > i) {
                        t = t - i
                    }
                    e.state.timeouts.set("transitionPrepareAsyncCallback", function() {
                        e.state.nowState = r.prepare;
                        e.transition.library.prepareAsync(e, function() {
                            _(e)
                        })
                    }, t);
                    e.state.timeouts.set("CheckResize", function() {
                        L(e)
                    }, w)
                }
                this.show = function(t, n) {
                    e.console("Show! " + t.bid);
                    var i = this.blockData[t.bid];
                    var r = n ? 0 : i.delay;
                    b(i, r, t)
                };

                function b(e, t, n) {
                    if (e.state.nowState == r.restoring) {
                        var i = 10;
                        e.state.timeouts.set("waitToRestore", function() {
                            b(e, t - i, n)
                        }, i)
                    } else k(e, t, n)
                }

                function k(e, t, n) {
                    if (e.state.nowState == r.waiting) {
                        e.state.timeouts.clear_all();
                        e.state.nowState = r.inactive
                    }
                    if (e.state.nowState != r.inactive) {
                        e.ABlock.nav.animationFail("Анимация уже проигрывается", e.nowAnimation.loading);
                        return
                    }
                    e.state.flags.dropAll();
                    e.nowAnimation.loading = n;
                    e.state.nowState = r.waiting;
                    var i = e.transition.library.getPrepareTime(e) << 1;
                    var o = Math.max(t - i, 0);
                    e.state.timeouts.set("ShowTimeout", function() {
                        y(e, t - o)
                    }, o)
                }

                function A(e) {
                    return new DimensionObject(e)
                }
                var w = window.AdvertoneDashboardMode ? 10 : 500;

                function L(e) {
                    var t = e.ABlock.c.outest.clientWidth,
                        n = e.ABlock.c.outest.clientHeight;
                    if (window.AdvertoneDashboardMode) {
                        previewTransForm(t, n)
                    }
                    if (e.state.width.total != t || e.state.height.total != n) {
                        e.state.width.total != t;
                        e.state.height.total != n;
                        e.resize()
                    }
                    e.state.timeouts.set("CheckResize", function() {
                        L(e)
                    }, w)
                }
                this.init = function(e) {
                    this.parent.init.call(this, e);
                    var t = this.blockData[e.id],
                        n = this,
                        i = t.state;
                    t.transition.library = T.getRealization(o(t.transition.settings));
                    t.transition.settings = t.transition.library._init_settings(t.transition.settings);
                    t.effect.library = x.getRealization(o(t.effect.settings));
                    t.effect.settings = t.effect.library._init_settings(t.effect.settings);
                    t.interactive.library = P.getRealization(o(t.interactive.settings));
                    t.interactive.settings = t.interactive.library._init_settings(t.interactive.settings);
                    t.fail = function(i) {
                        t.ABlock.nav.animationFail(i, t.nowAnimation.loading);
                        n.stopAll(e)
                    };
                    t.resize = function() {
                        t.transition.library.onresize(t);
                        t.effect.library.onresize(t);
                        t.interactive.library.onresize(t)
                    }
                };
                this.stopAll = function(e, t) {
                    var n = 0,
                        i = this,
                        r = this.blockData[e.id],
                        o = function() {
                            n++;
                            if (n == 3) {
                                i.parent.stopAll.call(i, e);
                                if (t) t()
                            }
                        };
                    r.transition.library.unwarpAsync(r, o);
                    r.effect.library.destroyAsync(r, o);
                    r.interactive.library.destroyAsync(r, o)
                };
                var S = t.inited();
                for (var B = 0; B < S.length; ++B) this.init(S[B])
            };
            return new D(Advertone.Animation)
        };

        function check_animation() {
            Logger.log(201);
            var e = Advertone.settings,
                t, n, i, r, o;
            if (e.animate) return;
            r = document.createElement("p"), i, t = {
                webkitTransform: "-webkit-transform",
                OTransform: "-o-transform",
                msTransform: "-ms-transform",
                MozTransform: "-moz-transform"
            };
            if (window.getComputedStyle(r, null) == null) {
                Advertone.timeouts.set("wait_getComputedStyle", check_animation, 100);
                return
            }
            e.body.insertBefore(r, null);
            Logger.log(220);
            for (o in t) {
                if (typeof r.style[o] !== "undefined") {
                    r.style[o] = "translate3d(1px,1px,1px)";
                    i = window.getComputedStyle(r, null).getPropertyValue(t[o]);
                    Logger.log(221);
                    n = t[o].split("-")[1];
                    Logger.log(216);
                    n && (e.cr_br_prefix = n)
                }
            }
            if (!e.cr_br_prefix) {
                e.cr_br_prefix = ""
            }
            e.body.removeChild(r);
            e.animate = i !== undefined && i.length > 0 && i !== "none";
            if (e.animate) Advertone.Animation = initAnimation();
            Logger.console("Animation made.")
        }
        Advertone.Timeouts = function() {
            var e = this;
            e.timeouts = {};
            Advertone.timoutsRefs.push(this)
        };
        Advertone.Timeouts.prototype.set = function(e, t, n) {
            var i = this;
            i.clear(e);
            i.timeouts[e] = setTimeout(function() {
                if (!t) i.clear(e);
                t()
            }, n)
        };
        Advertone.Timeouts.prototype.clear = function(e) {
            var t = this;
            if (t.timeouts[e]) {
                clearTimeout(t.timeouts[e]);
                delete t.timeouts[e]
            }
        };
        Advertone.Timeouts.prototype.clear_all = function() {
            var e = this,
                t;
            for (t in e.timeouts) e.clear(t)
        };
        Advertone.timeouts = new Advertone.Timeouts;
        Advertone.Intervals = function() {
            var e = this;
            e.intervals = {};
            Advertone.timoutsRefs.push(this)
        };
        Advertone.Intervals.prototype.set = function(e, t, n, i) {
            var r = this;
            r.clear(e);
            r.intervals[e] = {
                num: i,
                id: setInterval(function() {
                    var n = r.intervals[e].num;
                    if (n !== undefined && +n <= 0 || !t) {
                        r.clear(e)
                    } else {
                        r.intervals[e].num--
                    }
                    t()
                }, n)
            }
        };
        Advertone.Intervals.prototype.clear = function(e) {
            var t = this;
            if (t.intervals[e]) {
                clearInterval(t.intervals[e].id);
                delete t.intervals[e]
            }
        };
        Advertone.Intervals.prototype.clear_all = function() {
            var e = this,
                t;
            for (t in e.intervals) e.clear(t)
        };
        Advertone.intervals = new Advertone.Intervals;
        var queueFuncBody = [],
            checkBody;

        function guarantyBody(e, t) {
            if (A_s.body) return t();
            if (A_t.inArray(queueFuncBody, t) == -1) {
                queueFuncBody.push(t)
            }
            if (checkBody === undefined) {
                checkBody = function() {
                    if (!A_s.body) A_s.body = document.getElementsByTagName("body")[0];
                    if (A_s.body) {
                        Advertone.intervals.clear("checkBody");
                        for (var e = 0, t = queueFuncBody.length; e < t; ++e) {
                            queueFuncBody[e]()
                        }
                        queueFuncBody = undefined;
                        return true
                    }
                    return false
                };
                if (!checkBody()) Advertone.intervals.set("checkBody", checkBody, 10)
            }
        }
        var queueFuncDocumentReady = [],
            checkDocumentReady;

        function guarantyDocumentReady(e, t) {
            if (A_s.dom_ready) return t();
            if (A_t.inArray(queueFuncDocumentReady, t) == -1) {
                queueFuncDocumentReady.push(t)
            }
            if (checkDocumentReady === undefined) {
                checkDocumentReady = function() {
                    if (!A_s.dom_ready) A_s.dom_ready = document.readyState === "complete";
                    if (A_s.dom_ready) {
                        Advertone.intervals.clear("checkDocumentReady");
                        for (var e = 0, t = queueFuncDocumentReady.length; e < t; ++e) {
                            queueFuncDocumentReady[e]()
                        }
                        queueFuncDocumentReady = undefined;
                        return true
                    }
                    return false
                };
                if (!checkDocumentReady()) Advertone.intervals.set("checkDocumentReady", checkDocumentReady, 10)
            }
        }
        guarantyBody("check_animation_wait", check_animation);
        Advertone.Detect = new Detector;
        var is_ie = Advertone.Detect.isIE();
        Advertone.clickCounter = new ClickCounter;
        if (is_ie) {
            A_t.objUpdate(A_s, {
                isIE: is_ie,
                isIE8: is_ie && is_ie <= 8,
                isIE9: is_ie && is_ie <= 9,
                isIE10: is_ie && is_ie <= 10
            })
        }
        Advertone.makeOneABlock = function(e) {
            Logger.console("Make Ablock");
            Logger.console("Make Ablock for: " + e.getAttribute(A_s.data_ablock));
            Logger.console("Make One Ablock!");
            Logger.console(e);
            Logger.log(202);
            var t = e.getAttribute(A_s.data_ablock),
                n = Advertone.t,
                i = A_s.ALIAS,
                r, o, s, a;
            if (!window.AdvertoneDashboardMode) advertone_block_id = undefined;
            if (!t || Advertone.aBlocks[t] !== undefined) return;
            Advertone.aBlocks[t] = {};
            r = Advertone.aBlocks[t];
            if (window.updateInDashboard !== undefined) r.updateInDashboard = updateInDashboard;
            r.id = t;
            r.ccp = A_s.container_class_prefix;
            r.prf = A_s.container_class_prefix + r.id + "_";
            r.settings = {
                thisNode: e,
                rotation_type: A_s.ROTATION_TYPES.STATIC,
                animate: undefined,
                bix: undefined,
                sbpk: undefined,
                numsplts: undefined,
                timeout: 0,
                width: 0,
                height: 0
            };
            o = r.settings;
            r.animate = undefined;
            r.timeouts = new Advertone.Timeouts;
            r.intervals = new Advertone.Intervals;
            r.nav = undefined;
            r.c = {};

            function l(e, t, i) {
                var o;
                t = Math.max(--t, 0);
                for (o = 1; o <= e + t; ++o) {
                    r.c[-o] = n.create_container(r, !0, !0)
                }
                for (o = 1; o < e + t; ++o) {
                    r.c[-o - 1].appendChild(r.c[-o])
                }
                for (o = e + 1; o <= e + t; ++o) {
                    c_name = objname("outest_" + (o - e));
                    r.c["outest-" + (o - e)] = r.c[-o]
                }
                r.c["outest"] = r.c[-e];
                if (!A_s.animate) r.c["outest"].style.overflow = "hidden";
                r.c["outest_created"] = r.c[-e - t];
                r.c[-1].setAttribute("class", A_s.container_class_prefix + r.id + "_" + A_s.main_div_id);
                r.c["outest_outest"] = i;
                i.appendChild(r.c["outest_created"])
            }
            l(3, 1, o.thisNode);
            Logger.log(204);
            r.onSuccess = function(e) {
                Logger.log(205);
                var t = this;
                t.success_load = true;
                t.init_data(e)
            };
            r.onError = function(e) {
                Logger.error(206, e);
                var t = this,
                    n = Advertone.settings;
                if (!e) e = ",..";
                data = {
                    abl: {
                        animate: {},
                        rotation_type: n.ROTATION_TYPES.STATIC,
                        width: "100px",
                        height: "20px"
                    },
                    tbl: [{
                        sid: -5,
                        tbid: -5,
                        lock_type: 0,
                        code: '<p style="margin:0;">' + e + "</p>"
                    }]
                };
                Advertone.Gsys.setSystem([{
                    sid: -5
                }]);
                t.init_data(data)
            };
            r.init_data = function(e) {
                Logger.log(207);
                var t = this,
                    n = t.settings,
                    i = e.abl;
                if (i) {
                    n.width = i.width;
                    n.height = i.height;
                    n.bix = i.bix;
                    n.sbpk = i.sbpk;
                    n.numsplts = i.numsplts;
                    n.limit = i.limit;
                    n.timeout = i.timeout || 0;
                    n.force_slider_order = i.force_slider_order;
                    n.rotation_type = i.rotation_type === 0 ? i.rotation_type : i.rotation_type || -1;
                    if (!t.dashboardMode) {
                        n.animate = {
                            interactive: i.animate && i.animate.interactive || "",
                            effect: i.animate && i.animate.effect || "",
                            transition: i.animate && i.animate.transition || ""
                        }
                    }
                }
                Advertone.Animation.init(t);
                t.nav = NavigationFactory.create(t, e.tbl || []);
                t.del_tr_script()
            };
            r.del_tr_script = function() {
                Logger.log(208);
                var e = this,
                    t = e.traf_scr;
                if (t && e.settings.thisNode) {
                    if (t.parentNode) t.parentNode.removeChild(t);
                    e.traf_scr = undefined
                }
            }
        };
        Advertone.deferredTBlocks = [];
        Advertone.checkReadyState = function(e) {
            Advertone.intervals.set(timeoutNames.checkReadyState, function() {
                if (window.AdvertoneDashboardMode || document.readyState === "complete") {
                    A_s.dom_ready = !0;
                    Advertone.timeouts.set(timeoutNames.deferredTBlocks, function() {
                        for (var e = 0, t = Advertone.deferredTBlocks, n = t.length; e < n; e++) {
                            Advertone.Gsys.ask(t[e])
                        }
                        Advertone.deferredTBlocks = []
                    }, 100);
                    Advertone.checkReadyState(1e4)
                }
                Advertone.makeABlocks()
            }, e)
        };
        var makeABlockDiv = function(e) {
                var t = document.createElement("div");
                t.setAttribute("class", A_s.block_class);
                t.setAttribute(A_s.data_ablock, e);
                return t
            },
            groupsIds = [];
        Advertone.makeABlocks = function() {
            Logger.console("Make Ablocks!");
            Logger.log(209);
            if (!A_s.body) {
                guarantyBody("getBody", Advertone.makeABlocks);
                return
            }
            var A_t = Advertone.t,
                A_DD = Advertone.Detect.Device,
                aBlocksDivs = A_t.getElementsByClass(A_s.block_class, A_s.body),
                aBlocks = Advertone.aBlocks,
                i, ids = [],
                tr_s, xdr, id, in_group, url = A_s.BASE_URL + "/get_code/?blocks=",
                animon = A_s.animate ? 1 : 0,
                refSys = refHandler(),
                dvc = A_DD.getDevice(),
                mob = A_DD.getType();
            Logger.console("Device " + dvc);
            for (i = 0; i < aBlocksDivs.length; ++i) {
                if (!aBlocksDivs[i].getAttribute(A_s.data_loaded)) {
                    id = aBlocksDivs[i].getAttribute(A_s.data_ablock);
                    aBlocksDivs[i].setAttribute(A_s.data_loaded, true);
                    in_group = aBlocksDivs[i].getAttribute(A_s.data_group);
                    if (!aBlocks[id] && A_t.inArray(ids, id) == -1) {
                        if (!in_group) {
                            ids.push(id)
                        } else if (groupsIds && A_t.inArray(groupsIds, id) == -1) {
                            groupsIds.push(id)
                        }
                    }
                }
            }
            if (A_s.dom_ready && groupsIds) {
                Logger.console("Make Ablocks! final");
                ids = ids.concat(groupsIds);
                groupsIds = undefined
            }
            Logger.console("IDS:" + ids.length + " " + ids.join(" "));
            Logger.console("dom_ready = " + A_s.dom_ready + ", groupsIds = " + groupsIds);
            if (ids.length) {
                if (window.location.href.indexOf("mytracklist") > -1) {
                    postData(Advertone.settings.STAT_URL + "/gc", {
                        bps: ids.join(",")
                    })
                }++Advertone.getcode_count;
                url += ids.join(",");
                url += "&prw=" + (window.AdvertoneDashboardMode ? 1 : 0);
                url += "&anim=" + animon;
                if (refSys) {
                    url += "&rfs=" + refSys
                }
                Logger.console("Will make one a block " + aBlocksDivs.length + " times!");
                for (i = 0; i < aBlocksDivs.length; ++i) Advertone.makeOneABlock(aBlocksDivs[i]);

                function checkCallback() {
                    for (var e = 0; e < aBlocks.length; ++e) {
                        if (aBlocks[e].success_load) continue;
                        aBlocks[e].onError();
                        Logger.error(215, "checkCallback failed!")
                    }
                }
                Logger.log(222);
                Logger.console(ids.toString() + !!window.XDomainRequest);
                if ("" == "v" && window.XDomainRequest) {
                    Logger.log(223);
                    url += "&ie=1";
                    var id = ids[0];
                    xdr = new XDomainRequest;
                    if (xdr) {
                        xdr.onerror = checkCallback;
                        xdr.ontimeout = checkCallback;
                        xdr.onload = function() {
                            eval(xdr.responseText);
                            checkCallback()
                        };
                        xdr.timeout = 1e3;
                        try {
                            xdr.open("GET", url);
                            xdr.send()
                        } catch (e) {
                            Logger.log(225, ",,.");
                            Logger.error(225, e);
                            aBlocks[id].onError(",,.")
                        }
                    } else {
                        Logger.error(226, ",,..");
                        aBlocks[id].onError(",,..")
                    }
                } else {
                    Logger.log(224);
                    Logger.console("Start script: 224");
                    tr_s = document.createElement("script");
                    tr_s[A_A.onrSc] = function() {
                        var e = Advertone.getcode_count;
                        if (tr_s[A_A.rS] == "loaded") {
                            Advertone.timeouts.set(timeoutNames.checkCallback + e, checkCallback, 1e3)
                        } else if (tr_s[A_A.rS] == "complete") {
                            tr_s[A_A.onrSc] = null;
                            Advertone.timeouts.clear(timeoutNames.checkCallback + e);
                            setTimeout(checkCallback, 0)
                        }
                    };
                    tr_s.onload = tr_s.onerror = checkCallback;
                    tr_s.src = url;
                    Logger.console("Load script " + url);
                    A_s.head.appendChild(tr_s)
                }
            }
            Logger.log(212);
            Logger.console("Ablocks made!");
            var keys = [];
            for (var k in Advertone.aBlocks) keys.push(k);
            if (window.location.href.indexOf("mytracklist") > -1 && !Advertone.block_not_found) {
                postData(Advertone.settings.STAT_URL + "/mb", {
                    bps: keys.join(","),
                    dr: +Advertone.settings.dom_ready
                });
                if (keys.length) {
                    Advertone.block_not_found = !0
                }
            }
        };
        Logger.log(213);
        window.theObject.make = Advertone.makeABlocks;
        Advertone.makeABlocks();
        Advertone.checkReadyState(500);
        Logger.log(214)
    } catch (e) {
        if (window.theObject && window.theObject.Logger) {
            window.theObject.Logger.error(5900, e);
            window.theObject.Logger.send();
            window.theObject.Logger.console("Error cought!");
            window.theObject.Logger.console(e.message);
            window.theObject.Logger.console(e.stack);
            throw e
        }
    }
})();