(function() {
  var $$, app, log_error, report_error, set_language;

  report_error = function(message) {
    return alert(message);
  };

  log_error = function(error) {
    return console.error(error);
  };

  window.onerror = function(msg, url, line, col, error) {
    var extra, ref, ref1;
    log_error(error);
    extra = (ref = !col) != null ? ref : {
      '': '\ncolumn: ' + col
    };
    extra += (ref1 = !error) != null ? ref1 : {
      '': '\nerror: ' + error
    };
    report_error("Error: " + msg + "\nurl: " + url + "\nline: " + line + extra);
    return true;
  };

  angular.module('ErrorCatcher', []).factory('$exceptionHandler', function() {
    return function(exception, cause) {
      log_error(exception);
      return report_error(exception.message);
    };
  });

  $$ = angular.element;

  app = angular.module("app", ['ngRoute', 'ngSanitize', 'ngMessages', 'ui.bootstrap', 'lvl.directives.dragdrop', 'angular-svg-round-progress', 'angularFileUpload', 'pascalprecht.translate', 'ErrorCatcher']).config(["$translateProvider", function($translateProvider) {
    var key, value;
    for (key in i18n) {
      value = i18n[key];
      $translateProvider.translations(key, value);
      $translateProvider.useSanitizeValueStrategy('escape');
    }
    return $translateProvider.fallbackLanguage('en_US');
  }]);

  this.$$ = jQuery;

  this.app = app;

  $$(document).ready(function() {
    var html;
    html = document.getElementsByTagName('html')[0];
    html.setAttribute('ng-app', 'app');
    html.dataset.ngApp = 'app';
    return angular.bootstrap(html, ['app']);
  });

  set_language = (function(_this) {
    return function(language, $translate) {
      var i, len, page, ref, results;
      $translate.use(language);
      ref = _this.pages;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        page = ref[i];
        results.push(page.title = $translate.instant("page." + page.page + ".title"));
      }
      return results;
    };
  })(this);

  app.controller("AppCtrl", ["$scope", "$rootScope", "$location", "$filter", "$q", "$timeout", "$translate", "log", "api", "Device", "Device_routing", "Device_GUI", "GUI", "Port", "Rule", "Configuration", "Configurations", "Enums", "Status", "Model", "Device_settings", "Version", "Login", "translate", "Routing_model_errors", "Port_view", "Port_numeration", "Promises", "Browser", function($scope, $rootScope, $location, $filter, $q, $timeout, $translate, log, api, Device, Device_routing, Device_GUI, GUI, Port, Rule, Configuration, Configurations, Enums, Status, Model, Device_settings, Version, Login, translate, Routing_model_errors, Port_view, Port_numeration, Promises, Browser) {
    var default_route, determine_current_page, proceed_loading, when_device_is_booted;
    report_error = function(message) {
      return Status.error(message);
    };
    log_error = function(error) {
      console.error(error);
      return log.error(error);
    };
    $scope.key_handlers = [];
    $scope.on_key = function(action) {
      var handler_id;
      handler_id = Keyboard_listener.on(action);
      this.key_handlers.push(handler_id);
      return handler_id;
    };
    $scope.off_key = function(handler_id) {
      this.key_handlers.remove(handler_id);
      return Keyboard_listener.off(handler_id);
    };
    Keyboard_listener.on(function(key) {
      if (key.is('F1', {
        swallow: true
      })) {
        return log.download();
      }
    });
    $rootScope.countWatchers = function() {
      var q, scope, watchers;
      q = [$rootScope];
      watchers = 0;
      scope = void 0;
      while (q.length > 0) {
        scope = q.pop();
        if (scope.$$watchers) {
          watchers += scope.$$watchers.length;
        }
        if (scope.$$childHead) {
          q.push(scope.$$childHead);
        }
        if (scope.$$nextSibling) {
          q.push(scope.$$nextSibling);
        }
      }
      window.console.log('Watchers count ----', watchers);
    };
    $$(document).on('keydown', (function(_this) {
      return function(event) {
        if (event.keyCode !== 27) {
          return;
        }
        return $scope.$apply(function() {
          if (window.closeable_by_escape && !window.closeable_by_escape.is_empty()) {
            return window.closeable_by_escape.pop()();
          }
        });
      };
    })(this));
    $rootScope.state = {};
    $scope.state.is_application_loaded = false;
    $scope.when_loaded = function(action) {
      var unbind;
      if ($rootScope.state.is_application_loaded) {
        return action();
      }
      return unbind = $scope.$on('application loaded', function() {
        unbind();
        return action();
      });
    };
    $scope.initialize_page_with = function(initializer) {
      var initialization;
      initialization = function() {
        var finish, promise;
        $rootScope.loading_page = true;
        promise = initializer();
        finish = function() {
          return $rootScope.safeApply(function() {
            return $rootScope.loading_page = false;
          });
        };
        if ((promise == null) || (promise["finally"] == null)) {
          return finish();
        } else {
          return promise.then(finish);
        }
      };
      $rootScope.page_initializer = initialization;
      return $scope.when_loaded(initialization);
    };
    $rootScope.initialize_page = function() {
      if ($rootScope.page_initializer != null) {
        return $rootScope.page_initializer();
      }
    };
    $rootScope.application_loaded = function() {
      $rootScope.state.is_application_loaded = true;
      return $rootScope.$broadcast('application loaded');
    };
    $scope.on_upload_configuration = function(files) {
      return Configurations.upload(files[0]);
    };
    $rootScope.block_event = function(event) {
      event.stopPropagation();
      return event.preventDefault();
    };
    $rootScope.safeApply = function(fn) {
      var phase;
      phase = this.$root.$$phase;
      if (phase === '$apply' || phase === '$digest') {
        if (fn && typeof fn === 'function') {
          return fn();
        }
      } else {
        return this.$apply(fn);
      }
    };
    $scope.remember = function() {
      var key, rem;
      key = 'rem' + $location.path().replace('/', '-');
      rem = localStorage.getItem(key);
      rem = rem ? JSON.parse(rem) : {};
      switch (arguments.length) {
        case 1:
          return rem[arguments[0]];
        case 2:
          rem[arguments[0]] = arguments[1];
          localStorage.setItem(key, JSON.stringify(rem));
          return arguments[1];
      }
    };
    $scope.periodical_promised = function(action, period) {
      var again, is_cancelled, tick, timeout;
      timeout = null;
      is_cancelled = false;
      again = function() {
        if (is_cancelled) {
          return;
        }
        return timeout = $timeout(tick, period);
      };
      tick = function() {
        return action()["finally"](again);
      };
      tick();
      return {
        cancel: function() {
          is_cancelled = true;
          if (timeout) {
            $timeout.cancel(timeout);
            return timeout = null;
          }
        }
      };
    };
    $rootScope.initialize_application = function() {
      Status.busy();
      return Device_routing.LBG.Hash_profile.fetch_all().then(function() {
        return Configuration.Network.load_into_model();
      }).then(function() {
        Model.rules = [];
        return Configuration.read_local_routing_configuration().then(function() {
          return Model.rules = $rootScope.routing.rules;
        }).then(function() {
          return Status.idle();
        }).then(function() {
          if (Browser.validate() === false) {
            return Status.progress(Browser.getErrorMessage());
          }
        })["catch"](function(error) {
          if (api.is_api_error(error)) {
            return;
          }
          if (Routing_model_errors.is(error)) {
            return Status.error(Routing_model_errors.message(error));
          }
          log.error(error);
          return Status.error(translate('configuration.error.configuration_upload_failed'));
        });
      }).then(function() {
        return $scope.application_loaded();
      }).then(function() {
        return Device_GUI.refresh_port_coordinates();
      });
    };
    $rootScope.urge_port_refresh = function() {
      if ($rootScope.port_refresher) {
        $rootScope.port_refresher.cancel();
      }
      $rootScope.start_periodical_port_refresh();
      return true;
    };
    $rootScope.start_periodical_port_refresh = function() {
      return $rootScope.port_refresher = $scope.periodical_promised(Device.refresh_ports, $scope._port_state_refresh_interval * 1000);
    };
    $rootScope.scroll_by = function(scroll_by) {
      var delayed;
      $rootScope.window_scroll_by = false;
      delayed = function() {
        return $rootScope.safeApply(function() {
          return $rootScope.window_scroll_by = scroll_by;
        });
      };
      return delayed.delay(0);
    };
    $rootScope.not_authenticated = function() {
      Status.not_authenticated();
      return Login.not_authenticated();
    };
    $rootScope.show_navigation_confirmation = function() {
      return $rootScope.next_route;
    };
    $rootScope.dont_navigate_away = function() {
      return $rootScope.next_route = null;
    };
    $rootScope.navigate_away = function() {
      if (Promises.pending()) {
        Promises.cancel();
        Promises.reset();
        Status.not_busy();
      }
      $location.path($rootScope.next_route.$$route.originalPath);
      return $rootScope.next_route = null;
    };
    $rootScope.log = log;
    $rootScope.Enums = Enums;
    $rootScope.GUI = GUI;
    $rootScope.Device_GUI = Device_GUI;
    $rootScope.Port = Port;
    $rootScope.Port_view = Port_view;
    $rootScope.Port_numeration = Port_numeration;
    $rootScope.Rule = Rule;
    $rootScope.Configuration = Configuration;
    $rootScope.Configurations = Configurations;
    $rootScope.model = Model;
    $rootScope.Status = Status;
    $rootScope.Device_settings = Device_settings;
    $rootScope.Login = Login;
    $scope.pages = pages;
    $scope.floor = Math.floor;
    $scope.ceiling = Math.ceil;
    $scope.is_set = function(x) {
      return x != null;
    };
    $rootScope.unmasked_acl_filter_types = ['ethernet_protocol', 'IP_protocol', 'multi_IP_address', 'IP_protocol_source', 'IP_protocol_destination', 'Level4_data'];
    $scope.now = new Date();
    $rootScope.timeouts = [];
    Promises.reset();
    $rootScope.data = {};
    $rootScope.stats = {
      ports: {}
    };
    $rootScope.view = {
      ports: {}
    };
    $rootScope.groups = [];
    $scope._port_state_refresh_interval = 2;
    if ($location.path() === "/") {
      default_route = pages.filter(function(route) {
        return route.first_screen;
      })[0];
      if (default_route) {
        $location.url(default_route.url, true);
      }
    }
    $scope.body = $$(document.body);
    $scope.location = $location;
    determine_current_page = function() {
      $rootScope.this_page = pages.filter(function(route) {
        return route.url === $location.$$path;
      })[0];
      document.title = $rootScope.this_page.title;
      return $timeout(function() {
        var i, len, results, route;
        results = [];
        for (i = 0, len = pages.length; i < len; i++) {
          route = pages[i];
          if ($rootScope.this_page === route) {
            results.push($scope.body.addClass(route.page + '_page'));
          } else {
            results.push($scope.body.removeClass(route.page + '_page'));
          }
        }
        return results;
      });
    };
    determine_current_page();
    $scope.$on('$routeChangeStart', function(event, next, current) {
      var handler_id, i, len, ref;
      if (!Promises.pending()) {
        ref = $scope.key_handlers;
        for (i = 0, len = ref.length; i < len; i++) {
          handler_id = ref[i];
          $scope.off_key(handler_id);
        }
        return;
      }
      event.preventDefault();
      $rootScope.next_route = next;
      Promises.wait();
      return Promises.when_done(function() {
        if ($rootScope.next_route !== next) {
          return;
        }
        return $rootScope.safeApply(function() {
          return $rootScope.navigate_away();
        });
      });
    });
    $scope.$on('$routeChangeSuccess', function(scope, next, current) {
      var i, len, ref, timeout;
      determine_current_page();
      ref = $rootScope.timeouts;
      for (i = 0, len = ref.length; i < len; i++) {
        timeout = ref[i];
        log.info('Cancelling timeout');
        $timeout.cancel(timeout);
      }
      return $rootScope.timeouts = [];
    });
    Status.busy();
    configuration.version = Version(configuration.version);
    $rootScope.configuration = configuration;
    set_language(configuration.language, $translate);
    angular.extend(Device_settings, $rootScope.configuration.device);
    delete $rootScope.configuration.device;
    Enums.ACL_Filter.Level4_data.mask.bits = Device_settings.level_4_data_max_bytes * 8;
    proceed_loading = function() {
      return Device.initialize().then(function(result) {
        $rootScope.safeApply(function() {
          return $rootScope.device_is_booting = false;
        });
        return when_device_is_booted(result);
      })["catch"](api.error.device_is_booting_up, function(error) {
        $rootScope.safeApply(function() {
          return $rootScope.device_is_booting = true;
        });
        return setTimeout(proceed_loading, 1000);
      })["catch"](function(error) {
        log.error(error);
        return Status.error(error);
      });
    };
    proceed_loading();
    return when_device_is_booted = function() {
      return Promise.resolve(true).then(function() {
        return $scope.safeApply(function() {
          Device_GUI.initialize();
          if ($rootScope.this_page.page !== 'debug') {
            $rootScope.start_periodical_port_refresh();
          }
          $rootScope.application_view_ready = true;
          return true;
        });
      }).then(function() {
        return Login.authenticate();
      }).then(function(user) {
        $rootScope.user = user;
        $rootScope.$broadcast('refresh height');
        return $rootScope.initialize_application();
      })["catch"](api.error.not_authenticated, function(error) {
        if (!$rootScope.application_view_ready) {
          alert(translate('error.unauthenticated'));
          return log.error(error);
        } else {
          Status.idle();
          return $scope.safeApply(function() {
            return Login.not_authenticated();
          });
        }
      })["catch"](function(error) {
        log.error(error);
        return Status.error(error.message);
      });
    };
  }]);

  app.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
    var i, len, page, results, route;
    $locationProvider.html5Mode(true);
    results = [];
    for (i = 0, len = pages.length; i < len; i++) {
      route = pages[i];
      page = {
        templateUrl: '/pages/' + route.page + '.html'
      };
      if (route.controller) {
        page.controller = route.controller;
      }
      results.push($routeProvider.when(route.url, page));
    }
    return results;
  }]);

}).call(this);

(function() {
  function getSymbol(translate) {
    var symbol = ['bps', 'kbps', 'Mbps', 'Gbps'];
    return symbol.map(function (rate) {
      return translate('network.rate.' + rate)
    });
  }
  /* Округление */
  function precise_round(num, decimals) { return num.toFixed(decimals); }

  // Фильтр для нахождения элемента по ключу
  app.filter("findkey", function() {
    return function(array, keyname, keyval, fieldname) {
      if (typeof(array) !== 'undefined') {
        var o = $.grep(array, function(i){ return (i[keyname] == keyval) });
        if (o.length) { if (fieldname) return o[0][fieldname]; else return o[0]; }
        return false;
      }
    }
  });

  // Фильтр для нахождения списка элемента по ключу
  app.filter("findkeyarr", function() {
    return function(array, keyname, keyval, exist) {
      if (typeof(array) !== 'undefined') {
        var o = $.grep(array, function(i){ return (!exist) ? i[keyname] != keyval : i[keyname] == keyval; });
        return o;
      }
    }
  });

  /* Форматирование скорости передачи данных. Вход: байты ("октеты") в секунду */
  app.filter("rateformat", ["translate", function(translate) {
    return function(rate) {
      // градации

      var symbol = getSymbol(translate);

      var base = 1000, rank = 0;
      // преобразовать из байтов ("октетов") в секунду в биты в секунду
      rate = (!rate || +rate<=0 ) ? 0 : rate*8;
      // выяснить наибольший rank данной величины
      if (rate!=0) {for (var i=1; i<=3; i++) if (rate >= base) {rate = rate / base; rank = i} }
      // округлить величину до первого знака после запятой (с учётом rank'а)
      rate = (rank>=1) ? precise_round(rate, 1) : precise_round(rate, 0);
      // вывести вместе с единицей измерения
      return (rate.toString().replace(/(\d)(?=(\d{3})+([^\d]|$))/g, "$1 ").replace(".", ",") + "\u00A0" + symbol[rank]);
    }
  }]);

  /* Форматирование скорости передачи данных. Вход: байты ("октеты") в секунду */
  app.filter("rateformatSpecial", ["translate", function(translate) {
    return function(rate) {
      // градации
      var symbol = getSymbol(translate), base = 1000, rank = 0;
      // преобразовать из байтов ("октетов") в секунду в биты в секунду
      rate = (!rate || +rate<=0 ) ? 0 : rate*8;

      if (rate == 0) return "—";

      // выяснить наибольший rank данной величины
      if (rate!=0) {for (var i=1; i<=3; i++) if (rate >= base) {rate = rate / base; rank = i} }
      // округлить величину до первого знака после запятой (с учётом rank'а)
      rate = (rank>=1) ? precise_round(rate, 1) : precise_round(rate, 0);
      // вывести вместе с единицей измерения
      return (rate.toString().replace(/(\d)(?=(\d{3})+([^\d]|$))/g, "$1 ").replace(".", ",") + "\u00A0" + symbol[rank]);
    }
  }]);

  // Фильтр, пропускающий только те значения, которые ещё не выбраны
  app.filter('unused_filter', function() {
    return function(complete_list, options) {
      return complete_list.filter(function(list_item) {
        return !options.is_used(list_item)
      });
    };
  });

  // Сначала нечётные
  app.filter('odd_first', function() {
    return function(values) {
      var result = [];

      var i;

      i = 0;
      while (i < values.length) {
        result.push(values[i]);
        i += 2;
      }

      i = 1;
      while (i < values.length) {
        result.push(values[i]);
        i += 2;
      }

      return result;
    };
  });
  /**
   * Фильтр для силы сигнала
   */
  app.filter('percent_number', function() {
    return function(value) {
      return value
        ? value + '%'
        : '';
    }
  });
  /**
   * Удаление "С" в конце значения температуры и добавление "°".
   */
  app.filter('sfp_temperature', function() {
    return function(value) {
      return value
        ? parseInt(value, 10) + '°'
        : value;
    };
  });
  /**
   * Установка пробела в строках между значением и единицой измерения
   * при их слитности.
   */
  app.filter('space_delimiter', function() {
    return function(value) {

      return value.replace(/[\d.\-+]+(?=[a-zA-Zа-яА-ЯёЁ])/g, function(part) {
        return part + ' ';
      })
    };
  });

})();
(function() {
  this.pages = [
    {
      url: "/ports",
      page: "ports",
      controller: "PortsCtrl",
      menu: true,
      first_screen: true
    }, {
      url: "/rules",
      page: "routing",
      controller: "RulesCtrl",
      menu: true,
      notitle: true,
      nopaddings: true
    }, {
      url: "/settings",
      page: "settings",
      controller: "SettingsCtrl",
      menu: true
    }, {
      url: "/debug",
      page: "debug",
      controller: "DebugCtrl",
      status: false
    }, {
      url: "/admin",
      page: "admin",
      controller: "AdminCtrl"
    }
  ];

}).call(this);

// Usage:
//
// $(document).on('keydown.global_hotkey', function(event)
// {
// 	if (Keyboard.is('Ctrl', 'z', event))
// 	{
// 		undo()
//		event.preventDefault()
// 		return false
// 	}
// }

var Keyboard =
{
	Backspace: 8,
	Tab: 9,
	
	Enter: 13,
	
	Ctrl: 18,
	Alt: 17,
	Shift: 16,
	
	Pause: 19,
	Escape: 27,
	
	Space: 32,
	
	Page_up: 33,
	Page_down: 34,
	
	End: 35,
	Home: 36,
	
	Left: 37,
	
	Up: 38,
	
	Right: 39,
	
	Down: 40,
	
	Insert: 45,
	
	Delete: 46,
	
	'0': 48,
	'1': 49,
	'2': 50,
	'3': 51,
	'4': 52,
	'5': 53,
	'6': 54,
	'7': 55,
	'8': 56,
	'9': 57,
	
	A: 65,
	B: 66,
	C: 67,
	D: 68,
	E: 69,
	F: 70,
	G: 71,
	H: 72,
	I: 73,
	J: 74,
	K: 75,
	L: 76,
	M: 77,
	N: 78,
	O: 79,
	P: 80,
	Q: 81,
	R: 82,
	S: 83,
	T: 84,
	U: 85,
	V: 86,
	W: 87,
	X: 88,
	Y: 89,
	Z: 90,
	
	hyphen: 189,
	
	'-': 109,
	'+': 107,
	
	F1: 112,
	F2: 113,
	F3: 114,
	F4: 115,
	
	F5: 116,
	F6: 117,
	F7: 118,
	F8: 119,
	
	F9: 120,
	F10: 121,
	F11: 122,
	F12: 123,
	
	/*
	a: 97,
	b: 98,
	c: 99,
	d: 100,
	e: 101,
	f: 102,
	g: 103,
	h: 104,
	i: 105,
	j: 106,
	k: 107,
	l: 108,
	m: 109,
	n: 110,
	o: 111,
	p: 112,
	q: 113,
	r: 114,
	s: 115,
	t: 116,
	u: 117,
	v: 118,
	w: 119,
	x: 120,
	y: 121,
	z: 122,
	*/
	
	';': 186,
	'=': 187,
	',': 188,
	'-': 189,
	'.': 190,
	'/': 191,
	'`': 192,
	
	'[': 221,
	']': 223,
	
	/*
	F1: 112,
	F2: 113,
	F3: 114,
	F4: 115,
	F5: 116,
	F6: 117,
	F7: 118,
	F8: 119,
	F9: 120,
	F10: 121,
	F11: 122,
	F12: 123,
	*/

	disable: function()
	{
		this.disabled = true
	},
	
	enable: function()
	{
		this.disabled = false
	},
	
	// внутренний метод
	has: function(key, code)
	{
		if (typeof code !== 'number')
		{
			var event = code
			code = event.which || event.keyCode
			
			switch (key)
			{
				case 'Ctrl':
					if (event.ctrlKey)
						return true
					break
					
				case 'Alt':
					if (event.altKey)
						return true
					break
					
				case 'Shift':
					if (event.shiftKey)
						return true
					break
					
				case 'Command':
					if (event.cmdKey)
						return true
					break
			}
		}
		
		if (this[key] instanceof Array)
		{
			var i = 0
			while (i < this[key].length)
			{
				if (code === this[key][i])
					return true
				i++
			}
		}
		else if (code === this[key])
			return true
			
		return false
	},
	
	// Определяет, была ли нажата данная комбинация клавиш.
	// 
	// Использование:
	// Keyboard.is('Ctrl', 'Shift', 'N', event)
	is: function()
	{
		var meta = false
		var ctrl = false
		var alt = false
		var shift = false
	
		var keys
		var event
		var code
		
		if (arguments[0] instanceof Array)
		{
			// copy
			keys = arguments[0].map(function(key) { return key })
			var event_or_code = arguments[1]
			
			if (typeof event_or_code === 'number')
				code = event_or_code
			else
				event = event_or_code
		}
		else
		{
			var args = Array.prototype.slice.call(arguments)
			
			var event_or_code = args.pop()
			
			if (typeof event_or_code === 'number')
				code = event_or_code
			else
				event = event_or_code
			
			// copy
			keys = args
		}
		
		if (event)
		{
			if (event.which)
				code = event.which
			else
				code = event.keyCode
		}
			
		if (keys.has('Command'))
		{
			meta = true
			keys.remove('Command')
		}
		
		if (keys.has('Ctrl'))
		{
			ctrl = true
			keys.remove('Ctrl')
		}
			
		if (keys.has('Alt'))
		{
			alt = true
			keys.remove('Alt')
		}
			
		if (keys.has('Shift'))
		{
			shift = true
			keys.remove('Shift')
		}

		if (!event && (meta || ctrl || alt || shift))
			throw 'Event wasn\'t provided for this functionality'
		
		if (meta)
		{
			if (!event.metaKey)
				return false
		}
		else if (event)
		{
			if (event.metaKey)
				return false
		}

		if (ctrl)
		{
			if (!event.ctrlKey)
				return false
		}
		else if (event)
		{
			if (event.ctrlKey)
				return false
		}
		
		if (alt)
		{
			if (!event.altKey)
				return false
		}
		else if (event)
		{
			if (event.altKey)
				return false
		}
				
		if (shift)
		{
			if (!event.shiftKey)
				return false
		}
		else if (event)
		{
			if (event.shiftKey)
				return false
		}
		
		if (keys.length === 0)
		{
			//alert(event.keyCode)
			return true
		}
			
		if (keys.length !== 1)
			throw 'Too much character keys. Only one allowed.'
		
		var key = keys[0]
		
		if (key.length === 1)				
			if (shift)
				key = key.toUpperCase()
		
		return this.has(key, code)
	},
	
	// Определяет по событию, какая комбинация клавиш была нажата
	what: function(event)
	{
		var keys = []
			
		if (event.metaKey)
		{
			keys.push('Command')
		}
			
		if (event.ctrlKey)
		{
			keys.push('Ctrl')
		}
			
		if (event.altKey)
		{
			keys.push('Alt')
		}
			
		if (event.shiftKey)
		{
			keys.push('Shift')
		}
		
		var code
		
		if (event.which)
			code = event.which
		else
			code = event.keyCode
		
		var the_key
		
		Object.for_each(this, function(key, value)
		{
			if (value instanceof Array)
			{
				var i = 0
				while (i < value.length)
				{
					if (code === value[i])
						return the_key = key
					i++
				}
			}
			else if (typeof value === 'number')
			{
				if (value === code)
					the_key = key
			}
		})
		
		switch (code)
		{
			case 16:
			case 17:
			case 18:
				return
		}
		
		if (!event.keyCode)
			return
		
		if (!the_key)
			throw 'Key code not recognized: ' + code
		
		keys.push(the_key)
		
		return keys
	},
	
	// navigating: function(event)
	// {
	// 	if (Keyboard.is('Влево', event) ||
	// 		Keyboard.is('Вправо', event) ||
	// 		Keyboard.is('Вверх', event) ||
	// 		Keyboard.is('Вниз', event) ||
	// 		Keyboard.is('Home', event) ||
	// 		Keyboard.is('End', event) ||
	// 		Keyboard.is('Page_up', event) ||
	// 		Keyboard.is('Page_down', event))
	// 	{
	// 		return true
	// 	}
	// },
	
	// print_combination: function(keys)
	// {
	// 	return keys.map(function(key) { return '«' + key + '»' }).join(', ')
	// },
	
	// sorted: function(keys)
	// {
	// 	keys = Array.clone(keys)
		
	// 	var sorted = []
		
	// 	var meta_keys = ['Command', 'Ctrl', 'Alt', 'Shift']
		
	// 	meta_keys.forEach(function(meta_key)
	// 	{
	// 		if (keys.has(meta_key))
	// 		{
	// 			sorted.push(meta_key)
	// 			keys.remove(meta_key)
	// 		}
	// 	})
		
	// 	sorted.append(keys.sort())
		
	// 	return sorted
	// },
}

var Keyboard_listener = {

	key_handlers: {},
	
	// добавляет обработчик события keydown
	on: function(action)
	{
		function generate_unique_key_in_object(target)
		{
			var key = Math.random().toString()
			
			if (typeof target[key] === 'undefined')
				return key
			
			return generate_unique_key_in_object(target)
		}
		
		var handler_id = generate_unique_key_in_object(this.key_handlers)

		this.key_handlers[handler_id] = function(event) {
			var helper = {
				is: function() {
					var args = Array.prototype.slice.call(arguments)

					var options
					if (typeof args.last() === 'object') {
						options = args.pop()
					}

					args.push(event)

					var result = Keyboard.is.apply(Keyboard, args)

					if (result) {
						if (!options || options.swallow) {
							helper.stop()
						}
					}

					return result
				},
				stop: function() {
					event.preventDefault()
					event.stopImmediatePropagation()
					return true
				},
				event: event
			}

			return action(helper)
		}

		return handler_id
	},
	
	// убирает обработчик события keydown
	off: function(id)
	{
		delete this.key_handlers[id]
	}
	
	// on_element: function(element, keys, action)
	// {
	// 	element.on('keydown', function(event)
	// 	{
	// 		if (Keyboard.is(keys, event))
	// 		{
	// 			event.preventDefault()
	// 			action()
	// 		}
	// 	})
	// },
}

$(document).on('keydown.keys', function(event)
{
	if (Keyboard.disabled)
	{
		event.preventDefault()
		return
	}
	
	Object.for_each(Keyboard_listener.key_handlers, function(id, handler)
	{
		handler(event)
	})
});
(function() {
  this.i18n = {};

}).call(this);

var module = angular.module("lvl.directives.dragdrop", ['lvl.services']);

module.directive('lvlDraggable', ['$rootScope', 'uuid', function($rootScope, uuid) {

    return {
        restrict: 'A',
        scope: {
        	lvlDraggable: '=',
            onDrag: '&',
            multiple: '='
        },
        link: function(scope, el, attrs, controller) {
			var $element = angular.element(el);

			scope.$watch('lvlDraggable', function(value) {
				$element.attr("draggable", value);
			})
            
            var id = $element.attr("id");
            if (!id) {
                id = uuid.new()
                $element.attr("id", id);
            }
          
            el.bind("dragstart", function(e) {
                
                //console.log('Dragstart');
            	
                if ($element.hasClass('nodrag')) {
            		return false;
            	}

                e.dataTransfer.setData('text', id);

                // Проверка браузера. Например, в Safari e.dataTransfer.setDragImage немедленно вызывает  dragend и соотв. таскание не работает!
                // Для других браузеров тоже может понадобиться проверка
                var isSafari = navigator.vendor.indexOf("Apple")==0 && /\sSafari\//.test(navigator.userAgent); // true or false
              
	            // Для множественного выделения подменяется картинка
                if (scope.multiple && e.dataTransfer.setDragImage && !isSafari) {
					var dx = 0;
					var dy = 0;
					var drag_image = document.getElementById('dragimage').cloneNode();
					drag_image.display = 'block';
			        e.dataTransfer.setDragImage(drag_image, dx, dy);
                }

                $rootScope.$emit("LVL-DRAG-START");
				scope.$apply(scope.onDrag);

            });
            
            el.bind("dragend", function(e) {
                //console.log('dragEnd---');
                $rootScope.$emit("LVL-DRAG-END");
            });
        }
	}
}]);

module.directive('lvlDropTarget', ['$rootScope', 'uuid', function($rootScope, uuid) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs, controller) {

			var onDrop = function(data) { scope.$eval(attrs.onDrop, data) };

			var node = element[0];
			var $element = angular.element(element);

			function is_active() {
				return !$element.hasClass("nodrop")
			}

			// может быть этого не требуется
			var id = $element.attr("id");
			if (!id) {
				id = uuid.new()
				$element.attr("id", id);
			}

			function highest_parent_or_drop_zone(element) {
				if (element === node) {
					return element;
				}
				return highest_parent_or_drop_zone(element.parentNode);
			}

			$element.on("drop", function (event) {

				if (event.preventDefault) {
					event.preventDefault(); // Necessary. Allows us to drop.
				}

				if (event.stopPropagation) {
					event.stopPropagation(); // Necessary. Allows us to drop.
				}

				var id = event.dataTransfer.getData("text");

				if (is_active()) {
					onDrop({ elements: {dragged: document.getElementById(id), dropped: element} });
				}
			});

			element.on("dragover", function(event) {
				if (event.preventDefault) {
					event.preventDefault(); // Necessary. Allows us to drop.
				}
				event.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
				return false;
			});

			jQuery(element).dragster({
				enter: function(dragsterEvent, event) {
					if (is_active()) {
						$element.addClass('dragged-over');
					}
				},

				leave: function(dragsterEvent, event) {
					$element.removeClass('dragged-over');
				},

				drop: function(dragsterEvent, event) {
					$element.removeClass('dragged-over');
				}
			})

			$rootScope.$on("LVL-DRAG-START", function() {
				element.addClass("lvl-target");
			});

			$rootScope.$on("LVL-DRAG-END", function() {
				element.removeClass("lvl-target");
			});
		}
	}
}]);
(function() {
  i18n.en_US = {
    language_name: 'English',
    title: 'Traffic Aggregator',
    login: {
      title: 'Login',
      password: {
        tooltip: 'Enter password'
      }
    },
    ACL: {
      rule: {
        action: {
          balance: 'Balance',
          redirect: 'Redirect',
          mirror: 'Mirror',
          dubbing: 'Dubbing',
          drop: 'Drop',
          permit: 'Permit'
        },
        filter: {
          none: 'None',
          permit: 'Permit',
          drop: 'Drop',
          type: {
            ethernet_protocol: 'EtherType',
            source_MAC_address: 'Source MAC address',
            destination_MAC_address: 'Destination MAC address',
            source_IP_address: 'Source IP address',
            destination_IP_address: 'Destination IP address',
            multi_IP_address: 'Multi IP address',
            IP_protocol: 'IP protocol',
            IP_protocol_source: 'Destination port',
            IP_protocol_destination: 'Source port',
            VLAN: 'VLAN',
            VLAN2: 'VLAN2',
            Level4_data: 'L4 packet content (DPI)'
          }
        }
      }
    },
    page: {
      ports: {
        title: 'Ports',
        sfp: 'SFP module installed',
        sfp_info: {
          port: 'Port',
          info: 'SFP-module info',
          identifier: 'Identifier',
          spec_comp: 'Type',
          vendor_name: 'Vendor',
          part_number: 'Part number',
          temperature: 'Temperature',
          rx_power: 'RX power',
          tx_power: 'TX power'
        },
        action: {
          reset_counters: 'Reset counters',
          show_graphs: 'Graphs'
        },
        add_comment: 'edit',
        table: {
          number: 'Port No',
          rx: 'RX',
          tx: 'TX',
          rx_rate: 'RX,\nbitrate',
          tx_rate: 'TX,\nbitrate',
          rx_octets: 'RX,\noctets',
          rx_signal: 'RX,\nsignal',
          tx_octets: 'TX,\noctets',
          mode: 'Mode',
          comments: 'Comments',
          crc: 'CRC\nerrors',
          drops: 'Dropped\npackets',
          parser_level: 'Parser\nlevel',
          graph: 'Graph',
          dpi: 'DPI'
        },
        force_up_description: 'Force link up without RX',
        loopback_description: 'Internal routing TX to RX',
        loopback_confirm: 'Do you want to activate internal routing TX to RX?'
      },
      routing: {
        title: 'Rules',
        action: {
          new_rule: 'Add rule',
          delete_all: 'Delete all',
          edit_rule_inputs: 'Ctrl+E. Manual control',
          edit_rule_inputs_title: 'Manual control mode. Edit ports by enter port numbers in textarea.',
          enable_all: 'Enable all',
          disable_all: 'Disable all'
        },
        developer_mode: 'You are in developer mode. Rules you saved the last time are not the same as the current rules on the device.',
        reset: 'Reset all rules on the device?',
        clear: 'Clear all rules?',
        rule: {
          inputs: 'Input ports',
          outputs: 'Output ports',
          name: "Rule No {{id}}",
          delete_confirmation: 'Delete rule «{{rule}}»?',
          is_filtered: 'Filtered',
          balance: {
            by: 'Balance by',
            output_ports_required: 'Output ports required for balancing'
          },
          action: {
            lower_priority: 'Lower priority',
            higher_priority: 'Higher priority',
            duplicate: 'Duplicate',
            "delete": 'Delete',
            aggregation: 'Aggregation'
          },
          graph: {
            graph: 'Graph',
            sum: 'Sum',
            "in": 'Input',
            ins: 'Inputs',
            out: 'Output',
            outs: 'Outputs',
            port_number: 'Port No'
          },
          filtering: {
            filter: 'Filter',
            value: 'Value',
            mask: 'Mask',
            set_interval: 'Interval',
            add_mask: 'Mask',
            remove_filter: 'Remove',
            add_filter: 'Add filter',
            error: {
              invalid_mask: 'Invalid mask'
            }
          },
          error: {
            input_ports_required: 'Specify input ports',
            output_ports_required: 'Specify output ports',
            can_redirect_to_a_single_port_only: 'Each redirect rule can have a single output port only',
            only_the_first_subport_of_40g_port_can_be_used_in_rules: 'If a joint port is set to 40G mode then only the first port of this joint port can be used in rules',
            filters: 'There\'s an error in this rule\'s filters',
            port_filter_requires_ip_protocol: 'You must first set IP protocol filter (usually TCP or UDP) in order to be able to filter by port number',
            too_many_intervals_in_filters: 'Applying rules failed: too many intervals in rules\' filters',
            redirecting_to_several_ports_is_balancing: 'Redirecting to several ports is actually balancing',
            exit_port_editing_mode: 'Exit port editing mode',
            invalid_inputs_text: 'Invalid rule inputs text',
            invalid_outputs_text: 'Invalid rule outputs text',
            invalid_multi_ip_count: 'Maximum number is {{count}}',
            invalid_format: 'Invalid format'
          }
        },
        status: {
          loading_rules_into_device: 'Loading rules into the device',
          reading_rules_from_device: 'Reading rules',
          rules_saved: 'Rules saved',
          errors_in_rules: 'There are errors in the rules',
          applying_rules: 'Applying rules'
        }
      },
      settings: {
        title: 'Settings',
        manual: 'Manual',
        dhcp: 'DHCP',
        ip_address: 'IP address',
        subnet_mask: 'Subnet mask',
        gateway: 'Gateway',
        platform: 'Platform',
        change_password: 'Change password',
        new_password: 'New password',
        confirm_password: 'Confirm password',
        password_changed: 'Password changed',
        current_password: 'Сurrent password',
        license: {
          title: 'Licensing',
          drag_n_drop: 'Drop the license file here',
          serial: 'In order to purchase the licence you will need the device serial number',
          serial_extra: 'Each license corresponds to a specific set of features'
        },
        firmware: {
          title: 'Updating device firmware',
          drag_n_drop: 'Drop the firmware file here'
        },
        action: {
          reset: 'Reset all settings'
        },
        error: {
          form_errors: 'The values you entered have errors',
          ip_address_required: 'Enter an IP address',
          invalid_ip_address: 'Invalid IP address',
          subnet_mask_required: 'Enter a subnet mask',
          invalid_subnet_mask: 'Invalid subnet mask',
          gateway_required: 'Enter a gateway IP address',
          invalid_gateway: 'Invalid gateway IP address',
          password_required: 'Enter a password'
        },
        status: {
          uploading_firmware: 'Uploading firmware',
          updating_firmware: 'Updating firmware. Wait...',
          validating_firmware: 'Validating firmware',
          firmware_update_failed: 'Firmware update failed',
          uploading_license: 'Uploading license',
          validating_license: 'Validating license',
          license_update_failed: 'License update failed',
          rebooting: 'Settings saved. Rebooting device...'
        }
      },
      debug: {
        title: 'Debug',
        command: {
          name: 'Command',
          parameters: 'Parameters',
          output: 'Result',
          output_mode: {
            tree: 'tree',
            code: 'code'
          },
          error: {
            command_name_required: 'Enter command name',
            command_parameters_required: 'Enter command parameters',
            json: 'Syntax error in the input JSON:\n\n{{error}}'
          }
        },
        commands: {
          name: 'Commands (batch)',
          error: {
            commands_required: 'Enter commands',
            batch_format: 'Invalid Json Rpc batch format. It must be an array of Json Rpc commands.',
            batch_json: 'Syntex error in batch input JSON:\n\n{{error}}'
          }
        },
        configuration: {
          section_title: 'Device configuration',
          output_title: 'Configuration',
          refreshing: 'Refreshing...',
          download: 'download',
          download_batch: 'batch',
          portset: 'Portset',
          ports: 'Ports',
          hash_profile: 'Hashing profile',
          lbg: 'Load Balancing Groups',
          mirror_groups: 'Mirroring Groups',
          mappers: 'Mappers',
          acl: 'Access Control Lists',
          network: 'Network',
          routing: 'Rules',
          ta_rules: 'Ta rules',
          users: 'Users'
        },
        administration: {
          section_title: 'Administration',
          configuration: 'Configuration',
          language: 'Language',
          error: {
            configuration_required: 'Configuration JSON required',
            configuration_json: 'Syntax error in device configuration JSON:\n\n{{error}}'
          }
        },
        program_information: {
          version: 'Version',
          revision: 'revision'
        },
        error: {
          generic: 'Error {{status}}: {{data}}'
        },
        notification: {
          restart_gulp: 'Restart your gulp now'
        }
      },
      admin: {
        title: 'Administration'
      }
    },
    action: {
      apply: 'Apply',
      execute: 'Execute',
      save: 'Save',
      ok: 'OK',
      cancel: 'Cancel',
      yes: 'Yes',
      no: 'No'
    },
    file_upload: {
      choose_file: 'Choose a file',
      uploading: 'Uploading file…'
    },
    menu: {
      configuration: {
        title: 'Configuration',
        open: {
          title: 'Open',
          tooltip: 'Load configuration from file'
        },
        save: {
          title: 'Save',
          tooltip: 'Save configuration to file'
        }
      },
      logout: 'Logout',
      log: 'Log',
      debug: 'Debug'
    },
    network: {
      rate: {
        bps: 'bps',
        kbps: 'kbps',
        Mbps: 'Mbps',
        Gbps: 'Gbps'
      }
    },
    error: {
      javascript: 'Javascript is disabled in your web browser. Enable Javascript in order to make this application work.',
      generic: 'Error: {{message}}',
      wrong_password: 'Wrong password',
      unauthenticated: 'The requested operation requires authentication',
      old_browser: 'Update your browser. Supported browsers: {{browsers}}',
      device: {
        reset_failed: 'Device reset failed'
      }
    },
    configuration: {
      status: {
        application_restarting: 'Restarting the application',
        saved: 'Configuration saved',
        applying: 'Applying configuration',
        loaded: 'Configuration loaded',
        deleted: 'Configuration deleted'
      },
      error: {
        filter_should_not_have_a_mask: 'Filter «{{filter}}» should not have a mask',
        invalid: 'Invalid configuration',
        inconsistent: 'The configuration doesn\'t fit this device',
        configuration_upload_failed: 'Configuration upload failed',
        too_many_intervals_in_filters: 'Unable to apply rules: too many intervals in filters',
        max_mirroring_ports: 'Too many mirroring destination ports (max {{max}})',
        max_acls: 'Too many input ports in rules (max {{max}})'
      },
      confirm_reset: 'All the settings will be reset on the device. Are you sure?',
      confirm_deletion: 'Do you really want to delete configuration «{{name}}»?'
    },
    device: {
      status: {
        unknown_platform: 'Unknown platform',
        connecting: 'Waiting for device...',
        applying_rules: 'Applying rules on the device',
        rebooting: 'Rebooting device. Wait...',
        routing_configuration_applied: 'Rules have been saved'
      }
    },
    graph: {
      time: {
        minutes: 'Minutes',
        hours: 'Hours',
        days: 'Days',
        months: 'Months'
      },
      value: {
        type: {
          rate: 'Rate',
          rx_rate: 'RX rate',
          tx_rate: 'TX rate',
          crc: 'CRC errors',
          drops: 'Drops'
        }
      }
    },
    status: {
      loading_page: 'Loading page'
    },
    enter_system_password: 'Enter system password',
    operations_pending_on_page: 'Operations pending on this page. Are you sure you want to cancel everything and navigate away from this page?',
    device_is_booting: 'Device is booting'
  };

}).call(this);

var module;

try {
    module = angular.module('lvl.services');  
} catch (e) {
    module  = angular.module('lvl.services', []);
}

module.factory('uuid', function() {
    var svc = {
        new: function() {
            function _p8(s) {
                var p = (Math.random().toString(16)+"000000000").substr(2,8);
                return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
            }
            return _p8() + _p8(true) + _p8(true) + _p8();
        },
        
        empty: function() {
          return '00000000-0000-0000-0000-000000000000';
        }
    };
    
    return svc;
});
(function() {
  i18n.ru_RU = {
    language_name: 'Русский',
    title: 'Агрегатор Трафика',
    login: {
      title: 'Вход в систему',
      password: {
        tooltip: 'Введите пароль'
      }
    },
    ACL: {
      rule: {
        action: {
          balance: 'Балансировка',
          redirect: 'Перенаправление',
          mirror: 'Копирование',
          dubbing: 'Клонирование через loopback',
          drop: 'Блокировка',
          permit: 'Пропуск'
        },
        filter: {
          none: 'Без фильтрации',
          permit: 'Отбор пакетов',
          drop: 'Блокировка пакетов',
          type: {
            ethernet_protocol: 'EtherType',
            source_MAC_address: 'MAC адрес отправителя',
            destination_MAC_address: 'MAC адрес получателя',
            source_IP_address: 'IP отправителя',
            destination_IP_address: 'IP получателя',
            multi_IP_address: 'Мульти IP-адрес',
            IP_protocol: 'IP протокол',
            IP_protocol_source: 'Исходящий порт',
            IP_protocol_destination: 'Входящий порт',
            VLAN: 'VLAN',
            VLAN2: 'VLAN2',
            Level4_data: 'Содержимое пакета (DPI)'
          }
        }
      }
    },
    page: {
      ports: {
        title: 'Порты',
        sfp: 'Установлен модуль SFP',
        sfp_info: {
          port: 'Порт',
          info: 'Информация о SFP-модуле',
          identifier: 'Идентификатор',
          spec_comp: 'Тип',
          vendor_name: 'Производитель',
          part_number: 'Part number',
          temperature: 'Температура',
          rx_power: 'Входной сигнал',
          tx_power: 'Выходной сигнал'
        },
        action: {
          reset_counters: 'Сбросить счётчики',
          show_graphs: 'Графики'
        },
        add_comment: 'Комментарий',
        table: {
          number: '№ порта',
          rx: 'RX',
          tx: 'TX',
          tx: 'TX',
          rx_rate: 'RX,\nбитрейт',
          tx_rate: 'TX,\nбитрейт',
          rx_octets: 'RX,\nоктеты',
          rx_signal: 'RX,\nсигнал',
          tx_octets: 'TX,\nоктеты',
          mode: 'Режим',
          comments: 'Комментарии',
          crc: 'Ошибки\nCRC',
          drops: 'Отброшенные\nпакеты',
          parser_level: 'Глубина\nанализа',
          graph: 'График',
          dpi: 'DPI'
        },
        force_up_description: 'Принудительно поднимать линк при отсутствии трафика на RX',
        loopback_description: 'Внутренее замыкание трафика с TX на RX',
        loopback_confirm: 'Вы уверены, что хотите включить внутренее замыкание трафика с TX на RX?'
      },
      routing: {
        title: 'Правила',
        action: {
          new_rule: 'Новое правило',
          delete_all: 'Удалить все',
          edit_rule_inputs: 'Ctrl+E — Ручное управление',
          edit_rule_inputs_title: 'В режиме ручного управления, порты добавляются вводом их номеров в текстовое поле.',
          enable_all: 'Включить все',
          disable_all: 'Выключить все'
        },
        developer_mode: 'Вы находитесь в режиме разработчика. Правила, сохранённые вами в последний раз, не совпадают с текущими правилами на устройстве.',
        reset: 'Сбросить все правила на устройстве?',
        clear: 'Удалить все правила?',
        rule: {
          loading: 'Считывание правил',
          inputs: 'Входные порты',
          outputs: 'Выходные порты',
          name: "Правило № {{id}}",
          delete_confirmation: 'Удалить правило «{{rule}}»?',
          is_filtered: 'Фильтрация',
          balance: {
            by: 'Балансировать по',
            output_ports_required: 'Добавьте выходные порты для балансировки'
          },
          action: {
            lower_priority: 'Меньше приоритет',
            higher_priority: 'Больше приоритет',
            duplicate: 'Дублировать',
            "delete": 'Удалить',
            aggregation: 'Агрегация'
          },
          graph: {
            graph: 'График',
            sum: 'Суммировать',
            "in": 'Вход',
            ins: 'Входы',
            out: 'Выход',
            outs: 'Выходы',
            port_number: 'Порт №'
          },
          filtering: {
            filter: 'Фильтр',
            value: 'Значение',
            mask: 'Маска',
            set_interval: 'Диапазон',
            add_mask: 'Задать маску',
            remove_filter: 'Удалить',
            add_filter: 'Добавить фильтр',
            error: {
              invalid_mask: 'Неверная маска'
            }
          },
          error: {
            input_ports_required: 'Добавьте входные порты',
            output_ports_required: 'Добавьте выходные порты',
            can_redirect_to_a_single_port_only: 'В правилах перенаправления может быть только по одному выходному порту',
            only_the_first_subport_of_40g_port_can_be_used_in_rules: 'Если составной порт переведён в режим 40G, то в правилах может участвовать только первый подпорт этого составного порта',
            filters: 'Неправильно заданы фильтры этого правила',
            port_filter_requires_ip_protocol: 'Для фильтрации по номеру порта требуется также задать фильтр по соответствующему IP протоколу (обычно это TCP или UDP)',
            too_many_intervals_in_filters: 'Не удалось применить правила: превышено количество интервалов в фильтрах',
            redirecting_to_several_ports_is_balancing: 'Перенаправление на несколько портов — это балансировка',
            exit_port_editing_mode: 'Выйдите из режима редактирования портов',
            invalid_inputs_text: 'Ошибка в списке входных портов',
            invalid_outputs_text: 'Ошибка в списке выходных портов',
            invalid_multi_ip_count: 'Превышено максимальное количество в {{count}}',
            invalid_format: 'Неверный формат'
          }
        },
        status: {
          loading_rules_into_device: 'Прогружаем правила в устройство',
          reading_rules_from_device: 'Считываем правила',
          rules_saved: 'Правила сохранены',
          errors_in_rules: 'Ошибка в правилах',
          applying_rules: 'Применяем правила'
        }
      },
      settings: {
        title: 'Настройки',
        manual: 'Вручную',
        dhcp: 'DHCP',
        ip_address: 'IP-адрес',
        subnet_mask: 'Маска подсети',
        gateway: 'Шлюз',
        platform: 'Платформа',
        change_password: 'Сменить пароль',
        new_password: 'Новый пароль',
        confirm_password: 'Подтвердите пароль',
        password_changed: 'Пароль изменён',
        current_password: 'Текущий пароль',
        license: {
          title: 'Лицензии',
          drag_n_drop: 'Перетащите файл лицензии сюда',
          serial: 'Для приобретения лицензии вам понадобится серийный номер устройства',
          serial_extra: 'Каждой лицензии соответствует определённый функционал устройства'
        },
        firmware: {
          title: 'Обновление прошивки устройства',
          drag_n_drop: 'Перетащите файл прошивки сюда'
        },
        action: {
          reset: 'Сброс всех настроек'
        },
        error: {
          form_errors: 'Исправьте ошибки во введённых значениях',
          ip_address_required: 'Введите IP-адрес',
          invalid_ip_address: 'Неверный IP-адрес',
          subnet_mask_required: 'Введите маску подсети',
          invalid_subnet_mask: 'Неверная маска подсети',
          gateway_required: 'Введите IP-адрес',
          invalid_gateway: 'Неверный IP-адрес шлюза',
          password_required: 'Введите пароль'
        },
        status: {
          uploading_firmware: 'Прошивка загружается в устройство',
          updating_firmware: 'Идёт обновление прошивки устройства. Ждите...',
          validating_firmware: 'Проверка загруженной прошивки',
          firmware_update_failed: 'Не удалось обновить прошивку',
          uploading_license: 'Лицензия загружается',
          validating_license: 'Лиецнзия проверяется',
          license_update_failed: 'Загрузка лицензии не удалась',
          rebooting: 'Настройки сохранены. Устройство перезагружается...'
        }
      },
      debug: {
        title: 'Отладка',
        command: {
          name: 'Команда',
          parameters: 'Данные',
          output: 'Результат',
          output_mode: {
            tree: 'древо',
            code: 'код'
          },
          error: {
            command_name_required: 'Введите команду',
            command_parameters_required: 'Введите данные команды',
            json: 'Ошибка синтаксиса во входном JSON-е:\n\n{{error}}'
          }
        },
        commands: {
          name: 'Команды (батч)',
          error: {
            commands_required: 'Введите команды',
            batch_format: 'Неправильный формат Json Rpc батча. Должен быть массив Json Rpc команд.',
            batch_json: 'Ошибка синтаксиса во входном JSON-е батча:\n\n{{error}}'
          }
        },
        configuration: {
          section_title: 'Конфигурация устройства',
          output_title: 'Конфигурация',
          refreshing: 'Обновляется...',
          download: 'скачать',
          download_batch: 'batch',
          portset: 'Портсет',
          ports: 'Порты',
          hash_profile: 'Профиль хеширования',
          lbg: 'Группы балансировки',
          mirror_groups: 'Группы зеркалирования',
          mappers: 'Mappers',
          acl: 'Access Control Lists',
          network: 'Сеть',
          routing: 'Правила',
          ta_rules: 'Правила ta',
          users: 'Пользователи'
        },
        administration: {
          section_title: 'Администрирование',
          configuration: 'Конфигурация',
          language: 'Язык',
          error: {
            configuration_required: 'Введите конфигурацию устройства',
            configuration_json: 'Ошибка синтаксиса в JSON-е конфигурации устройства:\n\n{{error}}'
          }
        },
        program_information: {
          version: 'Версия',
          revision: 'ревизия'
        },
        error: {
          generic: 'Ошибка {{status}}: {{data}}'
        },
        notification: {
          restart_gulp: 'Теперь перезапустите свой gulp'
        }
      },
      admin: {
        title: 'Управление'
      }
    },
    action: {
      apply: 'Применить',
      execute: 'Выполнить',
      save: 'Сохранить',
      ok: 'OK',
      cancel: 'Отмена',
      yes: 'Да',
      no: 'Нет'
    },
    file_upload: {
      choose_file: 'Выбрать файл',
      uploading: 'Файл загружается…'
    },
    menu: {
      configuration: {
        title: 'Конфигурация',
        open: {
          title: 'Открыть',
          tooltip: 'Загрузить конфигурацию из файла'
        },
        save: {
          title: 'Сохранить',
          tooltip: 'Сохранить конфигурацию в файл'
        }
      },
      logout: 'Выход',
      log: 'Лог',
      debug: 'Отладка'
    },
    network: {
      rate: {
        bps: 'бит/с',
        kbps: 'кбит/с',
        Mbps: 'Мбит/с',
        Gbps: 'Гбит/с'
      }
    },
    error: {
      javascript: 'В браузере отключена поддержка Javascript. Для работы приложения включите Javascript.',
      generic: 'Ошибка: {{message}}',
      wrong_password: 'Вы ввели неверный пароль',
      unauthenticated: 'Запрошенная операция требует входа в систему',
      old_browser: 'Обновите ваш браузер. Поддерживаемые: {{browsers}}',
      device: {
        reset_failed: 'Не удалось сбросить устройство'
      }
    },
    configuration: {
      status: {
        application_restarting: 'Программа перезапускается',
        saved: 'Конфигурация сохранена',
        applying: 'Применяем конфигурацию',
        loaded: 'Конфигурация загружена',
        deleted: 'Конфигурация удалена'
      },
      error: {
        filter_should_not_have_a_mask: 'У фильтра «{{filter}}» не должна быть задана маска',
        invalid: 'Неверный формат конфигурации',
        inconsistent: 'Невозможно применить данную конфигурацию на этом устройстве',
        configuration_upload_failed: 'Ошибка загрузки конфигурации',
        too_many_intervals_in_filters: 'Не удалось применить правила: превышено количество интервалов в фильтрах',
        max_mirroring_ports: 'Превышено допустимое количество портов, в которые копируется трафик ({{max}})',
        max_acls: 'Превышено допустимое количество входных портов на устройстве ({{max}})'
      },
      confirm_reset: 'Все настройки на устройстве будут сброшены. Продолжить?',
      confirm_deletion: 'Удалить конфигурацию «{{name}}»?'
    },
    device: {
      status: {
        unknown_platform: 'Неизвестная платформа',
        connecting: 'Ожидание ответа от устройства...',
        applying_rules: 'Применение правил на устройстве',
        rebooting: 'Устройство перезагружается, ждите...',
        routing_configuration_applied: 'Правила сохранены'
      }
    },
    graph: {
      time: {
        minutes: 'Минуты',
        hours: 'Часы',
        days: 'Дни',
        months: 'Месяцы'
      },
      value: {
        type: {
          rate: 'Битрейт',
          rx_rate: 'RX битрейт',
          tx_rate: 'TX битрейт',
          rate: 'Битрейт',
          crc: 'Ошибки CRC',
          drops: 'Отброшенные пакеты'
        }
      }
    },
    status: {
      loading_page: 'Загрузка страницы'
    },
    enter_system_password: 'Введите пароль для входа в систему',
    operations_pending_on_page: 'Вы собираетесь покинуть страницу, на которой не закончена работа. Вы уверены, что желаете отменить всё и уйти с этой страницы?',
    device_is_booting: 'Устройство загружается'
  };

}).call(this);

function md5 ( str ) {	// Calculate the md5 hash of a string
	// 
	// +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
	// + namespaced by: Michael White (http://crestidg.com)

	var RotateLeft = function(lValue, iShiftBits) {
			return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
		};

	var AddUnsigned = function(lX,lY) {
			var lX4,lY4,lX8,lY8,lResult;
			lX8 = (lX & 0x80000000);
			lY8 = (lY & 0x80000000);
			lX4 = (lX & 0x40000000);
			lY4 = (lY & 0x40000000);
			lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
			if (lX4 & lY4) {
				return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
			}
			if (lX4 | lY4) {
				if (lResult & 0x40000000) {
					return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
				} else {
					return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
				}
			} else {
				return (lResult ^ lX8 ^ lY8);
			}
		};

	var F = function(x,y,z) { return (x & y) | ((~x) & z); };
	var G = function(x,y,z) { return (x & z) | (y & (~z)); };
	var H = function(x,y,z) { return (x ^ y ^ z); };
	var I = function(x,y,z) { return (y ^ (x | (~z))); };

	var FF = function(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

	var GG = function(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

	var HH = function(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

	var II = function(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

	var ConvertToWordArray = function(str) {
			var lWordCount;
			var lMessageLength = str.length;
			var lNumberOfWords_temp1=lMessageLength + 8;
			var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
			var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
			var lWordArray=Array(lNumberOfWords-1);
			var lBytePosition = 0;
			var lByteCount = 0;
			while ( lByteCount < lMessageLength ) {
				lWordCount = (lByteCount-(lByteCount % 4))/4;
				lBytePosition = (lByteCount % 4)*8;
				lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount)<<lBytePosition));
				lByteCount++;
			}
			lWordCount = (lByteCount-(lByteCount % 4))/4;
			lBytePosition = (lByteCount % 4)*8;
			lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
			lWordArray[lNumberOfWords-2] = lMessageLength<<3;
			lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
			return lWordArray;
		};

	var WordToHex = function(lValue) {
			var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
			for (lCount = 0;lCount<=3;lCount++) {
				lByte = (lValue>>>(lCount*8)) & 255;
				WordToHexValue_temp = "0" + lByte.toString(16);
				WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
			}
			return WordToHexValue;
		};

	var x=Array();
	var k,AA,BB,CC,DD,a,b,c,d;
	var S11=7, S12=12, S13=17, S14=22;
	var S21=5, S22=9 , S23=14, S24=20;
	var S31=4, S32=11, S33=16, S34=23;
	var S41=6, S42=10, S43=15, S44=21;

	str = this.utf8_encode(str);
	x = ConvertToWordArray(str);
	a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

	for (k=0;k<x.length;k+=16) {
		AA=a; BB=b; CC=c; DD=d;
		a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
		d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
		c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
		b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
		a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
		d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
		c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
		b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
		a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
		d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
		c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
		b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
		a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
		d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
		c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
		b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
		a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
		d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
		c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
		b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
		a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
		d=GG(d,a,b,c,x[k+10],S22,0x2441453);
		c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
		b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
		a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
		d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
		c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
		b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
		a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
		d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
		c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
		b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
		a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
		d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
		c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
		b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
		a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
		d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
		c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
		b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
		a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
		d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
		c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
		b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
		a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
		d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
		c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
		b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
		a=II(a,b,c,d,x[k+0], S41,0xF4292244);
		d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
		c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
		b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
		a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
		d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
		c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
		b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
		a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
		d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
		c=II(c,d,a,b,x[k+6], S43,0xA3014314);
		b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
		a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
		d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
		c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
		b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
		a=AddUnsigned(a,AA);
		b=AddUnsigned(b,BB);
		c=AddUnsigned(c,CC);
		d=AddUnsigned(d,DD);
	}

	var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

	return temp.toLowerCase();
}

function utf8_encode ( str_data ) {	// Encodes an ISO-8859-1 string to UTF-8
	// 
	// +   original by: Webtoolkit.info (http://www.webtoolkit.info/)

	str_data = str_data.replace(/\r\n/g,"\n");
	var utftext = "";

	for (var n = 0; n < str_data.length; n++) {
		var c = str_data.charCodeAt(n);
		if (c < 128) {
			utftext += String.fromCharCode(c);
		} else if((c > 127) && (c < 2048)) {
			utftext += String.fromCharCode((c >> 6) | 192);
			utftext += String.fromCharCode((c & 63) | 128);
		} else {
			utftext += String.fromCharCode((c >> 12) | 224);
			utftext += String.fromCharCode(((c >> 6) & 63) | 128);
			utftext += String.fromCharCode((c & 63) | 128);
		}
	}

	return utftext;
}

(function() {
  var Promise_cancellation_error, is_cancellation_error, json_diff, not_a_cancellation_error,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Object.for_each = function(object, action) {
    var key, results, value;
    results = [];
    for (key in object) {
      value = object[key];
      results.push(action(key, value));
    }
    return results;
  };

  Object.not_empty = function(object) {
    return Object.keys(object).length > 0;
  };

  Object.defineProperty(Array.prototype, "clone", {
    enumerable: false,
    value: function(element) {
      return this.slice(0);
    }
  });

  Object.defineProperty(Array.prototype, "intersect", {
    enumerable: false,
    value: function(array) {
      var a, ai, b, bi, result;
      a = this.clone();
      b = array.clone();
      a.sort(function(a, b) {
        return a - b;
      });
      b.sort(function(a, b) {
        return a - b;
      });
      result = [];
      ai = 0;
      bi = 0;
      while (ai < a.length && bi < b.length) {
        if (a[ai] < b[bi]) {
          ai++;
        } else if (a[ai] > b[bi]) {
          bi++;
        } else {
          result.push(a[ai]);
          ai++;
          bi++;
        }
      }
      return result;
    }
  });

  Object.defineProperty(Array.prototype, "intersects", {
    enumerable: false,
    value: function(array) {
      return this.intersect(array).not_empty();
    }
  });

  Object.defineProperty(Array.prototype, "substract", {
    enumerable: false,
    value: function(array) {
      return this.filter(function(item) {
        return array.indexOf(item) < 0;
      });
    }
  });

  Object.defineProperty(Array.prototype, "remove", {
    enumerable: false,
    value: function(element) {
      var array, i, results, test;
      array = this;
      test = function(i) {
        if (typeof element === 'function') {
          return element.bind(array[i])(array[i]);
        } else {
          return array[i] === element;
        }
      };
      i = 0;
      results = [];
      while (i < this.length) {
        if (test(i)) {
          this.splice(i, 1);
          continue;
        }
        results.push(i++);
      }
      return results;
    }
  });

  Object.defineProperty(Array.prototype, "remove_at", {
    enumerable: false,
    value: function(index) {
      return this.splice(index, 1);
    }
  });

  Object.defineProperty(Array.prototype, "has", {
    enumerable: false,
    value: function(element) {
      return this.indexOf(element) >= 0;
    }
  });

  Object.defineProperty(Array.prototype, "has_no", {
    enumerable: false,
    value: function(element) {
      return !this.has(element);
    }
  });

  Object.defineProperty(Array.prototype, "not_empty", {
    enumerable: false,
    value: function() {
      return this.length > 0;
    }
  });

  Object.defineProperty(Array.prototype, "is_empty", {
    enumerable: false,
    value: function() {
      return this.length === 0;
    }
  });

  Object.defineProperty(Array.prototype, "last", {
    enumerable: false,
    value: function() {
      if (this.is_empty()) {
        return;
      }
      return this[this.length - 1];
    }
  });

  Object.defineProperty(Array.prototype, "combinations", {
    enumerable: false,
    value: function() {
      var first, rest_combinations, result;
      if (this.is_empty()) {
        return [];
      }
      first = this[0];
      if (this.length === 1) {
        return first;
      }
      result = [];
      rest_combinations = this.slice(1).combinations();
      return rest_combinations.reduce((function(reduced, rest_combination) {
        return reduced.concat(first.map(function(x) {
          return x + rest_combination;
        }));
      }), []);
    }
  });

  Object.defineProperty(String.prototype, "starts_with", {
    enumerable: false,
    value: function(substring) {
      return this.indexOf(substring) === 0;
    }
  });

  Object.defineProperty(String.prototype, "ends_with", {
    enumerable: false,
    value: function(substring) {
      var index;
      index = this.lastIndexOf(substring);
      return index >= 0 && index === this.length - substring.length;
    }
  });

  Object.defineProperty(String.prototype, "is_empty", {
    enumerable: false,
    value: function() {
      return this.length === 0;
    }
  });

  Object.defineProperty(String.prototype, "not_empty", {
    enumerable: false,
    value: function() {
      return !this.is_empty();
    }
  });

  Object.set = function() {
    var k, key, keys, last_key, len, object, parameters, value;
    parameters = Array.prototype.slice.call(arguments, 0);
    object = parameters.shift();
    value = parameters.pop();
    if (!object) {
      throw new Error('Object is null');
    }
    keys = parameters.reduce(function(reduced, value) {
      return reduced.concat(value.toString().split('.'));
    }, []);
    last_key = keys.pop();
    for (k = 0, len = keys.length; k < len; k++) {
      key = keys[k];
      if (!object[key]) {
        object[key] = {};
      }
      object = object[key];
    }
    object[last_key] = value;
    return object;
  };

  Object.get = function(object, path) {
    var k, key, len, parameters, path_elements;
    parameters = Array.prototype.slice.call(arguments, 0);
    parameters.shift();
    path_elements = parameters.reduce(function(reduced, path_element) {
      return reduced.concat(path_element.toString().split('.'));
    }, []);
    for (k = 0, len = path_elements.length; k < len; k++) {
      key = path_elements[k];
      if (!object) {
        return;
      }
      object = object[key];
    }
    return object;
  };

  Object.equals = function(a, b) {
    return angular.equals(a, b);
  };

  this.format = function(template, parameters) {
    return template.replace(/\{([^\}]+)\}/g, function(text, match) {
      return Object.get(parameters, match);
    });
  };

  Object.extend = function() {
    return angular.extend.apply(this, arguments);
  };

  json_diff = function(a, b) {
    var array, array_diff, diff, i, innerDiff, j, value;
    diff = {};
    if (typeof b === 'object' && typeof a === 'object') {
      for (i in b) {
        value = b[i];
        innerDiff = {};
        if (b[i] instanceof Array) {
          if (a[i] == null) {
            diff[i] = b[i];
          } else if (!angular.equals(b[i], a[i])) {
            array = [];
            j = 0;
            while (j < b[i].length) {
              if (j < a[i].length) {
                array_diff = json_diff(a[i][j], b[i][j]);
                if (typeof array_diff === 'object') {
                  if (Object.keys(array_diff).length > 0) {
                    array.push(array_diff);
                  }
                } else {
                  if (array_diff != null) {
                    array.push(array_diff);
                  }
                }
              } else {
                array.push(b[i][j]);
              }
              j++;
            }
            diff[i] = array;
          }
        } else if (typeof b[i] === 'object') {
          innerDiff = json_diff(a[i], b[i]);
          if (Object.keys(innerDiff).length > 0) {
            diff[i] = innerDiff;
          }
        } else if (!a) {
          diff[i] = b[i];
        } else if (!a.hasOwnProperty(i)) {
          diff[i] = b[i];
        } else if (a[i] !== b[i]) {
          diff[i] = b[i];
        }
      }
    } else {
      if (a === b) {
        diff = {};
      } else {
        diff = b;
      }
    }
    return diff;
  };

  Object.diff = function(a, b) {
    return [json_diff(b, a), json_diff(a, b)];
  };

  Object.defineProperty(Function.prototype, "delay", {
    writable: true,
    enumerable: false,
    value: function(time) {
      return setTimeout(this, time);
    }
  });

  Object.defineProperty(Function.prototype, "periodical", {
    enumerable: false,
    value: function(interval) {
      var action, periodical;
      action = this;
      periodical = function() {
        action();
        return periodical.delay(interval);
      };
      return periodical();
    }
  });

  if (!Function.prototype.bind) {
    Object.defineProperty(Function.prototype, "bind", {
      enumerable: false,
      value: function(scope) {
        return (function(_this) {
          return function() {
            return _this.apply(scope, arguments);
          };
        })(this);
      }
    });
  }

  this.download_file = function(content, name) {
    var fake_form, text;
    if (typeof content === 'object') {
      content = JSON.stringify(content, null, 2);
    }
    fake_form = angular.element('<form action="/download" method="post"/>');
    fake_form.append(angular.element('<textarea name="filename"/>').val(name));
    text = angular.element('<textarea name="data"/>');
    text.val(content);
    fake_form.append(text);
    document.body.appendChild(fake_form[0]);
    fake_form[0].submit();
    document.body.removeChild(fake_form[0]);
    return true;
  };

  Object.defineProperty(String.prototype, "repeat", {
    enumerable: false,
    value: function(times) {
      var result;
      result = '';
      while (times > 0) {
        result += this;
        times--;
      }
      return result;
    }
  });

  Object.defineProperty(String.prototype, "replace_at", {
    enumerable: false,
    value: function(index, character) {
      return this.substr(0, index) + character + this.substr(index + character.length);
    }
  });

  Object.defineProperty(String.prototype, "has", {
    enumerable: false,
    value: function(what) {
      return this.indexOf(what) >= 0;
    }
  });

  Object.defineProperty(String.prototype, "before", {
    enumerable: false,
    value: function(what) {
      var index;
      index = this.indexOf(what);
      if (index < 0) {
        return this;
      }
      return this.substring(0, index);
    }
  });

  Object.defineProperty(String.prototype, "after", {
    enumerable: false,
    value: function(what) {
      var index;
      index = this.indexOf(what);
      if (index < 0) {
        return '';
      }
      return this.substring(index + 1);
    }
  });

  this.find_element_by_path = function(path, relative_to) {
    var match, result;
    match = path.match(/parent\((.*)+\)(?: )?(?:(.*)+)?/);
    relative_to = jQuery(relative_to);
    result = relative_to;
    if (match[1]) {
      result = jQuery(relative_to.parents(match[1])[0]);
    }
    if (match[2]) {
      result = result.find(match[2]);
    }
    return result;
  };

  this.wait = function(delay) {
    return new Promise(function(resolve, reject) {
      return setTimeout(resolve, delay);
    }).cancellable();
  };

  this.replace_with = function(to, from) {
    var key, results, value;
    results = [];
    for (key in from) {
      value = from[key];
      results.push(to[key] = from[key]);
    }
    return results;
  };

  this.custom_error = function(name) {
    var Custom_error;
    Custom_error = (function(superClass) {
      extend(Custom_error, superClass);

      function Custom_error(error) {
        if (error != null) {
          if (error.code != null) {
            this.code = error.code;
          }
          this.message = error.message || error;
        }
        this.name = name;
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, Custom_error);
        }
      }

      return Custom_error;

    })(Error);
    Custom_error.is_custom_error = true;
    return Custom_error;
  };

  this.scroll_to_element = function(element) {
    var body, top_offset;
    top_offset = jQuery(element).offset().top;
    top_offset -= parseInt(jQuery('.layout').css('margin-top'));
    top_offset += 20;
    body = jQuery("html, body");
    return body.animate({
      scrollTop: top_offset + 'px'
    });
  };

  this.dummy_promise = function(result) {
    return Promise.resolve(result).cancellable();
  };

  Promise_cancellation_error = custom_error('User navigated away from the page');

  this.Promise_cancellation_error = Promise_cancellation_error;

  is_cancellation_error = function(error) {
    return error instanceof Promise_cancellation_error;
  };

  not_a_cancellation_error = function(error) {
    return !is_cancellation_error(error);
  };

  Promise.prototype.$apply = function($scope) {
    return this.then(function() {
      return $scope.safeApply();
    })["catch"](not_a_cancellation_error, function(error) {
      $scope.safeApply();
      throw error;
    });
  };

}).call(this);

'use strict';

app

// Постраничная навигация
.directive("sgPagenav", function() {
  return {
    restrict: "EA",
    scope: {
      totalpages: "=",
      currentpage: "=",
      onpage: "=",
      callback: "&"
    },
    //ng-show='totalPages &gt; 1'
    template: "<nav class='pagenavigation'><ul> \
            <li ng-show='totalpages &gt; 1' ng-class=\"{'disabled': currentpage<2}\"><a ng-click='setPage(currentpage-1)'>← Назад</a></li> \
            <li ng-show='totalpages &gt; 1' ng-repeat=\"i in paginationArray\"  class=\"{{i.class}}\"> \
              <a ng-click=\"setPage(i.href)\">{{i.text}}</a> \
            </li> \
            <li ng-show='totalpages &gt; 1' ng-class=\"{'disabled': currentpage==totalpages}\"><a ng-click='setPage(currentpage+1)'>Вперёд →</a></li> \
            <li style='padding:0 0 0 30px' ng-show=\"totalpages &gt; 1\">Показывать по: <select ng-change='currentpage=1' ng-model='onpage'><option value=10>10</option><option value=20>20</option><option value=50>50</option><option value=100>100</option></select></li> \
          </ul></nav>",
    replace: false,
    link: function(scope, element, attrs) {
      function _fillpagginationArray(from,to) {
        for (var i = from; i <= to; i++) {
          scope.paginationArray.push({"href":i,"text":i,"class": (i==scope.currentpage) ? "active" : "" });
        }
      }

      function drawPagination () {
        // Количество страниц <=7 :: 1 2 3 4 5 6 7 -->
        //alert(scope.currentPage);

        if (scope.totalpages <= 7)_fillpagginationArray(1,scope.totalpages);
        // Количество страниц >7
        else {
          // Текущая страница <=4 :: 1 2 3 4 5 ... 8
          if (scope.currentpage <= 4) _fillpagginationArray(1,5); else {
            // Текущая страница >4 и находится в центре :: 1 ... 4 5 6 ... 11
            scope.paginationArray.push({"href":1,"text":1});
            scope.paginationArray.push({"href":(Math.floor(scope.currentpage/2)),"text":"..."});

            if (scope.currentpage <= scope.totalpages-3) {_fillpagginationArray(scope.currentpage-1,scope.currentpage+1);}
            // Текущая страница >4 и приклеена к концу :: 1 ... 5 6 7 8 9 -->
            else _fillpagginationArray(scope.totalpages-3,scope.totalpages);
          }

          if (scope.currentpage <= scope.totalpages-3 || scope.currentpage <= 4) {
            scope.paginationArray.push({"href":(scope.currentpage+Math.ceil((scope.totalpages-scope.currentpage)/2)),"text":"..."});
            scope.paginationArray.push({"href":scope.totalpages,"text":scope.totalpages});
          }
        }
      }
      scope.$watch("totalpages + currentpage + onpage", function(newVal, oldVal) {
        scope.paginationArray = [];
        drawPagination();
      });
      scope.$watch("currentpage + onpage", function(newVal, oldVal) {
        if (newVal!=oldVal) scope.callback();
      });
      scope.setPage = function (v) { if (v>0 && v<scope.totalpages+1) scope.currentpage=v; }
    }
  }
})
// Автокомплит
.directive("sgAutocomplete", ["$document", function($document){
  return {
    restrict: "A",
    scope: {
      sgAutocomplete: "=",
      ngModel: "="
    },
    template: function(element, attrs) {
      return '<div class="autocomplete">\
      <input class="' + attrs.class + '" type="text" ng-model="ngModel" /> \
      <ul ng-show="show && sgAutocomplete.length > 0">\
        <li  ng-repeat="i in sgAutocomplete" ng-class="{\'active\':$index == active}" ng-click="set(i)">{{i}}</li>\
      </ul>\
    </div>'},
    replace: true,
    link: function(scope, element, attrs){
      scope.active = 0;
      scope.show = false;
      element.bind('keydown', function (evt) {
        var key = evt.which;
        switch (key){
          case 40: //стрелка вниз
            scope.active = (scope.active == scope.sgAutocomplete.length-1) ? 0 : scope.active+1;
            scope.$digest();
            break;
          case 38://стрелка вверх
            scope.active = (scope.active == 0) ? scope.sgAutocomplete.length-1 : scope.active-1;
            scope.$digest();
            break;
          case 13://enter
            var ret = !scope.show; //При открытой форме, не обрабатывать enter далее (для отправки формы)
            scope.set(scope.sgAutocomplete[scope.active])
            scope.$digest();
            return ret;
          };
      });
      scope.set = function(item){
        scope.ngModel = item
        scope.active = 0;
        scope.show = false;
      }
      var dismissClickHandler = function (evt) {
        if (element[0] !== evt.target) {
          scope.show = false;
          scope.$digest();
        }
      };
      $document.bind('click', dismissClickHandler);
      scope.$watch("sgAutocomplete ", function(n,o){
        scope.active = 0;
        if (scope.ngModel.length > 2 && scope.sgAutocomplete.indexOf(scope.ngModel) == -1)
            scope.show = true;
      });
    }
  };
}])
//
.directive("sgAutoresize", function() {
  return {
    restrict: "A",
    require: "ngModel",
    scope: {
      ngModel: "="
    },
    link: function(scope, element, attrs) {
      var autoresize = true, oldheight = false;

      function too_big(s) {
        var newlinews = s.match(/\n/);
        newlinews = (newlinews) ? newlinews.length : 0;
        return (s.length > element.width()/9 || newlinews);
      }

      element.bind({"mouseup": function(e) {
        if (element.height() !== oldheight && oldheight) autoresize = false;
        oldheight = element.height();
      }});

      scope.$watch("ngModel", function(n,o) {
        //console.log(element, scope.ngModel, autoresize);
        if (autoresize) {
          if (n!==o && too_big(n)) element.css('height','98px'); else element.css('height','48px');
        }
      });
    }
  };
})

// Навигация по времени для графиков в мониторинге
.directive("sgTimenav", ["$filter", function($filter) {
  return {
    restrict: "E",
    scope: {
      startDate: "=",
      endDate: "=",
      firstDate: "=",
      lastDate: "=",
      period: "=",
      callback: "&"
    },
    template: '<span> \
        <nav class="radio"> \
          <button ng-repeat="t in periodTypes" ng-class="{true:\'active\'}[period==\'{{t.key}}\']" ng-click="setPeriod(t.key)">{{t.title}}</button> \
        </nav> \
        <nav class="buttons"> \
          <button ng-hide="hideFirst" ng-click="setTimeRange(-1)">← {{formatDate(-1)}}</button> \
          <button class="success" ng-bind="formatDate(0, \'d MMM yyyy\')" /> \
          <button ng-hide="hideLast" ng-click="setTimeRange(1)">{{formatDate(1)}} →</button> \
        </nav> \
      </span>',
    replace: true,
    link: function(scope, element, attrs) {
      scope.periodTypes = [
        {"key": "hourly",   "title": "По часам",    "diff": 1},
        {"key": "daily",    "title": "По дням",     "diff": 1},
        {"key": "weekly",   "title": "По неделям",  "diff": 7},
        {"key": "monthly",  "title": "По месяцам",  "diff": 30}
      ]
      scope.formatDate = function (offset, format) {
        var v = new Date(scope.endDate);
        format = format || "d MMM";

        v.setDate(v.getDate() + offset * $filter('findkey')(scope.periodTypes,'key',scope.period,'diff'));

        // определение границы наличия данных для показа/скрытия кнопок {prev}/{next} в sgTimenav
        v.setHours(0,0,0,0);
        scope.hideLast  = (v > (new Date(scope.lastDate) ).setHours(0,0,0,0) ) ? true: false;
        scope.hideFirst = (v < (new Date(scope.firstDate)).setHours(0,0,0,0) ) ? true: false;

        return $filter("date")(v, format);

      }
      scope.setTimeRange = function (offset) {
        var v = new Date(scope.endDate),
            diff = $filter('findkey')(scope.periodTypes,'key',scope.period,'diff'),
            mask = 'yyyy/MM/dd';

        v.setDate(v.getDate() + offset * diff);
        scope.endDate = $filter("date")(v, mask + (scope.period === 'hourly' ? ' 23:59' : '') );

        if (scope.period !== 'hourly') v.setDate(v.getDate() - 6 * diff);
        scope.startDate = $filter("date")(v, mask + (scope.period === 'hourly' ? ' 00:00' : '') );

        console.log('Graph datetime range has changed by', offset, ', new range:', scope.startDate, '-', scope.endDate);
      }
      scope.setPeriod = function (period) {
        console.log('Graph period has changed from', scope.period, 'to', period);
        scope.period = period;
        scope.setTimeRange(0);
      }
      // Cannot using watchCollection because of bug with oldCollection property
      // https://github.com/angular/angular.js/issues/2621
      scope.$watch("startDate+endDate", function(newVal, oldVal) {
        console.log('Dates in showed period has changed from', oldVal, 'to', newVal);
        if (newVal!=oldVal) scope.callback();
      });
    }
  }
}])

.directive("sgModal", function () {
  return function (scope, element, attrs) {
    element
      // создаем триггеры на показ и скрытие модального окна
      .on('modal_show', function(e){ element.removeClass('hidden'); $(document.body).addClass('modal-open') })
      .on('modal_hide', function(e){ element.addClass('hidden'); $(document.body).removeClass('modal-open') })

      .on("click", function(e) { if (element.is(e.srcElement)) element.triggerHandler('modal_hide') })  // триггер на клик по затененному фону
      .find('.close').on("click", function() { element.triggerHandler('modal_hide') });  // триггер на клик по закрывающей ссылке

    $$(document.body).on("keyup", function(e) { if (e.which == 27) element.triggerHandler('modal_hide') }); // триггер на нажатие ESC
  }
})
//
.directive("sgModalOpen", function() {
  return {
    restrict: "A",
    link: function (scope, element, attrs) {
      $$(element).on('click', function(e){ $$('#'+attrs.sgModalOpen+',[sg-modal='+attrs.sgModalOpen+']').triggerHandler('modal_show') })
    }
  }
})

//
.directive("sgInput", function() {
  return {
    require: "ngModel",
    restrict: "EA",
    scope: {ngModel: '=', sgShow: '=', sgRequired: '='},
    replace: true,
    template: function(element, attrs) {
      var isCheckbox = attrs.type=="checkbox";
      var classCheckbox = (isCheckbox) ? "checkbox" : "";
      var attrStr = "";
      for (var i in attrs.$attr) if (i!=="ngModel" && i!=="errmsg" && i!=="ngRequired" && i!=="ngShow" && i!=="sgShow" && i!=="sgRequired") attrStr += " " + i + "=\"" + attrs[i] + "\"";
      var header = (typeof(attrs.sgShow)!=="undefined") ? "<div class=\"field " + classCheckbox + "\" ng-show=\"sgShow\">" : "<div class=\"field " + classCheckbox + "\">";
      var input = "<input ng-model=\"ngModel\" ng-required=\"sgRequired\" " + attrStr + " />";
      var label = (attrs.label) ? "<label>" + attrs.label + "</label>" : "";
      var footer_first = (isCheckbox) ? (input + label) : (label + input);
      var footer = footer_first + " \
              <div ng-hide=\"error\" class=\"errMsg\"> \
                <h1>" + attrs.errmsg + "</h1> \
              </div> \
            </div>";
      return header + footer;
    },
    link: function(scope, element, attrs, controller) {
      // Убрать атрибуты и компиляция этого говна
      var arr = [];
      for (var i=0, attrs=element[0].attributes, l=attrs.length; i<l; i++){if (attrs.item(i).nodeName!=="class") arr.push(attrs.item(i).nodeName)}
      for (var i in arr) element.removeAttr(arr[i]);

      scope.error = true;
      var el = element.find("input");
      var e = el[0].attributes.name.nodeValue;

      //var e = attrs.name;
      scope.$watch('ngModel', function (value) {
        var res = true;
        var ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if ((e=="controlPort")||(e=="dataPort")) {value=+value; if (!((typeof(value)=="number")&&(value%1==0)&&(value>0))) res=false}
        else if (e=="port") {value=+value; if (!((typeof(value)=="number") && value%1==0 && value>0 && value<65536)) res=false}
        else if (e=="ipAddress") {if (!(value.match(ipRegex))) res=false}
        else if (e=="name") res = true;//{for (var i in scope.items) if (scope.items[i]["userName"]==value) res = false}
        else if (e=="groupName") res = true;// if (scope.model.groupId==-1) {
          //for (var i in scope.groups) if (scope.groups[i]["groupName"]==value) var exists=true;
          //if (($.trim(value)=="")||(exists)) res = false;
        //}
        controller.$setValidity("sgInput", res);
        scope.error = res;
        return value;
      });
    }
  }
})

//
.directive("sgCheckbox", function() {
  return {
    require: "ngModel",
    restrict: "EA",
    scope: {ngModel: '='},
    replace: true,
    template: function(element, attrs) {
      var attrStr = "";
      for (var i in attrs.$attr) if (i!=="ngModel" && i!=="ngShow" && i!=="sgShow") attrStr += " " + i + "=\"" + attrs[i] + "\"";
      var input = "<input ng-model=\"ngModel\" ng-checked=\"ngModel || checked\" type=\"checkbox\" " + attrStr + " />";
      var label = (attrs.label) ? "<label ng-click=\"checked=!checked\">" + attrs.label + "</label>" : "";
      var tpl = "<field class=\"inline\" >" + input + " " + label + "</field>";
      return tpl;
    },
    link: function(scope, element, attrs, controller) {
      // Убрать атрибуты и компиляция этого говна
      var arr = [];
      for (var i=0, attrs=element[0].attributes, l=attrs.length; i<l; i++){if (attrs.item(i).nodeName!=="class") arr.push(attrs.item(i).nodeName)}
      for (var i in arr) element.removeAttr(arr[i]);
    }
  }
})

//
.directive("sgSelect", function() {
  return {
    require: "ngModel",
    restrict: "E",
    scope: {ngModel: '=', sgOptions: '='},
    replace: true,
    template: function(element, attrs) {
      var attrStr = "";
      for (var i in attrs.$attr) if (i!=="ngModel" && i!=="sgOptions" && i!=="ngShow" && i!=="sgShow") attrStr += " " + i + "=\"" + attrs[i] + "\"";
      var label = (attrs.label) ? "<label>" + attrs.label + "</label>" : "";
      var input = "<select ng-model=\"ngModel\" ng-options=\"i.id as i.name for i in sgOptions\" " + attrStr + " />";
      var tpl = "<div class=\"field\">" + label + input + "</div>";
      return tpl;
    },
    link: function(scope, element, attrs, controller) {
      // Убрать атрибуты из div
      var arr = [];
      for (var i=0, attrs=element[0].attributes, l=attrs.length; i<l; i++){if (attrs.item(i).nodeName!=="class") arr.push(attrs.item(i).nodeName)}
      for (var i in arr) element.removeAttr(arr[i]);
    }
  }
})

//
.directive("sgFileReader", ["$rootScope", function($rootScope) {
  return {
    restrict: "A",
    require: "ngModel",
    link: function(scope, element, attrs, controller) {

      element.bind('drop', function(e) {
        e.stopPropagation();
        e.preventDefault();

        element.removeClass('dragged-over');

        for (var i = 0, f; f = e.dataTransfer.files[i]; i++) {
          if (!f.type.match("text.*")) continue;
          var fr = new FileReader();
          fr.onload = function(e) {
            element.val(e.target.result);
            $rootScope.safeApply(controller.$setViewValue(e.target.result))
          };
          fr.readAsText(f);
        }
      });

      element.bind("dragover", function(e) {
        element.addClass('dragged-over');
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy"
      });

      element.bind('dragleave', function(e) {
        element.removeClass('dragged-over');
      });
    }
  }
}])

//
.directive("sgNoDrop", function() {
  return {
    restrict: "AC",
    link: function(scope, element, attrs) {
      var highlighted = false;
      element.bind({
        "dragstart dragenter dragover": function(e){
          if ($.inArray("Files", e.originalEvent.dataTransfer.types) > -1) {
            e.stopPropagation();
            e.preventDefault();

            if (!highlighted) {$(".dropzone").height("100px").css({"border": "3px dashed #7Fa8Ba"}); highlighted = true; }
            e.originalEvent.dataTransfer.effectAllowed = "none";
            e.originalEvent.dataTransfer.dropEffect = "none";

            if($(e.target).hasClass("dropzone")) {
              e.originalEvent.dataTransfer.effectAllowed = "copyMove";
              e.originalEvent.dataTransfer.dropEffect = "move";
            }
          }
        },
        "drop dragend dragleave": function(e){ $(".dropzone").css({"border": "solid 1px #ccc"}); highlighted = false; }
      });
    }
  }
})

// Выводит заголовок таблицы с возможностью сортировки
// Для корректного отображения кнопки настроек (атрибут settings) таблице-контейнеру необходимо указать класс settings
.directive("sgSortable", function() {
  return {
    restrict: "EA",
    scope: {
      columns: "=",
      sort: "=",
      callback: "&"
    },
    template: '<div class="dropdown-wrapper" ng-show="settings">\
      <div class="dropdown">\
        <i class="dropdown-toggle-alt icon-cog"></i>\
        <ul class="dropdown-menu pull-right">\
          <i class="icon-remove-sign close dropdown-toggle-alt"></i>\
          <li ng-repeat="c in columns" ng-show="c.title">\
            <label><input type="checkbox" ng-click="change(c)" ng-checked="!c.hide" />{{c.title}}</label>\
          </li>\
        </ul>\
      </div></div>\
      <tr>\
        <th ng-repeat="c in columns | negative:\'hide\'" class="{{c.class}}" ng-class="{true:\'last\'}[$last]">\
          <span ng-click="toggle_sort(c)">{{c.title}}</span>\
          <i ng-class="{\'icon-sort-by-attributes\':sort.order, \'icon-sort-by-attributes-alt\':!sort.order}" ng-show="c.name==sort.column && c.title && !c.disable_sort"></i>\
        </th>\
      </tr>',
    replace: false,
    link: function(scope, element, attrs) {
      scope.settings = (isset(attrs.settings)) ? true : false;
      scope.change = function(item){
        item.hide = !item.hide;
      }
      scope.toggle_sort = function (item) {
        var column = item.name;
        if (item.disable_sort) return;
        if (!isset(scope.sort)) scope.sort = {column: '', order: false};
        if (scope.sort.column == column) scope.sort.order = !scope.sort.order;
        else scope.sort.order = true;
        scope.sort.column = column;
        if (typeof scope.callback == 'function') scope.callback();
      }
    }
  }
})

.directive('dropdownConfirm', function(){
  return {
    restrict: 'E',
    replace: true,
    scope: {
      message: '=message',
      data: '=data',
      show: '=show',
      cancel: '=cancel',
      ok: '=ok'
    },
    templateUrl: 'pages/include/confirm.html',
    link: function(scope) {
      scope.hide = function() {
        scope.show = false;
      };
    }
  };
})

.directive('dropdownClose', ["$document", "$location", "$timeout", function($document, $location, $timeout) {
  return {
    restrict: 'CA',
    link: function(scope, element, attrs) {
      var dropdown = jQuery(jQuery(element[0]).parents('.dropdown')[0]);

      element.on('click', function() {
        dropdown.find('.dropdown-toggle-alt').click();
      })
    }
  }
}])

// Alternate version of Angular-UI Bootstrap Dropdown-Toggle directive
// Doesn't close dropdown when clicking on its content
.directive('dropdownToggleAlt', ["$document", "$location", "$rootScope", function($document, $location, $rootScope) {
  var openElement = null,
      closeMenu   = angular.noop;
  return {
    restrict: 'CA',
    scope: {
      is_open : '=dropdownIsOpen',
      close   : '=dropdownCloseWhen'
    },
    link: function(scope, element, attrs) {

      scope.$watch('$location.path', function() { closeMenu(); });

      if (attrs.dropdownCloseWhen) {
        scope.$watch('close', function(new_value) {
          if (new_value) {
            closeMenu();
          }
        });
      }

      var dropdown = element.parent();

      if (attrs.dropdownToggleAlt) {
        // не работает потом .on через angular.element
        dropdown = find_element_by_path(attrs.dropdownToggleAlt, dropdown[0])
      }

      if (!dropdown.hasClass('dropdown')) {
        dropdown = dropdown.find('.dropdown');
      }

      var closeable = function() {
        closeMenu();
      }

      dropdown.on("click", function(event) {
        if (event) {
          if (event.target.hasAttribute('dropdown-close')) {
            return;
          }
          event.stopPropagation()
        }
      });

      element.on('click', function (event) {
        var elementWasOpen = (element === openElement);

        event.preventDefault();
        event.stopPropagation();

        if (!!openElement) {
          closeMenu();
        }

        if (!elementWasOpen) {
          $rootScope.safeApply(function() {
            if (attrs.dropdownIsOpen) {
              scope.is_open = true;
            }
          });

          dropdown.addClass('open');

          openElement = element;

          if (!window.closeable_by_escape) {
            window.closeable_by_escape = [];
          }

          window.closeable_by_escape.push(closeable);

          closeMenu = function (event) {
            if (event) {
              event.preventDefault();
              event.stopPropagation();
            }

            jQuery(document).unbind('click', closeMenu);

            $rootScope.safeApply(function() {
              if (attrs.dropdownIsOpen) {
                scope.is_open = false;
              }
            });

            dropdown.removeClass('open');

            closeMenu = angular.noop;
            openElement = null;

            window.closeable_by_escape.remove(closeable);
          };

          // $document не работает с trigger
          jQuery(document).on('click', closeMenu);
        }
      });
    }
  };
}])

// форма с отложенной валидацией required-ов
.directive('sgForm', function() {
  return {
    restrict: "A",
    link: function(scope, element, attributes) {
      scope.$on('form_submission', function() {
        element = jQuery(element[0]);
        element.addClass('tried_to_submit');
        element.find('[smart-required]').removeAttr('smart-required');
      });
    }
  };
})

// отправка формы
.directive('sgFormSubmit', function() {
  return {
    restrict: "A",
    link: function(scope, element, attributes) {
      element.on('click', function() {
        scope.$emit('form_submission');
        if (attributes.sgFormSubmit) {
          scope.$apply(attributes.sgFormSubmit)
        }
      })
    }
  };
})

.directive('scrollTo', function() {
  return {
    restrict: "A",
    link: function(scope, element, attributes) {
      scope.$watch(attributes.scrollTo, function(value) {
        if (value) {
          scroll_to_element(value)
        }
      });
    }
  }
})

.directive('scrollToThisElement', function() {
  return {
    restrict: "A",
    link: function(scope, element, attributes) {
      scope.$watch(attributes.scrollTo, function(value) {
        if (value) {
          scroll_to_element(element[0])
        }
      });
    }
  }
})

.directive('scrollTop', function() {
  return {
    restrict: "A",
    link: function(scope, element, attributes) {
      first_time = true
      scope.$watch(attributes.scrollTop, function(value) {
        if (first_time) {
          first_time = false;
          return;
        }
        jQuery("html, body").animate({ scrollTop: value + 'px' }, 400);
      });
    }
  }
})

.directive('scrollBy', function() {
  return {
    restrict: "A",
    link: function(scope, element, attributes) {
      first_time = true
      scope.$watch(attributes.scrollBy, function(value) {
        if (first_time) {
          first_time = false;
          return;
        }
        if (value === false) {
          return;
        }
        jQuery("html, body").animate({ scrollTop: $(window).scrollTop() + value + 'px' });
      });
    }
  }
})

.directive('sgOnShow', ["$rootScope", function($rootScope) {
  return {
    restrict: "A",
    link: function(scope, element, attributes) {
      var previous_value = false;
      var $element = jQuery(element[0]);
      var on_show = function(data) {
        scope.$eval(attributes.sgOnShow, data)
      };

      // при каждом цикле digest
      scope.$watch(function() {
        function check_if_is_visible() {
          var is_visible = $element.is(':visible');
          if (is_visible != previous_value) {
            if (is_visible) {
              $rootScope.safeApply(function() {
                on_show({ extra: { height: function() { return $element.outerHeight(true) } } })
              })
            }
          }
          previous_value = is_visible;
        }

        check_if_is_visible.delay(0);
        return;
      })
    }
  }
}])

// Выводит тело таблицы в самом простейшем случае, если нужно безо взякой обработки отобразить колонки columns
.directive("sgSimpletable", function() {
  return {
    restrict: "EA",
    scope: {
      columns: "=",
      items: "=",
      sort: "="
    },
    template: '<tr ng-repeat="i in items | orderBy:sort.column:!sort.order"><td ng-repeat="c in columns">{{i[c.name]}}</td></tr>',
    replace: false
  }
})

//
.directive("sgErrMsg", function() {
  return {
    //restrict: "A",
    link: function(scope, element, attrs, ctrl) {
      console.log(element.$error);
      attrs.$observe('fieldValidate', function(value) {console.log('ngModel has changed value to ' + value);});
      if (typeof($error)!=="undefined") console.log($error);
      $(element).after("<div class=\"errMsg\"> \
          <h1>" + attrs.sgErrMsg + "</h1> \
        </div>"
      );
    }
  }
})

// При нажатии Enter в поле
.directive('sgEnter', function() {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which === 13) {
        scope.$apply(function (){
          scope.$eval(attrs.sgEnter);
        });

        event.preventDefault();
      }
    });
  };
})

// При выходе курсора из поля
.directive('sgBlur', function() {
  return function (scope, element, attrs) {
    element.bind("blur", function (event) {
      scope.$apply(function (){
        scope.$eval(attrs.sgEnter);
      });

      event.preventDefault();
    });
  };
})

.directive('sgFocus', ["$timeout", function($timeout) {
  return function(scope, element, attrs) {
    function focus() {
      $timeout(function() { element[0].focus(); }, 0);
    }

    if (!attrs.sgFocus) {
      return focus();
    }

    scope.$watch(attrs.sgFocus, function(newValue) {
      if (newValue) {
        focus();
      }
    },
    true);
  };
}])

// "умная" валидация полей формы.
// вешается на "поле" формы: input, select, ...
.directive('sgFormField', function() {
  return function(scope, element, attributes) {
    // "поле" формы
    element = jQuery(element[0]);

    var form_element;
    var form_name;

    // форма (<form>)
    var pure_form_element = element.parents('form');

    // <ng-form>
    var ng_form_element = element.parents('ng-form');
    if (!ng_form_element[0]) {
      ng_form_element = element.parents('[ng-form]');
    }

    // какой-то грязноватый код для определения элемента (и названия) формы, давно писал

    // определение элемента формы
    if (pure_form_element[0] && ng_form_element[0]) {
      if (jQuery.contains(pure_form_element[0], ng_form_element[0])) {
        form_element = ng_form_element;
      }
      else {
        form_element = pure_form_element;
      }
    }
    else if (pure_form_element[0]) {
      form_element = pure_form_element;
    }
    else {
      form_element = ng_form_element;
    }

    // определение названия формы
    form_name = form_element.attr('name') || form_element.attr('ng-form');

    // форма Angular.js
    var form = scope[form_name];

    // название поля
    var field_name = element.attr('name');

    // получает объект поля формы
    function field() {
      if (form[field_name]) {
        return form[field_name]
      }
      // видимо, при каких-то условиях может пропасть поле из объекта формы (была такая ошибка)
      console.log('*** Error: field "' + field_name + '" not found in Angular.js form', form)
      return {}
    }

    // к этому элементу формы ещё не прикасались
    element.addClass('untouched');

    // при уходе с этого поля фомы
    element.on("blur", function (event) {
      // проставить класс "прикасались" (если поле не required)
      if (!attributes.required) {
        element.addClass('untouched');
      }

      scope.$apply(function() {
        // были на этом поле
        field().visited = true;
        // процесс ввода в это поле завершён
        field().in_progress = false;
      });
    });

    // показывает пользователю, что в поле введено неверное значение
    form.indicate_invalid = function(field_name) {
      var element = form_element.find('[name="' + field_name + '"]');
      element.removeClass('indicate_invalid');
      // если поставить задержку 0, то firefox может иногда не показывать анимацию
      setTimeout(function() {
        element.addClass('indicate_invalid');
      }, 10);
    }

    // при вводе значения в поле
    element.on("keydown", function(event) {
      // снять метку неверности значения поля
      element.removeClass('indicate_invalid');

      scope.$apply(function() {
        // в процессе ввода значения в это поле (нежёсткая валидация)
        field().in_progress = true;
      });
    });

    // при вставании в это поле
    element.on("focus", function(event) {
      // проставить класс "прикасались"
      element.removeClass('untouched');
      // снять метку неверности значения поля
      element.removeClass('indicate_invalid');

      scope.$apply(function() {
        // в процессе ввода значения в это поле (нежёсткая валидация)
        field().in_progress = true;
      });
    });

    // при изменении модели формы, убирать ошибки
    scope.$watch(attributes.ngModel, function(new_value) {
      form.errors = {};
    })

    // если форма была отправлена, то убрать у её полей метку "не прикасались"
    scope.$watch(form_name + '.submitted', function(new_value) {
      if (new_value) {
        element.removeClass('untouched');
      }
    })
  };
})

//Infinite scrolling
.directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = elm[0];

        elm.bind('scroll', function() {
            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                scope.$apply(attr.whenScrolled);
            }
        });
    };
})

// решает задачу с автозаполнением полей форм обозревателем (типа логин/пароль)
// http://victorblog.com/2014/01/12/fixing-autocomplete-autofill-on-angularjs-form-submit/
.directive('formAutofillFix', function() {
  return function(scope, elem, attrs) {
    // Fixes Chrome bug: https://groups.google.com/forum/#!topic/angular/6NlucSskQjY
    elem.prop('method', 'POST');

    // Fix autofill issues where Angular doesn't know about autofilled inputs
    if(attrs.ngSubmit) {
      setTimeout(function() {
        elem.unbind('submit').bind('submit', function(e) {
          e.preventDefault();
          elem.find('input, textarea, select').trigger('input').trigger('change').trigger('keydown');
          scope.$apply(attrs.ngSubmit);
        });
      }, 0);
    }
  };
})

// Поле "статуса" приложения, куда можно выводить сообщения
.directive('sgStatus', function() {
  return {
    link: function(scope, element, attrs, Status) {
      var container = $$(element);
      var label = $$(container.find('label'));
      var close = $$(container.find('.close'));

      var shown = true;

      var message_time_base = 10;
      var message_time_factor = 0.1;

      var fade_out_time = 0.3;
      var fade_in_time  = 0.2;

      var fade_out_timeout;

      function dismiss_status(callback) {

        if (!shown) {
          return callback();
        }

        if (fade_out_timeout) {
          clearTimeout(fade_out_timeout);
          fade_out_timeout = null;
        }

        // jQuery.stop( [clearQueue ] [, jumpToEnd ] )
        //
        // clearQueue
        // A Boolean indicating whether to remove queued animation as well. Defaults to false.
        //
        // jumpToEnd
        // A Boolean indicating whether to complete the current animation immediately. Defaults to false.
        container.stop(true, false).animate({ opacity: 0 }, container.css('opacity') * fade_out_time * 1000, callback);
      }

      scope.$watch(attrs.sgStatus, function(status, oldValue) {

        if (!status) {
          return;
        }

        function present_new_value(status) {

          shown = true;

          // set status text
          label.text(status.message);

          if (!status.message) {
            container.addClass('blank');
          }
          else {
            container.removeClass('blank');
          }

          // remove all status classes
          attrs.sgStatusCodes.split(/[\s]*,[\s]*/).forEach(function(status_code) {
            container.removeClass(status_code);
          });
          // set this status class
          element.addClass(status.code);

          // fade in
          // container.fadeIn(
          container.animate({ opacity: 1 }, (1 - container.css('opacity')) * fade_in_time * 1000, function() {

            // if 'sticky' - don't fade out
            if (status.sticky) {
              return;
            }

            var status_duration = (message_time_base + status.message.length * message_time_factor) * 1000;

            // fade out after timeout
            fade_out_timeout = setTimeout(function() {
              fade_out_timeout = null;
              container.animate({ opacity: 0 }, container.css('opacity') * fade_out_time * 1000, function() {
                label.text('');
                shown = false;
              })
            }, status_duration);
          });
        }

        dismiss_status(function() {
          present_new_value(status);
        });
      },
      true);

      close.on('click', function() {
        dismiss_status();
      })
    }
  };
})

// Валидация полей ------------------------

// IP-address validation
.directive('sgValidIpAddresses', ["Device_routing", function(Device_routing) {

  var validate = function(value, max_count) {
    var regexpIp = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[12][0-9]|3[0-2])?)?$/;
    var count = 0;
    var valid = value.split(Device_routing.Filter.ip_split_rule)
      .every(function(ip) {
        ip = ip.trim();

        if(ip.length == 0) {
          return true;
        }

        count++;
        return regexpIp.test(ip);
      });

    return {
      format: valid,
      count: !max_count || max_count >= count
    };
  };

  return {
    require: 'ngModel',
    restrict: 'A',
    scope: {
      maxCount: '=?'
    },
    link: function(scope, element, attributes, model_controller) {
      var validator = function(value) {
        if (!value) {
          return value;
        }

        var result = validate(value, scope.maxCount);

        model_controller.$setValidity('format', result.format);
        model_controller.$setValidity('count', result.count);

        return value;
      };

      model_controller.$parsers.unshift(validator);
      model_controller.$formatters.unshift(validator);
    }
  };
}])

.directive('validIpAddress', function() {
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function(scope, element, attributes, model_controller) {
      var regexpIp = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

      var validator = function(value) {
        if (!value) {
          return value;
        }
        model_controller.$setValidity('format', regexpIp.test(value));
        return value;
      };

      model_controller.$parsers.unshift(validator);
      model_controller.$formatters.unshift(validator);
    }
  };
})

// IP-address mask validation
.directive('validIpMask', function() {
  return {
    require: "ngModel",
    link: function(scope, element, attributes, model_controller) {
      // http://stackoverflow.com/questions/5360768/regular-expression-for-subnet-masking
      // subnet mask
      // var regexp = /^(((255\.){3}(255|254|252|248|240|224|192|128|0+))|((255\.){2}(255|254|252|248|240|224|192|128|0+)\.0)|((255\.)(255|254|252|248|240|224|192|128|0+)(\.0+){2})|((255|254|252|248|240|224|192|128|0+)(\.0+){3}))$/;

      var regexp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

      // for AngularJS 1.3
      // model_controller.$validators.ip_mask = function(value) {
      //   return regexp.test(value);
      // }

      model_controller.$parsers.unshift(function(value) {
        if (!value) {
          return value;
        }
        model_controller.$setValidity('ipMask', regexp.test(value));
        return value;
      });

      model_controller.$formatters.unshift(function(value) {
        if (!value) {
          return value;
        }
        model_controller.$setValidity('ipMask', regexp.test(value));
        return value;
      });
    }
  };
})

// MAC address validation
.directive('validMacAddress', function() {
  return {
    require: "ngModel",
    link: function(scope, element, attributes, model_controller) {
      // http://stackoverflow.com/questions/4260467/what-is-a-regular-expression-for-a-mac-address
      var regexp = /^([0-9A-F]{2}:){5}([0-9A-F]{2})$/;

      model_controller.$parsers.unshift(function(value) {
        if (!value) {
          return value;
        }
        model_controller.$setValidity('macAddress', regexp.test(value));
        return value;
      });

      model_controller.$formatters.unshift(function(value) {
        if (!value) {
          return value;
        }
        model_controller.$setValidity('macAddress', regexp.test(value));
        return value;
      });
    }
  };
})

// TCP port validation
.directive('validTcpPort', function() {
  return {
    require: "ngModel",
    link: function(scope, element, attributes, model_controller) {
      model_controller.$parsers.unshift(function(value) {
        if (!value) {
          return value;
        }
        if (typeof value === 'string') {
          var string_value = value
          value = parseInt(value)
          if (value != string_value) {
            model_controller.$setValidity('tcpPort', false);
            return value;
          }
        }
        model_controller.$setValidity('tcpPort', value >= 0 && value <= 65535);
        return value;
      });

      model_controller.$formatters.unshift(function(value) {
        if (!value) {
          return value;
        }
        model_controller.$setValidity('tcpPort', value >= 0 && value <= 65535);
        return value;
      });
    }
  };
})

// HEX mask validation
// the argument is the length of the mask
.directive('validHexMask', function() {
  return {
    require: "ngModel",
    link: function(scope, element, attributes, model_controller) {
      if (!attributes.validHexMask) {
        throw new Error('Argument required');
      }

      var mask_definition = attributes.validHexMask;
      var variable_length = false;

      if (mask_definition.starts_with('<= ')) {
        variable_length = true;
        mask_definition = mask_definition.substring('<= '.length);
      }

      var symbols_count = parseInt(mask_definition) / 4;
      if (variable_length) {
        symbols_count = 0 + ',' + symbols_count;
      }

      var regexp = new RegExp('^(([0-9A-F]{' + symbols_count + '})|(0))$');

      model_controller.$parsers.unshift(function(value) {
        if (!value) {
          return value;
        }

        // закапслочить введённое значение
        if (value !== value.toUpperCase()) {
          value = value.toUpperCase();
          model_controller.$setViewValue(value);
          model_controller.$render();
        }

        model_controller.$setValidity('hexMask', regexp.test(value));

        return value;
      });

      model_controller.$formatters.unshift(function(value) {
        if (!value) {
          return value;
        }

        // закапслочить введённое значение
        if (value !== value.toUpperCase()) {
          value = value.toUpperCase();
          model_controller.$setViewValue(value);
          model_controller.$render();
        }

        model_controller.$setValidity('hexMask', regexp.test(value));
        return value;
      });
    }
  };
})

// MAC address mask validation
.directive('validMacMask', function() {
  return {
    require: "ngModel",
    link: function(scope, element, attributes, model_controller) {
      var regexp = /^([0-9A-F]{2}:){5}([0-9A-F]{2})$/;

      model_controller.$parsers.unshift(function(value) {
        if (!value) {
          return value;
        }
        model_controller.$setValidity('macMask', regexp.test(value));
        return value;
      });

      model_controller.$formatters.unshift(function(value) {
        if (!value) {
          return value;
        }
        model_controller.$setValidity('macMask', regexp.test(value));
        return value;
      });
    }
  };
})

// IP-address validation
.directive('validIp', function() {
  return {
    require: "ngModel",
    link: function(scope, elm, attrs, ctrl) {
      var regex = /^\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b(:([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$/;

      /*var validator = function(viewValue){
        ctrl.$setValidity('validIp', regex.test(viewValue));
        return viewValue;
      };*/

      //if (attrs.type == 'radio' || attrs.type == 'checkbox') return;
      elm.unbind('input').unbind('keydown').unbind('change');
      elm.bind('blur', function() {
        scope.$apply(function() {
          ctrl.$setViewValue(elm.val());
          ctrl.$setValidity('validIp', regex.test(elm.val()));
        });
      });

      //ctrl.$parsers.unshift(validator);    // набор функций, применяемых к значению модели, полученному из вьюхи
      //ctrl.$formatters.unshift(validator);  // набор функций, применяемых к значению модели перед отображением во вьюхе
    }
  };
})

// IMSI validation
.directive('validImsi', function() {
  return {
    require: "ngModel",
    link: function(scope, elm, attrs, ctrl) {
      var regex = /^[0-9]{14}[0-9]?$/,
        validator;

      elm.unbind('input').unbind('keydown').unbind('change');
      elm.bind('blur', function() {
        scope.$apply(function() {
          ctrl.$setViewValue(elm.val());
          ctrl.$setValidity('validImsi', regex.test(elm.val()));
        });
      });
    }
  };
})

//
.directive("sgModale", ["$modal", function($modal) {
  return {
    link: function(scope, element, attrs) {
      element.bind("click", function() {
        console.log(attrs.sgModale);
        var modalInstance = $modal.open({
          templateUrl: attrs.sgModale
        })
      });
    }
  }
}])

// Time validation.
.directive('validTime', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      timeType: "@"
    },
    link: function(scope, element, attrs, ctrl) {
      element.on('blur', function() {
        var val    = ctrl.$viewValue,
            maxVal = scope.timeType === 'hours' ? 23 : 59;
        if ((+val).toString() === 'NaN') val = 0;
        val = Math.min( val, maxVal );
        val = (val<10?'0':'') + val.toString();
        ctrl.$setViewValue( val );
        ctrl.$render();
      });
      // добавить 0 перед одноциферными значениями (при выставлении значения программным путём)
      ctrl.$formatters.push(function(value) {
        return value < 10 ? '0' + value : value;
      });
    }
  };
})

// Filter number input
.directive('filterNumber', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {
      ctrl.$parsers.push( function(viewValue) {
        if (angular.isUndefined(viewValue)) return '';

        //console.log('[FilterNumber]', typeof viewValue, viewValue);
        var parsedValue = viewValue.replace(/\D+/g, '')+'';
        if (viewValue !== parsedValue) {
          ctrl.$setViewValue(parsedValue);
          ctrl.$render();
        }

        return parsedValue;
      });
    }
  };
})

// Telephone numbers validation
.directive('numbersList', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {
      var validator = function(value) {
        var parsedValue = value.replace(/[^\d\*,\s]+/g, '').replace(/(,|\s){2,}|[,\s](?=\d)/g, ', ').replace(/\*+/g, '*');
        //console.log('[numbersList] converting', value,'=>',parsedValue);
        ctrl.$setValidity( 'numbersList',
          value === 'undefined' ||
          value === '' ||
          /^(\*?\d*\*?,?\s?)+$/g.test(parsedValue)
        );

        if (value !== parsedValue) {
          ctrl.$setViewValue(parsedValue);
          ctrl.$render();
        }

        return parsedValue;
      };

      ctrl.$parsers.push(validator);
      ctrl.$formatters.push(validator);
    }
  };
})

//
.directive('sgInteger', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      var regex = /^\-?\d+$/;
      ctrl.$parsers.unshift(function(viewValue) {
        if (viewValue === "" || regex.test(viewValue)) {
          // it is valid
          ctrl.$setValidity('integer', true);
          return viewValue;
        } else {
          // it is invalid, return undefined (no model update)
          ctrl.$setValidity('integer', false);
          return undefined;
        }
      });
    }
  };
})

//
.directive('sgSignature', function() {
  return {
    require: "ngModel",
    link: function(scope, elm, attrs, ctrl) {
      var regex = /^([\dabcdefxABCDEFX]{2})+$/;

      elm.unbind('input').unbind('keydown').unbind('change');
      elm.bind('blur', function() {
        scope.$apply(function() {
          ctrl.$setViewValue(elm.val());
          ctrl.$setValidity('sgSignature', regex.test(elm.val()));
        });
      });
    }
  };
})


/***** Testing directive *****/
/*
.directive('strongPassRequired', function () {
    var isValid = function(s) {
        return s && s.length > 5 && /\D/.test(s) && /\d/.test(s);
    };

    return {
        require:'ngModel',
        link:function (scope, elm, attrs, ngModelCtrl) {

            ngModelCtrl.$parsers.unshift(function (viewValue) {
                ngModelCtrl.$setValidity('strongPass', isValid(viewValue));
                return viewValue;
            });

            ngModelCtrl.$formatters.unshift(function (modelValue) {
                ngModelCtrl.$setValidity('strongPass', isValid(modelValue));
                return modelValue;
            });
        }
    };
});
*/


.directive('sgHighlight', function() {
   return {
    restrict: "A",
    scope: {
      sgHighlight: '='
    },
    link: function(scope, element, attrs, ctrl) {
        var text = element.html();

      scope.$watch("sgHighlight", function(newVal, oldVal) {
        var find = scope.sgHighlight;
        var tmp = text;

        angular.forEach(tmp.match(find), function(url) {
            text = text.replace(url, '<a target="' + target + '" href='+ url + '>' + url + '</a>');
        });

        console.log('Highlight', find);
      });
    },
    replace: false
  }
})

// Директива для более корректной обработки дат в Bootstrap-UI Datepicker
.directive('sgCorrectDpView', function() {
  return {
    restrict: "A",
    require: "ngModel",
    link: function(scope, elm, attrs, ctrl) {
      // при потере фокуса элементом проверяет содержимое и, по возможности, переводит в формате Date
      elm.off('keydown').off('keyup').off('change').off('submit').on('blur', function() {
        var val = ctrl.$viewValue;  //console.log('[sgCorrectDpView]', typeof val, val);
        if (!val || typeof val === 'object') return;
        // проверка по маске DD[.-/]MM[.-/]YYYY и перевод в MM[.-/]DD[.-/]YYYY
        //console.log('[sgCorrectDpView] RegEx testing...', /^(?:(\d{1,2})[\./-]){2}(\d{1,4})$/.test(val));
        //console.log('[sgCorrectDpView] New value:', val);
        if (/^(?:(\d{1,2})[\./-]){2}(\d{1,4})$/.test(val)) val = val.replace(/^(\d{1,2})[\./](\d{1,2})[\./-](\d{1,4})$/, '$2/$1/$3');
        val = new Date (val);
        //console.log('[sgCorrectDpView] Format to date:', val);
        scope.$apply(function() {
          if (val && val.toString() !== 'Invalid Date') {
            ctrl.$setViewValue(val);
            ctrl.$render();
          }
        });
      });
    }
  };
})

// действие по enter-у
.directive('sgEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                scope.$apply(function(){
                    scope.$eval(attrs.ngEnter, {'event': event});
                });

                event.preventDefault();
            }
        });
    };
})

.directive('sgFileChooser', function() {
  return {
    link: function(scope, element, attributes) {

      var el = jQuery(element)
      var button;
      var input = jQuery(el.find('input')[0]);

      if (attributes.sgFileChooserButton) {
        button = find_element_by_path(attributes.sgFileChooserButton, el[0])
      }
      else {
        button = jQuery(el.children()[0])
      }

      button.on('click', function(event) {
        input.click();
      })

      input.on('click', function(event) {
        event.stopPropagation();
      })
    }
  }
})

.directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind('keydown keypress', function (event) {
      if(event.which === 13) {
        scope.$apply(function (){
            scope.$eval(attrs.ngEnter, {$event:event});
          });
        event.preventDefault();
      }
    });
  };
})

.directive('hexPrettyPrint', ["Utilities", "Device_settings", function(Utilities, Device_settings) {
  return {
    restrict: "A",
    require: "ngModel",
    link: function(scope, element, attrs, ngModel) {

      // код для работы с курсором textarea взят отсюда:
      // http://stackoverflow.com/questions/21401042/angularjs-directive-to-insert-text-at-textarea-caret
      var node = element[0]

      // maxlength attribute is useless since it counts \r\n (sometimes)

      var maxlength = 0
      if (attrs.hexPrettyPrint) {
        var bytes = attrs.hexPrettyPrint
        var fours_in_row = attrs.hexPrettyPrintFoursInRow || 4 // по четыре "четыре байта" в строке

        maxlength = bytes * 2 /* каждый байт - два символа */
          + (Device_settings.level_4_data_max_bytes - 1) /* по пробелу между каждыми байтами */
          + Math.floor((Device_settings.level_4_data_max_bytes - 1) / 4) /* по второму пробелу между каждыми четырьмя байтами */
          - Math.floor((Device_settings.level_4_data_max_bytes - 1) / (4 * fours_in_row)) /* на каждом конце строки - два пробела заменяются на \n */
      }

      function read() {

        var startPos;
        var endPos;
        var scrollTop;

        var restore_cursor = node.selectionStart || node.selectionStart === 0;

        if (restore_cursor) {
          startPos  = node.selectionStart;
          endPos    = node.selectionEnd;
          scrollTop = node.scrollTop;
        }

        var original_value = element.val()
        var value = original_value

        value = value.toUpperCase().replace(/[^0-9A-FX \n\r]/g, 'X')

        var result = Utilities.hex_pretty_print(value, startPos);

        var printed = result[0];
        var shift   = result[1];

        var cut = false;
        printed_length = printed.replace(/\n\r/g, '\n').length
        if (maxlength && printed_length > maxlength) {
          printed = printed.substring(0, maxlength)
          cut = true;
        }

        if (printed != original_value || cut) {

          ngModel.$setViewValue(printed);
          ngModel.$render();

          if (restore_cursor) {
            // node.focus();

            node.selectionStart = startPos + shift;
            node.selectionEnd   = startPos + shift;
            node.scrollTop      = scrollTop;
          }
        }
      }

      ngModel.$render = function() {
        element.val(ngModel.$viewValue || "");
      };

      // http://stackoverflow.com/questions/8795283/jquery-get-input-value-after-keypress
      element.on("input", function() {
        scope.$apply(read);
      });

      element.on("blur change", function() {
        scope.$apply(function() {
          read();

          // если количество символов в строке нечётно - дополнить иксом справа
          if (element.val().replace(/\s/g, '').length % 2) {

            ngModel.$setViewValue(element.val() + 'X');
            ngModel.$render();
          }
        });
      });
    }
  }
}])

.directive('dpiTooltip', function() {
    return {
        restrict: 'AE',
        templateUrl: 'pages/include/dpi tooltip.html', // markup for template
        scope: {
            hex: '=dpiTooltip' // allows data to be passed into directive from controller scope
        }
    };
})

// Директива для сравнения двух моделей
.directive('compareTo', function() {
  return {
    require: 'ngModel',
    scope: {
      otherModelValue: '=compareTo'
    },
    link: function(scope, element, attributes, ngModel) {
      // валидатор сравнивает значение текущего элемента
      // с тем, что передан в скоуп
      ngModel.$validators.compareTo = function(modelValue) {
        return modelValue === scope.otherModelValue;
      };

      // отслеживаем изменения обеих моделей
      scope.$watch('otherModelValue + element.value', function() {
        ngModel.$validate();
      });
    }
  };
})

// (требуется stickyeah.js)
//
// Помеченный этой директивой элемент будет 'sticky':
// будет "залипать" наверху экрана при прокрутке вниз.
//
// При помечании этой директивой таблицы, 
// 'sticky' станут элементы th.
// Также в случае таблицы элементу table 
// следует назначать атрибут 'data-sticky-class':
// этот класс будет назначен 'sticky' элементу в состоянии 'sticky'
// (можно добавлять прозрачность, border-bottom, и т.п.)
.directive('sgSticky', ["$timeout", function($timeout) {
  return {                                                                                        
    link: function(scope, element, attributes, ngModel) {

      function sticky(element) {
        element.addClass('stickyeah')
        element.attr('data-stickyeah-offset', attributes.sgSticky || 50)
      }

      var $element = jQuery(element)

      // когда всё отрендерится
      $timeout(function() {
        // в случае таблицы
        if ($element.is('table')) {
          // высота th
          var height

          // sticky css class
          var sticky_class = $element.attr('data-sticky-class')
          if (sticky_class) {
            $element.removeAttr('data-sticky-class')
          }

          $element.find('th').each(function() {
            var th = jQuery(this)
            
            // узнать высоту th
            if (typeof height === 'undefined') {
              height = th.height()
            }

            // padding у th
            var padding = {
              paddingLeft:   th.css('paddingLeft'),
              paddingRight:  th.css('paddingRight'),
              paddingTop:    th.css('paddingTop'),
              paddingBottom: th.css('paddingBottom')
            }

            // убрать padding у th
            th.css('padding', 0)

            // создать вложенный div
            th.wrapInner('<div/>')

            // вложенный div
            var div = $(th.children()[0])

            // перенести sticky css class, указанный для таблицы
            if (sticky_class) {
              div.attr('data-stickyeah-class', sticky_class)
            }

            // перенести padding с th на вложенный div
            div.css(padding)

            // выставить высоту такую же, как у th
            div.css({
              height: height + 'px'
            })

            // пометить как sticky
            sticky(div)
          })
        }
        // иначе - не таблица
        else {
          // пометить как sticky
          sticky(element)
          elements.push(element)
        }

        // активировать sticky
        $.stickyeah()
      })
    }
  }
}])

// пишет высоту элемента в указанную переменную 
// (и обновляет её по событию refresh height)
.directive('sgOutputHeightTo', ["$timeout", function($timeout) {
  return {
    scope: {
      sgOutputHeightTo: '=sgOutputHeightTo'
    },
    link: function(scope, element, attributes, ngModel) {

      var $element = jQuery(element)

      function write() {
        scope.sgOutputHeightTo = $element.outerHeight()
      }

      write()

      scope.$on('refresh height', function(event) {
        // scope.$digest()
        write()
      })
    }
  }
}]);
(function() {
  app.controller("AdminCtrl", ["$scope", "$rootScope", "api", "Status", "GUI", function($scope, $rootScope, api, Status, GUI) {
    $scope.validate = function(data) {
      return data;
    };
    $scope.save = function() {
      var configuration;
      configuration = $scope.validate($scope.configuration_editor.get());
      if ($scope.busy) {
        return Status.info('Операция уже выполняется');
      }
      $scope.busy = true;
      return api.call('configuration.set', {
        configuration: configuration
      }).then(function(result) {
        return Status.error('Не удалось перезапустить приложение');
      })["catch"](function(error) {
        return GUI.wait_for_connection(4, 'Конфигурация сохранена. Приложение перезапускается', {
          to: 'gui'
        });
      });
    };
    return $scope.initialize_page_with(function() {
      return api.call('configuration.get').then(function(configuration) {
        $scope.configuration_editor = new JSONEditor(document.querySelector(".configuration_editor"), {
          mode: 'tree'
        });
        return $scope.configuration_editor.set(configuration);
      });
    });
  }]);

}).call(this);

/* Copyright (c) 2010 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.4
 *
 * Requires: 1.2.2+
 */
(function(c){var a=["DOMMouseScroll","mousewheel"];c.event.special.mousewheel={setup:function(){if(this.addEventListener){for(var d=a.length;d;){this.addEventListener(a[--d],b,false)}}else{this.onmousewheel=b}},teardown:function(){if(this.removeEventListener){for(var d=a.length;d;){this.removeEventListener(a[--d],b,false)}}else{this.onmousewheel=null}}};c.fn.extend({mousewheel:function(d){return d?this.bind("mousewheel",d):this.trigger("mousewheel")},unmousewheel:function(d){return this.unbind("mousewheel",d)}});function b(i){var g=i||window.event,f=[].slice.call(arguments,1),j=0,h=true,e=0,d=0;i=c.event.fix(g);i.type="mousewheel";if(i.wheelDelta){j=i.wheelDelta/120}if(i.detail){j=-i.detail/3}d=j;if(g.axis!==undefined&&g.axis===g.HORIZONTAL_AXIS){d=0;e=-1*j}if(g.wheelDeltaY!==undefined){d=g.wheelDeltaY/120}if(g.wheelDeltaX!==undefined){e=-1*g.wheelDeltaX/120}f.unshift(i,j,e,d);return c.event.handle.apply(this,f)}})(jQuery);


/* stickyeah 0.1, v001
 * © Artem Polikarpov | artpolikarpov.ru | artpolikarpov@gmail.com
 * Licensed under the MIT License */

(function($){
	/*if (typeof(console) == 'undefined') {
		console = {log: $.noop};
	}*/

	var stopFLAG = ('ontouchstart' in document) || document.compatMode != 'CSS1Compat' || typeof document.body.style.maxHeight == 'undefined';

  var $document = $(document);
  var $window = $(window);
	var sticky = $();
	var pushers = {};
	var groups = {};

	var stickyeah = function($sticky, i, o) {
		var $stickyClone = $sticky.clone().addClass('stickyeah_clone').data({initialized: true}).removeAttr('id').insertAfter($sticky).css({visibility: 'hidden'}).hide();
		$sticky.data({clone: $stickyClone});
		var originalStickyPosition = $sticky.css('position');

		var stickyTop, stickyHeight, scrollTop, scrollLeft, windowHeight, stickyTopNew, heightDiff;
		var cloneActivatedFLAG = false;
		var mousewheelActivatedFLAG = false;
		var mousewheeledFLAG = false;
		var setMousewheeledFLAG;

		var $stickyPusher, pusherTop;
		if ($sticky.data('stickyeah-push')) {
			$stickyPusher = pushers[$sticky.data('stickyeah-push')].slice(pushers[$sticky.data('stickyeah-push')].index($sticky)+1);
			////console.log($stickyPusher, i);
		}
    //console.log($stickyPusher);
    if (!$stickyPusher || !$stickyPusher.length) {
      $stickyPusher = $('<div></div>').css({height: 0, fontSize: 0, margin: 0, clear: 'both', float: 'none'}).appendTo('body');
/*
			console.log('$stickyPusher', $stickyPusher);*/
    }

		var $stickyStopper, stopperHeight;
		if ($sticky.data('stickyeah-group')) {
			var thisIndex = groups[$sticky.data('stickyeah-group')].index($sticky);
			if (thisIndex != 0) {
				$stickyStopper = groups[$sticky.data('stickyeah-group')].slice(0,thisIndex);
			}
			////console.log($stickyStopper, i);
		}

		var getPusherTop = function() {
			//console.log('getPusherTop', i);
			pusherTop = 0;
			if ($stickyPusher && $stickyPusher.length) {
				pusherTop = $stickyPusher.not('.stickyeah_disabled').eq(0).offset().top
			}
		}

		var getStopperHeight = function() {
			//console.log('getStopperHeight', i);
			stopperHeight = 0;
			if ($stickyStopper && $stickyStopper.length) {
				$stickyStopper.not('.stickyeah_disabled').each(function(){
					var $this = $(this);
					stopperHeight += $this.data('stickyeah-offset') + ($this.data('clone').height() || 0);
					////console.log($this.data('stickyeah-offset'), $this.next().height());
				});
			}
		}

		var stickyTopNewLast, stickyLeftLast, stickyWidthLast;

		var stick = function() {
			////console.log('stick', i);
			var stickyLeft = $stickyClone.offset().left - scrollLeft;
			stickyTopNew = $sticky.data('stickyeah-offset');
			var stickyWidth = $stickyClone.width();

			if ($stickyPusher && $stickyPusher.length) {
				getPusherTop();
				var stickyHeight = $stickyClone.height() + stickyTopNew*2;
				var pushindDiff = scrollTop - (pusherTop - stickyHeight /*- Number($stickyPusher.attr('data-stickyeah-offset') || 0)*/);
				pushindDiff = Math.max(pushindDiff, $sticky.data('stickyeah-offset'));
				stickyTopNew = stickyTopNew*2 - pushindDiff;
        /*if ($stickyPusher.data('stickyeah-on') && stickyTopNew > 0) {
          stickyTopNew = - stickyHeight;
        }*/
			}

			//if ($stickyStopper && $stickyStopper.length) {
				//var stopperHeight = getStopperHeight();
				stickyTopNew = stickyTopNew + stopperHeight;
			//}
			//////console.log(top, -stickyHeight, i);

			var time = 0;

			$sticky.stop();

			if (mousewheeledFLAG) {
				var distance = Math.abs(parseInt($sticky.css('top')) - stickyTopNew);
				if (distance > 10) time = distance / 2;
				clearTimeout(setMousewheeledFLAG);
				setMousewheeledFLAG = setTimeout(function(){
					mousewheeledFLAG = false;
				}, 100);
			}

			if (stickyTopNewLast !== stickyTopNew || stickyLeftLast != stickyLeft || stickyWidthLast != stickyWidth || mousewheeledFLAG) {
				//console.log('stick css redraw', i);
				var overflow = $sticky.css('overflow');
				$sticky.animate({
					top: stickyTopNew,
					left: stickyLeft,
					width: stickyWidth,
					marginTop: 0,
					marginLeft: 0
				}, time, 'linear', function(){
					$sticky.css({overflow: overflow});
				});
				stickyTopNewLast = stickyTopNew;
				stickyLeftLast = stickyLeft;
				stickyWidthLast = stickyWidth;
			}
		}

		var activateClone = function(FLAG) {
			if (FLAG != cloneActivatedFLAG) {
				$sticky.stop().css({position: FLAG ? 'fixed' : originalStickyPosition, top: '', left: '', marginTop: '', marginLeft: '', width: ''})[FLAG ? 'addClass' : 'removeClass']($sticky.data('stickyeah-class')).data({'stickyeah-on': FLAG});
				stickyTopNewLast = '';
				$stickyClone[FLAG ? 'show' : 'hide']();
				cloneActivatedFLAG = FLAG;
				listenHeight();
				//console.log('activateClone: ' + FLAG, i);
			}
			if (cloneActivatedFLAG) {
				stick();
			}
		}

		var onMousewheel = function(event, delta, deltaX, deltaY) {
			event.preventDefault();
			stickyTopNew = stickyTopNew + Math.round(deltaY*25);
			var topLimit = stickyHeight - windowHeight - $sticky.data('stickyeah-offset');
			var bottomLimit = $sticky.data('stickyeah-offset')*2 - $sticky.data('stickyeah-offset');
			if (stickyTopNew < -topLimit) {
				stickyTopNew = -topLimit;
			} else if (stickyTopNew > bottomLimit) {
				stickyTopNew = bottomLimit;
			}
			$sticky.stop().css({
				top: stickyTopNew
			});
			mousewheeledFLAG = true;
		}

		var activateMousewheel = function(FLAG) {
			////console.log('activateMousewheel', FLAG);
			if (o.scroll && FLAG != mousewheelActivatedFLAG) {
				$sticky[FLAG ? 'bind' : 'unbind']('mousewheel', onMousewheel);
				//console.log('mousewheelActivatedFLAG: ' + FLAG);
				mousewheelActivatedFLAG = FLAG;
			}
		}

		var listenTop = function() {
			if (!$sticky.data('disabled')) {
				//console.log('listenTop');
				stickyTop = (cloneActivatedFLAG ? $stickyClone : $sticky).offset().top;
				//scrollTop = $window.scrollTop();
        scrollTop = Math.max(Math.min($window.scrollTop(), $document.height() - $window.height()), 0);
				scrollLeft = Math.max(Math.min($window.scrollLeft(), $document.width() - $window.width()), 0);
				//////console.log('stickyTop: '+stickyTop,'scrollTop: '+scrollTop);
				activateClone(stickyTop - $sticky.data('stickyeah-offset') - stopperHeight <= scrollTop);
			}
		}

		var listenHeight = function() {
			////console.log('listenHeight', cloneActivatedFLAG);
			if (!$sticky.data('disabled')) {
				//console.log('listenHeight');
				stickyHeight = $stickyClone.height() + $sticky.data('stickyeah-offset') * 2;
				windowHeight = $window.height();
				heightDiff = stickyHeight - windowHeight;
				if (cloneActivatedFLAG) {
					activateMousewheel(heightDiff >= 0);
				} else {
					activateMousewheel(false);
				}
			}
		}

		$sticky
				.bind('stickyeah:disable', function(){
					$sticky.data({'disabled': true}).addClass('stickyeah_disabled');
					////console.log('inside', $sticky.data('disabled'));
					activateClone(false);
					activateMousewheel(false);
					sticky.trigger('stickyeah:reflow');
				})
				.bind('stickyeah:enable', function(){
					$sticky.data({'disabled': false}).removeClass('stickyeah_disabled');
					////console.log('inside', $sticky.data('disabled'));
					sticky.trigger('stickyeah:reflow');
				})
				.bind('stickyeah:reflow', function(e, originalEvent){
					if (!originalEvent) {
						getStopperHeight();
					}
					listenTop();
					if (!originalEvent || originalEvent.type == 'resize') {
						listenHeight();
					}
					////console.log(originalEvent);
				});



	}

	$.stickyeah = function(o) {
		o = $.extend({
			scroll: true
		}, o);

		if (!stopFLAG) {
			sticky = $('.stickyeah');

      sticky
					.filter(function() {
						return !$(this).data('initialized');
					})
					.data({initialized: true})
					.each(function(i){
						var $this = $(this);
						var push = $this.attr('data-stickyeah-push');
						////console.log(push);
						if (push) {
							if (!pushers[push]) {
								pushers[push] = $();
							}
							pushers[push].push(this);
							$this.data({'stickyeah-push': push});
						}
						var group = $this.attr('data-stickyeah-group');
						if (group) {
							if (!groups[group]) {
								groups[group] = $();
							}
							groups[group].push(this);
							$this.data({'stickyeah-group': group});
						}
						$this.data({
							'stickyeah-offset': Number($this.attr('data-stickyeah-offset') || 0),
							'stickyeah-class': $this.attr('data-stickyeah-class') || ''
						});
						////console.log(i, $this.data('stickyeah-offset'));
					})
					.each(function(i) {
						stickyeah($(this), i, o);
					});

      sticky.trigger('stickyeah:reflow');
		}
	}

	$(function(){
		$.stickyeah();
	});


	$window.bind('resize scroll', function(e){
		//////console.log('resize or scroll');
    sticky.trigger('stickyeah:reflow', e);
	});
})(jQuery);
(function() {
  app.controller("DebugCtrl", ["$scope", "$rootScope", "$http", "api", "log", "Enums", "Device", "Routing_model_applier", "Model", "Model_service", "translate", "GUI", "Status", function($scope, $rootScope, $http, api, log, Enums, Device, Routing_model_applier, Model, Model_service, translate, GUI, Status) {
    $scope.minify_response = function(response) {
      response = angular.copy(response);
      delete response.jsonrpc;
      delete response.id;
      if (response.result) {
        response = response.result;
      } else if (response.error) {
        response = {
          error: response.error
        };
      }
      return response;
    };
    $scope.process_error = function(data, status, headers, config) {
      var message;
      message = translate('page.debug.error.generic', {
        status: status || '[no status]',
        data: data || '[no description]'
      });
      return alert(message);
    };
    $scope.submit = function() {
      var error, error1, request;
      if ($scope.form.$invalid) {
        return;
      }
      $scope.command_output_editor.setName();
      $scope.command_output_editor.setMode('view');
      $scope.command_output_editor.set();
      try {
        request = {
          jsonrpc: "2.0",
          method: $scope.command,
          params: $scope.command_input_editor.get(),
          id: 1
        };
      } catch (error1) {
        error = error1;
        if (error instanceof SyntaxError) {
          alert(translate('page.debug.command.error.json', {
            error: error.stack
          }));
          console.error(error.stack);
          return;
        } else {
          throw error;
        }
      }
      $scope.busy = true;
      $scope.busy_command = true;
      return $http.post('/api', JSON.stringify(request)).success(function(response) {
        log.info("←", response);
        $scope.command_output = response;
        $scope.view_command_output();
        return $scope.command_output_editor.expandAll();
      }).error($scope.process_error)["finally"](function() {
        $scope.busy = false;
        return $scope.busy_command = false;
      });
    };
    $scope.view_command_output = function() {
      var response;
      response = $scope.minify_response($scope.command_output);
      if (response.error) {
        response = response.error;
      }
      return $scope.command_output_editor.set(response);
    };
    $scope.submit_batch = function() {
      var batch, batch_json, error, error1, id, request;
      if ($scope.batch_form.$invalid) {
        return;
      }
      $scope.batch_output_editor.setMode('view');
      $scope.batch_output_editor.set();
      id = 1;
      request = function(command, command_input) {
        var data;
        data = {
          jsonrpc: "2.0",
          method: command,
          params: command_input,
          id: id++
        };
        return data;
      };
      batch = null;
      try {
        batch_json = $scope.batch_input_editor.get();
        if (!batch_json instanceof Array) {
          if (batch_json.method != null) {
            batch_json = [batch_json];
          } else {
            alert(translate('page.debug.commands.error.batch_format'));
          }
        }
        batch = batch_json.map(function(command) {
          return request(command.method, command.params);
        });
      } catch (error1) {
        error = error1;
        if (error instanceof SyntaxError) {
          alert(translate('page.debug.commands.error.batch_json', {
            error: error.stack
          }));
          console.error(error.stack);
          return;
        } else {
          throw error;
        }
      }
      $scope.busy = true;
      $scope.busy_batch = true;
      return $http.post('/api', JSON.stringify(batch)).success(function(response) {
        log.info("←", response);
        $scope.batch_output = response;
        $scope.batch_output_editor.set($scope.batch_output.map($scope.minify_response));
        return $scope.batch_output_editor.expandAll();
      }).error($scope.process_error)["finally"](function() {
        $scope.busy = false;
        return $scope.busy_batch = false;
      });
    };
    $scope.switch_command_output_mode = function() {
      return $scope.command_output_mode = (function() {
        switch ($scope.command_output_mode) {
          case 'code':
            $scope.view_command_output();
            $scope.command_output_editor.setMode('view');
            $scope.command_output_editor.expandAll();
            return 'tree';
          case 'tree':
            $scope.command_output_editor.setMode('code');
            $scope.command_output_editor.set(angular.copy($scope.command_output));
            return 'code';
        }
      })();
    };
    $scope.switch_batch_output_mode = function() {
      return $scope.batch_output_mode = (function() {
        switch ($scope.batch_output_mode) {
          case 'code':
            $scope.batch_output_editor.set($scope.batch_output.map($scope.minify_response));
            $scope.batch_output_editor.setMode('view');
            $scope.batch_output_editor.expandAll();
            return 'tree';
          case 'tree':
            $scope.batch_output_editor.setMode('code');
            $scope.batch_output_editor.set(angular.copy($scope.batch_output));
            return 'code';
        }
      })();
    };
    $scope.refresh_device_configuration_batch = function() {
      return Device.refresh_ports().then(function() {
        return Routing_model.from_device();
      }).then(function(routing_model) {
        return Routing_model_applier.generate_configuration_batch(routing_model);
      });
    };
    $scope.refresh_device_configuration = function() {
      var key_for, model;
      if ($scope.refreshing_device_configuration) {
        throw new Error('Already refreshing configuration');
      }
      $scope.refreshing_device_configuration = true;
      $scope.device_configuration_json = {};
      model = {};
      key_for = function(section) {
        return translate('page.debug.configuration.' + section);
      };
      model[key_for('ports')] = {};
      model[key_for('hash_profile')] = null;
      model[key_for('lbg')] = {};
      model[key_for('mirror_groups')] = {};
      model[key_for('mappers')] = {};
      model[key_for('portset')] = {};
      model[key_for('acl')] = {};
      model[key_for('network')] = null;
      model[key_for('routing')] = null;
      model[key_for('ta_rules')] = null;
      model[key_for('users')] = null;
      return Model_service.do_with_port_lock(function() {
        return api.call('getLBGList').then(function(result) {
          var fn, i, lbg_id, len, ref;
          api.begin();
          ref = result.lbg_ids;
          fn = function(lbg_id) {
            return api.call('getLBG', {
              lbg_id: lbg_id
            }).then(function(result) {
              delete result.lbg_id;
              return model[key_for('lbg')][lbg_id] = result;
            });
          };
          for (i = 0, len = ref.length; i < len; i++) {
            lbg_id = ref[i];
            fn(lbg_id);
          }
          return api.end();
        }).then(function() {
          return api.call('getMirrorList');
        }).then(function(result) {
          var fn, i, len, mirror_id, ref;
          api.begin();
          ref = result.mirror_ids;
          fn = function(mirror_id) {
            return api.call('getMirror', {
              mirror_id: mirror_id
            }).then(function(result) {
              delete result.mirror_id;
              return model[key_for('mirror_groups')][mirror_id] = result;
            });
          };
          for (i = 0, len = ref.length; i < len; i++) {
            mirror_id = ref[i];
            fn(mirror_id);
          }
          return api.end();
        }).then(function() {
          api.begin();
          api.call('getACLPortSetList').then(function(result) {
            return model[key_for('portset')] = result;
          });
          return api.end();
        }).then(function(result) {
          var fn, mapper, ref, title;
          api.begin();
          ref = Enums.Mapper;
          fn = function(title, mapper) {
            return api.call('getMapper', {
              mapper_id: mapper.id
            }).then(function(result) {
              return model[key_for('mappers')][mapper.id + ' ' + title] = result.mapper_array;
            });
          };
          for (title in ref) {
            mapper = ref[title];
            fn(title, mapper);
          }
          return api.end();
        }).then(function() {
          return api.call('getRulesList').then(function(result) {
            return model[key_for('ta_rules')] = result;
          });
        }).then(function() {
          return api.call('getACLList');
        }).then(function(result) {
          var acl_id, fn, i, len, ref;
          api.begin();
          ref = result.acl_ids;
          fn = function(acl_id) {
            return api.call('getACL', {
              acl_id: acl_id
            }).then(function(result) {
              delete result.acl_id;
              return model[key_for('acl')][acl_id] = result;
            });
          };
          for (i = 0, len = ref.length; i < len; i++) {
            acl_id = ref[i];
            fn(acl_id);
          }
          api.call('getSwitchInfo').then(function(result) {
            var id, j, len1, port, ref1, results;
            ref1 = result.Ports;
            results = [];
            for (j = 0, len1 = ref1.length; j < len1; j++) {
              port = ref1[j];
              id = port.id;
              delete port.id;
              results.push(model[key_for('ports')][id] = port);
            }
            return results;
          });
          api.call('getNetConfig').then(function(result) {
            return model[key_for('network')] = result;
          });
          api.call('getDefaultHashProfile').then(function(result) {
            return model[key_for('hash_profile')] = result;
          });
          api.call('filedb.load', {
            database: 'system',
            file: 'routing.json'
          }).then(function(result) {
            return model[key_for('routing')] = result;
          });
          api.call('filedb.load', {
            database: 'system',
            file: 'users.json'
          }).then(function(result) {
            return model[key_for('users')] = result;
          });
          return api.end();
        }).then(function() {
          return $scope.device_configuration_json = model;
        }).then(function(batch) {
          return $scope.device_configuration_batch = batch;
        });
      })["catch"](function(error) {
        Status.error(error);
        return console.error(error.stack);
      })["finally"](function() {
        return $scope.refreshing_device_configuration = false;
      });
    };
    $scope.download_device_configuration = function() {
      return $scope.refresh_device_configuration().then(function() {
        return download_file($scope.device_configuration_json, 'configuration.txt');
      });
    };
    $scope.download_device_configuration_batch = function() {
      return $scope.refresh_device_configuration().then(function() {
        return download_file($scope.device_configuration_batch, 'configuration_batch.txt');
      });
    };
    $scope.validate_configuration_json = function(data) {};
    $scope.save_configuration = function(configuration) {
      return api.call('configuration.set', {
        configuration: configuration
      }).then(function(result) {
        if (result === 'application restart required') {
          return alert(translate('page.debug.notification.restart_gulp'));
        }
        return alert('Не удалось перезапустить приложение');
      })["catch"](function(error) {
        return GUI.wait_for_connection(4, 'Конфигурация сохранена. Приложение перезапускается', {
          to: 'gui'
        });
      });
    };
    $scope.save_configuration_json = function() {
      var configuration, error, error1, error2;
      try {
        configuration = $scope.configuration_json_editor.get();
      } catch (error1) {
        error = error1;
        if (error instanceof SyntaxError) {
          alert(translate('page.debug.administration.error.configuration_json', {
            error: error.stack
          }));
          console.error(error.stack);
          return;
        } else {
          throw error;
        }
      }
      try {
        $scope.validate_configuration_json(configuration);
      } catch (error2) {
        error = error2;
        console.error(error.stack || error);
        Status.error(error);
        return;
      }
      $scope.busy = true;
      return $scope.save_configuration(configuration)["finally"](function() {
        return $scope.busy = false;
      });
    };
    $scope.change_language = function() {
      $scope.busy = true;
      return api.call('configuration.get').then(function(configuration) {
        configuration.language = $scope.language;
        return $scope.save_configuration(configuration);
      })["catch"](function(error) {
        Status.error(error);
        return console.error(error.stack);
      })["finally"](function() {
        return $scope.busy = false;
      });
    };
    return $scope.initialize_page_with(function() {
      var dummy_batch_input, dummy_command_input, key, value;
      $scope.command = 'getSwitchInfo';
      $scope.command_input_editor = new JSONEditor(document.querySelector(".command_input"), {
        mode: 'code'
      });
      $scope.command_input_editor.editor.setOptions({
        fontSize: "14pt"
      });
      dummy_command_input = {
        key: 123
      };
      $scope.command_input_editor.set(dummy_command_input);
      $scope.command_output_editor = new JSONEditor(document.querySelector(".command_output"), {
        mode: 'view'
      });
      $scope.command_output_editor.setName('response');
      $scope.command_output_mode = 'tree';
      $scope.command_output = {};
      $scope.batch_input_editor = new JSONEditor(document.querySelector(".batch_input"), {
        mode: 'code'
      });
      $scope.batch_input_editor.editor.setOptions({
        fontSize: "14pt"
      });
      dummy_batch_input = [
        {
          method: 'getSwitchInfo',
          params: {
            key: 123
          }
        }, {
          method: 'getSwitchInfo',
          params: {
            key: 123
          }
        }
      ];
      $scope.batch_input_editor.set(dummy_batch_input);
      $scope.batch_output_editor = new JSONEditor(document.querySelector(".batch_output"), {
        mode: 'view'
      });
      $scope.batch_output_editor.setName('batch');
      $scope.batch_output_mode = 'tree';
      $scope.batch_output = [];
      $scope.show_device_configuration_text = false;
      $scope.device_configuration_json = {};
      $scope.$watch('device_configuration_json', function(value) {
        return $scope.device_configuration_editor.set(value);
      });
      $scope.device_configuration_editor = new JSONEditor(document.querySelector(".device_configuration"), {
        mode: 'view'
      });
      $scope.device_configuration_editor.setName(translate('page.debug.configuration.output_title'));
      api.call('configuration.get').then(function(configuration) {
        $scope.configuration_json_editor = new JSONEditor(document.querySelector(".configuration_json"), {
          mode: 'code'
        });
        $scope.configuration_json_editor.editor.setOptions({
          fontSize: "14pt"
        });
        return $scope.configuration_json_editor.set(configuration);
      });
      $scope.language = $rootScope.configuration.language;
      $scope.languages = [];
      for (key in i18n) {
        value = i18n[key];
        $scope.languages.push({
          key: key,
          label: value.language_name
        });
      }
      return $scope.refresh_device_configuration();
    });
  }]);

}).call(this);

/*!
 * modernizr v3.0.0-alpha.3
 * Build http://v3.modernizr.com/download/#-cssanimations-displaytable-draganddrop-flexbox-flexboxlegacy-hasevent-dontmin
 *
 * Copyright (c)
 *  Faruk Ates
 *  Paul Irish
 *  Alex Sexton
 *  Ryan Seddon
 *  Alexander Farkas
 *  Patrick Kettner
 *  Stu Cox
 *  Richard Herrera

 * MIT License
 */

/*
 * Modernizr tests which native CSS3 and HTML5 features are available in the
 * current UA and makes the results available to you in two ways: as properties on
 * a global `Modernizr` object, and as classes on the `<html>` element. This
 * information allows you to progressively enhance your pages with a granular level
 * of control over the experience.
*/

;(function(window, document, undefined){
  var tests = [];
  

  var ModernizrProto = {
    // The current version, dummy
    _version: '3.0.0-alpha.3',

    // Any settings that don't work as separate modules
    // can go in here as configuration.
    _config: {
      'classPrefix' : '',
      'enableClasses' : true,
      'enableJSClass' : true,
      'usePrefixes' : true
    },

    // Queue of tests
    _q: [],

    // Stub these for people who are listening
    on: function( test, cb ) {
      // I don't really think people should do this, but we can
      // safe guard it a bit.
      // -- NOTE:: this gets WAY overridden in src/addTest for
      // actual async tests. This is in case people listen to
      // synchronous tests. I would leave it out, but the code
      // to *disallow* sync tests in the real version of this
      // function is actually larger than this.
      var self = this;
      setTimeout(function() {
        cb(self[test]);
      }, 0);
    },

    addTest: function( name, fn, options ) {
      tests.push({name : name, fn : fn, options : options });
    },

    addAsyncTest: function (fn) {
      tests.push({name : null, fn : fn});
    }
  };

  

  // Fake some of Object.create
  // so we can force non test results
  // to be non "own" properties.
  var Modernizr = function(){};
  Modernizr.prototype = ModernizrProto;

  // Leak modernizr globally when you `require` it
  // rather than force it here.
  // Overwrite name so constructor name is nicer :D
  Modernizr = new Modernizr();

  

  var createElement = function() {
    if (typeof document.createElement !== 'function') {
      // This is the case in IE7, where the type of createElement is "object".
      // For this reason, we cannot call apply() as Object is not a Function.
      return document.createElement(arguments[0]);
    } else {
      return document.createElement.apply(document, arguments);
    }
  };
  
/*!
{
  "name": "Drag & Drop",
  "property": "draganddrop",
  "caniuse": "dragndrop",
  "knownBugs": ["Mobile browsers like Android, iOS < 6, and Firefox OS technically support the APIs, but don't expose it to the end user, resulting in a false positive."],
  "notes": [{
    "name": "W3C spec",
    "href": "http://www.w3.org/TR/2010/WD-html5-20101019/dnd.html"
  }],
  "polyfills": ["dropfile", "moxie", "fileapi"]
}
!*/
/* DOC
Detects support for native drag & drop of elements.
*/

  Modernizr.addTest('draganddrop', function() {
    var div = createElement('div');
    return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
  });


  // isEventSupported determines if the given element supports the given event
  // kangax.github.com/iseventsupported/
  // github.com/Modernizr/Modernizr/pull/636
  //
  // Known incorrects:
  //   Modernizr.hasEvent("webkitTransitionEnd", elem) // false negative
  //   Modernizr.hasEvent("textInput") // in Webkit. github.com/Modernizr/Modernizr/issues/333
  var isEventSupported = (function (undefined) {

    // Detect whether event support can be detected via `in`. Test on a DOM element
    // using the "blur" event b/c it should always exist. bit.ly/event-detection
    var needsFallback = !('onblur' in document.documentElement);

    /**
     * @param  {string|*}           eventName  is the name of an event to test for (e.g. "resize")
     * @param  {(Object|string|*)=} element    is the element|document|window|tagName to test on
     * @return {boolean}
     */
    function isEventSupportedInner( eventName, element ) {

      var isSupported;
      if ( !eventName ) { return false; }
      if ( !element || typeof element === 'string' ) {
        element = createElement(element || 'div');
      }

      // Testing via the `in` operator is sufficient for modern browsers and IE.
      // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and
      // "resize", whereas `in` "catches" those.
      eventName = 'on' + eventName;
      isSupported = eventName in element;

      // Fallback technique for old Firefox - bit.ly/event-detection
      if ( !isSupported && needsFallback ) {
        if ( !element.setAttribute ) {
          // Switch to generic element if it lacks `setAttribute`.
          // It could be the `document`, `window`, or something else.
          element = createElement('div');
        }

        element.setAttribute(eventName, '');
        isSupported = typeof element[eventName] === 'function';

        if ( element[eventName] !== undefined ) {
          // If property was created, "remove it" by setting value to `undefined`.
          element[eventName] = undefined;
        }
        element.removeAttribute(eventName);
      }

      return isSupported;
    }
    return isEventSupportedInner;
  })();

  

  // Modernizr.hasEvent() detects support for a given event, with an optional element to test on
  // Modernizr.hasEvent('gesturestart', elem)
  var hasEvent = ModernizrProto.hasEvent = isEventSupported;
  

  /**
   * is returns a boolean for if typeof obj is exactly type.
   */
  function is( obj, type ) {
    return typeof obj === type;
  }
  ;

  var classes = [];
  

  // Run through all tests and detect their support in the current UA.
  function testRunner() {
    var featureNames;
    var feature;
    var aliasIdx;
    var result;
    var nameIdx;
    var featureName;
    var featureNameSplit;

    for ( var featureIdx in tests ) {
      featureNames = [];
      feature = tests[featureIdx];
      // run the test, throw the return value into the Modernizr,
      //   then based on that boolean, define an appropriate className
      //   and push it into an array of classes we'll join later.
      //
      //   If there is no name, it's an 'async' test that is run,
      //   but not directly added to the object. That should
      //   be done with a post-run addTest call.
      if ( feature.name ) {
        featureNames.push(feature.name.toLowerCase());

        if (feature.options && feature.options.aliases && feature.options.aliases.length) {
          // Add all the aliases into the names list
          for (aliasIdx = 0; aliasIdx < feature.options.aliases.length; aliasIdx++) {
            featureNames.push(feature.options.aliases[aliasIdx].toLowerCase());
          }
        }
      }

      // Run the test, or use the raw value if it's not a function
      result = is(feature.fn, 'function') ? feature.fn() : feature.fn;


      // Set each of the names on the Modernizr object
      for (nameIdx = 0; nameIdx < featureNames.length; nameIdx++) {
        featureName = featureNames[nameIdx];
        // Support dot properties as sub tests. We don't do checking to make sure
        // that the implied parent tests have been added. You must call them in
        // order (either in the test, or make the parent test a dependency).
        //
        // Cap it to TWO to make the logic simple and because who needs that kind of subtesting
        // hashtag famous last words
        featureNameSplit = featureName.split('.');

        if (featureNameSplit.length === 1) {
          Modernizr[featureNameSplit[0]] = result;
        } else {
          // cast to a Boolean, if not one already
          /* jshint -W053 */
          if (Modernizr[featureNameSplit[0]] && !(Modernizr[featureNameSplit[0]] instanceof Boolean)) {
            Modernizr[featureNameSplit[0]] = new Boolean(Modernizr[featureNameSplit[0]]);
          }

          Modernizr[featureNameSplit[0]][featureNameSplit[1]] = result;
        }

        classes.push((result ? '' : 'no-') + featureNameSplit.join('-'));
      }
    }
  }

  ;

  var docElement = document.documentElement;
  

  function getBody() {
    // After page load injecting a fake body doesn't work so check if body exists
    var body = document.body;

    if(!body) {
      // Can't use the real body create a fake one.
      body = createElement('body');
      body.fake = true;
    }

    return body;
  }

  ;

  // Inject element with style element and some CSS rules
  function injectElementWithStyles( rule, callback, nodes, testnames ) {
    var mod = 'modernizr';
    var style;
    var ret;
    var node;
    var docOverflow;
    var div = createElement('div');
    var body = getBody();

    if ( parseInt(nodes, 10) ) {
      // In order not to give false positives we create a node for each test
      // This also allows the method to scale for unspecified uses
      while ( nodes-- ) {
        node = createElement('div');
        node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
        div.appendChild(node);
      }
    }

    // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
    // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
    // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
    // msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
    // Documents served as xml will throw if using &shy; so use xml friendly encoded version. See issue #277
    style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
    div.id = mod;
    // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
    // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
    (!body.fake ? div : body).innerHTML += style;
    body.appendChild(div);
    if ( body.fake ) {
      //avoid crashing IE8, if background image is used
      body.style.background = '';
      //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
      body.style.overflow = 'hidden';
      docOverflow = docElement.style.overflow;
      docElement.style.overflow = 'hidden';
      docElement.appendChild(body);
    }

    ret = callback(div, rule);
    // If this is done after page load we don't want to remove the body so check if body exists
    if ( body.fake ) {
      body.parentNode.removeChild(body);
      docElement.style.overflow = docOverflow;
      // Trigger layout so kinetic scrolling isn't disabled in iOS6+
      docElement.offsetHeight;
    } else {
      div.parentNode.removeChild(div);
    }

    return !!ret;

  }

  ;

  var testStyles = ModernizrProto.testStyles = injectElementWithStyles;
  
/*!
{
  "name": "CSS Display table",
  "property": "displaytable",
  "caniuse": "css-table",
  "authors": ["scottjehl"],
  "tags": ["css"],
  "builderAliases": ["css_displaytable"],
  "notes": [{
    "name": "Detects for all additional table display values",
    "href": "http://pastebin.com/Gk9PeVaQ"
  }]
}
!*/
/* DOC
`display: table` and `table-cell` test. (both are tested under one name `table-cell` )
*/

  // If a document is in rtl mode this test will fail so we force ltr mode on the injeced
  // element https://github.com/Modernizr/Modernizr/issues/716
  testStyles('#modernizr{display: table; direction: ltr}#modernizr div{display: table-cell; padding: 10px}', function( elem ) {
    var ret;
    var child = elem.children;
    ret = child[0].offsetLeft < child[1].offsetLeft;
    Modernizr.addTest('displaytable', ret, { aliases: ['display-table'] });
  },2);


  // Helper function for converting kebab-case to camelCase,
  // e.g. box-sizing -> boxSizing
  function cssToDOM( name ) {
    return name.replace(/([a-z])-([a-z])/g, function(str, m1, m2) {
      return m1 + m2.toUpperCase();
    }).replace(/^-/, '');
  }
  ;

  /**
   * contains returns a boolean for if substr is found within str.
   */
  function contains( str, substr ) {
    return !!~('' + str).indexOf(substr);
  }

  ;

  // Change the function's scope.
  function fnBind(fn, that) {
    return function() {
      return fn.apply(that, arguments);
    };
  }

  ;

  /**
   * testDOMProps is a generic DOM property test; if a browser supports
   *   a certain property, it won't return undefined for it.
   */
  function testDOMProps( props, obj, elem ) {
    var item;

    for ( var i in props ) {
      if ( props[i] in obj ) {

        // return the property name as a string
        if (elem === false) return props[i];

        item = obj[props[i]];

        // let's bind a function
        if (is(item, 'function')) {
          // bind to obj unless overriden
          return fnBind(item, elem || obj);
        }

        // return the unbound function or obj or value
        return item;
      }
    }
    return false;
  }

  ;

  // Following spec is to expose vendor-specific style properties as:
  //   elem.style.WebkitBorderRadius
  // and the following would be incorrect:
  //   elem.style.webkitBorderRadius

  // Webkit ghosts their properties in lowercase but Opera & Moz do not.
  // Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
  //   erik.eae.net/archives/2008/03/10/21.48.10/

  // More here: github.com/Modernizr/Modernizr/issues/issue/21
  var omPrefixes = 'Moz O ms Webkit';
  

  var cssomPrefixes = (ModernizrProto._config.usePrefixes ? omPrefixes.split(' ') : []);
  ModernizrProto._cssomPrefixes = cssomPrefixes;
  

  var domPrefixes = (ModernizrProto._config.usePrefixes ? omPrefixes.toLowerCase().split(' ') : []);
  ModernizrProto._domPrefixes = domPrefixes;
  

  /**
   * Create our "modernizr" element that we do most feature tests on.
   */
  var modElem = {
    elem : createElement('modernizr')
  };

  // Clean up this element
  Modernizr._q.push(function() {
    delete modElem.elem;
  });

  

  var mStyle = {
    style : modElem.elem.style
  };

  // kill ref for gc, must happen before
  // mod.elem is removed, so we unshift on to
  // the front of the queue.
  Modernizr._q.unshift(function() {
    delete mStyle.style;
  });

  

  // Helper function for converting camelCase to kebab-case,
  // e.g. boxSizing -> box-sizing
  function domToCSS( name ) {
    return name.replace(/([A-Z])/g, function(str, m1) {
      return '-' + m1.toLowerCase();
    }).replace(/^ms-/, '-ms-');
  }
  ;

  // Function to allow us to use native feature detection functionality if available.
  // Accepts a list of property names and a single value
  // Returns `undefined` if native detection not available
  function nativeTestProps ( props, value ) {
    var i = props.length;
    // Start with the JS API: http://www.w3.org/TR/css3-conditional/#the-css-interface
    if ('CSS' in window && 'supports' in window.CSS) {
      // Try every prefixed variant of the property
      while (i--) {
        if (window.CSS.supports(domToCSS(props[i]), value)) {
          return true;
        }
      }
      return false;
    }
    // Otherwise fall back to at-rule (for Opera 12.x)
    else if ('CSSSupportsRule' in window) {
      // Build a condition string for every prefixed variant
      var conditionText = [];
      while (i--) {
        conditionText.push('(' + domToCSS(props[i]) + ':' + value + ')');
      }
      conditionText = conditionText.join(' or ');
      return injectElementWithStyles('@supports (' + conditionText + ') { #modernizr { position: absolute; } }', function( node ) {
        return getComputedStyle(node, null).position == 'absolute';
      });
    }
    return undefined;
  }
  ;

  // testProps is a generic CSS / DOM property test.

  // In testing support for a given CSS property, it's legit to test:
  //    `elem.style[styleName] !== undefined`
  // If the property is supported it will return an empty string,
  // if unsupported it will return undefined.

  // We'll take advantage of this quick test and skip setting a style
  // on our modernizr element, but instead just testing undefined vs
  // empty string.

  // Property names can be provided in either camelCase or kebab-case.

  function testProps( props, prefixed, value, skipValueTest ) {
    skipValueTest = is(skipValueTest, 'undefined') ? false : skipValueTest;

    // Try native detect first
    if (!is(value, 'undefined')) {
      var result = nativeTestProps(props, value);
      if(!is(result, 'undefined')) {
        return result;
      }
    }

    // Otherwise do it properly
    var afterInit, i, propsLength, prop, before;

    // If we don't have a style element, that means
    // we're running async or after the core tests,
    // so we'll need to create our own elements to use
    if ( !mStyle.style ) {
      afterInit = true;
      mStyle.modElem = createElement('modernizr');
      mStyle.style = mStyle.modElem.style;
    }

    // Delete the objects if we
    // we created them.
    function cleanElems() {
      if (afterInit) {
        delete mStyle.style;
        delete mStyle.modElem;
      }
    }

    propsLength = props.length;
    for ( i = 0; i < propsLength; i++ ) {
      prop = props[i];
      before = mStyle.style[prop];

      if (contains(prop, '-')) {
        prop = cssToDOM(prop);
      }

      if ( mStyle.style[prop] !== undefined ) {

        // If value to test has been passed in, do a set-and-check test.
        // 0 (integer) is a valid property value, so check that `value` isn't
        // undefined, rather than just checking it's truthy.
        if (!skipValueTest && !is(value, 'undefined')) {

          // Needs a try catch block because of old IE. This is slow, but will
          // be avoided in most cases because `skipValueTest` will be used.
          try {
            mStyle.style[prop] = value;
          } catch (e) {}

          // If the property value has changed, we assume the value used is
          // supported. If `value` is empty string, it'll fail here (because
          // it hasn't changed), which matches how browsers have implemented
          // CSS.supports()
          if (mStyle.style[prop] != before) {
            cleanElems();
            return prefixed == 'pfx' ? prop : true;
          }
        }
        // Otherwise just return true, or the property name if this is a
        // `prefixed()` call
        else {
          cleanElems();
          return prefixed == 'pfx' ? prop : true;
        }
      }
    }
    cleanElems();
    return false;
  }

  ;

  /**
   * testPropsAll tests a list of DOM properties we want to check against.
   *     We specify literally ALL possible (known and/or likely) properties on
   *     the element including the non-vendor prefixed one, for forward-
   *     compatibility.
   */
  function testPropsAll( prop, prefixed, elem, value, skipValueTest ) {

    var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1),
    props = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

    // did they call .prefixed('boxSizing') or are we just testing a prop?
    if(is(prefixed, 'string') || is(prefixed, 'undefined')) {
      return testProps(props, prefixed, value, skipValueTest);

      // otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
    } else {
      props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
      return testDOMProps(props, prefixed, elem);
    }
  }

  // Modernizr.testAllProps() investigates whether a given style property,
  //     or any of its vendor-prefixed variants, is recognized
  // Note that the property names must be provided in the camelCase variant.
  // Modernizr.testAllProps('boxSizing')
  ModernizrProto.testAllProps = testPropsAll;

  

  /**
   * testAllProps determines whether a given CSS property, in some prefixed
   * form, is supported by the browser. It can optionally be given a value; in
   * which case testAllProps will only return true if the browser supports that
   * value for the named property; this latter case will use native detection
   * (via window.CSS.supports) if available. A boolean can be passed as a 3rd
   * parameter to skip the value check when native detection isn't available,
   * to improve performance when simply testing for support of a property.
   *
   * @param prop - String naming the property to test (either camelCase or
   *               kebab-case)
   * @param value - [optional] String of the value to test
   * @param skipValueTest - [optional] Whether to skip testing that the value
   *                        is supported when using non-native detection
   *                        (default: false)
   */
  function testAllProps (prop, value, skipValueTest) {
    return testPropsAll(prop, undefined, undefined, value, skipValueTest);
  }
  ModernizrProto.testAllProps = testAllProps;
  
/*!
{
  "name": "CSS Animations",
  "property": "cssanimations",
  "caniuse": "css-animation",
  "polyfills": ["transformie", "csssandpaper"],
  "tags": ["css"],
  "warnings": ["Android < 4 will pass this test, but can only animate a single property at a time"],
  "notes": [{
    "name" : "Article: 'Dispelling the Android CSS animation myths'",
    "href": "http://goo.gl/OGw5Gm"
  }]
}
!*/
/* DOC
Detects whether or not elements can be animated using CSS
*/

  Modernizr.addTest('cssanimations', testAllProps('animationName', 'a', true));

/*!
{
  "name": "Flexbox (legacy)",
  "property": "flexboxlegacy",
  "tags": ["css"],
  "polyfills": ["flexie"],
  "notes": [{
    "name": "The _old_ flexbox",
    "href": "http://www.w3.org/TR/2009/WD-css3-flexbox-20090723/"
  }]
}
!*/

  Modernizr.addTest('flexboxlegacy', testAllProps('boxDirection', 'reverse', true));

/*!
{
  "name": "Flexbox",
  "property": "flexbox",
  "caniuse": "flexbox",
  "tags": ["css"],
  "notes": [{
    "name": "The _new_ flexbox",
    "href": "http://dev.w3.org/csswg/css3-flexbox"
  }],
  "warnings": [
    "A `true` result for this detect does not imply that the `flex-wrap` property is supported; see the `flexwrap` detect."
  ]
}
!*/
/* DOC
Detects support for the Flexible Box Layout model, a.k.a. Flexbox, which allows easy manipulation of layout order and sizing within a container.
*/

  Modernizr.addTest('flexbox', testAllProps('flexBasis', '1px', true));


  // Run each test
  testRunner();

  delete ModernizrProto.addTest;
  delete ModernizrProto.addAsyncTest;

  // Run the things that are supposed to run after the tests
  for (var i = 0; i < Modernizr._q.length; i++) {
    Modernizr._q[i]();
  }

  // Leak Modernizr namespace
  window.Modernizr = Modernizr;


;

})(window, document);
(function() {
  'use strict';
  app.controller("PortsCtrl", ["$scope", "Configuration", "Device", "Enums", "Port", "Promises", "Model", "Model_service", "api", "Device_GUI", "Status", "Graph", "Port_view", "Port_numeration", "translate", function($scope, Configuration, Device, Enums, Port, Promises, Model, Model_service, api, Device_GUI, Status, Graph, Port_view, Port_numeration, translate) {
    var sfp_power_statuses;
    sfp_power_statuses = {
      critical: [[0, Infinity], [-Infinity, -17]],
      warning: [[-3, 0], [-17, -12]],
      normal: [[-12, -3]]
    };
    $scope.parser_level_title = function(parser_level) {
      var key, ref, value;
      ref = Enums.port_parser_levels;
      for (key in ref) {
        value = ref[key];
        if (value === parser_level) {
          return key;
        }
      }
    };
    $scope.busy = function(ports) {
      var i, len, port, results;
      results = [];
      for (i = 0, len = ports.length; i < len; i++) {
        port = ports[i];
        results.push($scope.busy_ports[port] = true);
      }
      return results;
    };
    $scope.not_busy = function(ports) {
      var i, len, port, results;
      results = [];
      for (i = 0, len = ports.length; i < len; i++) {
        port = ports[i];
        results.push($scope.busy_ports[port] = false);
      }
      return results;
    };
    $scope.is_busy = function(port) {
      return $scope.busy_ports[port];
    };
    $scope.batch = function(port, action_for_generic, action_for_joinable) {
      var actions, i, len, port_info, ref, subport;
      port_info = $scope.ports_info[port.id - 1];
      switch (port_info.type) {
        case 'generic':
          return action_for_generic(port);
        case 'joinable':
          actions = [];
          ref = port_info.joint_port.ports;
          for (i = 0, len = ref.length; i < len; i++) {
            subport = ref[i];
            actions.push(action_for_joinable(subport));
          }
          return function() {
            var action, j, len1;
            api.begin();
            for (j = 0, len1 = actions.length; j < len1; j++) {
              action = actions[j];
              if (action != null) {
                action();
              }
            }
            return api.end();
          };
      }
    };
    $scope.port_transaction = function(prepare_action) {
      var ports, using;
      ports = [];
      using = function(port) {
        return ports.push(port.id);
      };
      Status.busy();
      return Promises.promise(function() {
        return Model_service.do_with_port_lock(function() {
          var action;
          action = prepare_action(using);
          $scope.busy(ports);
          return action().then(function() {
            return Device.save_configuration();
          }).then(function() {
            return $scope.safeApply(function() {
              return Status.not_busy();
            });
          });
        })["finally"](function() {
          return $scope.not_busy(ports);
        }).$apply($scope);
      });
    };
    $scope.enable_port = function(port) {
      return $scope.port_transaction(function(using) {
        return $scope.batch(port, function() {
          using(port);
          return function() {
            return Port.enable(port);
          };
        }, function(subport) {
          if ($scope.joint_port_for(subport).mode === '40G') {
            using(port);
            return function() {
              return Port.enable(subport);
            };
          } else if (subport.id === port.id) {
            using(subport);
            return function() {
              return Port.enable(subport);
            };
          }
        });
      });
    };
    $scope.disable_port = function(port) {
      return $scope.port_transaction(function(using) {
        return $scope.batch(port, function() {
          using(port);
          return function() {
            return Port.disable(port);
          };
        }, function(subport) {
          if ($scope.joint_port_for(subport).mode === '40G') {
            using(subport);
            return function() {
              return Port.disable(subport);
            };
          } else if (subport.id === port.id) {
            using(subport);
            return function() {
              return Port.disable(subport);
            };
          }
        });
      });
    };
    $scope.toggle_port = function(port) {
      if (!port.enabled) {
        return $scope.disable_port(port);
      } else {
        return $scope.enable_port(port);
      }
    };
    $scope.set_port_mode = function(port) {
      return $scope.port_transaction(function(using) {
        using(port);
        return function() {
          return Port.set_eth_mode(port);
        };
      });
    };
    $scope.set_port_force_up = function(port, force_up) {
      return $scope.port_transaction(function(using) {
        using(port);
        return function() {
          var prepare;
          prepare = force_up ? (port.loopback = false, Port.set_loopback(port)) : dummy_promise();
          return prepare.then(function() {
            port.force_up = force_up;
            return Port.set_force_up(port);
          });
        };
      });
    };
    $scope.set_port_loopback = function(port, loopback) {
      if (loopback) {
        if (!confirm(translate('page.ports.loopback_confirm'))) {
          return;
        }
      }
      return $scope.port_transaction(function(using) {
        using(port);
        return function() {
          var prepare;
          prepare = loopback ? (port.force_up = false, Port.set_force_up(port)) : dummy_promise();
          return prepare.then(function() {
            port.loopback = loopback;
            return Port.set_loopback(port);
          });
        };
      });
    };
    $scope.set_joint_port_mode = function(joint_port) {
      return $scope.port_transaction(function(using) {
        var i, len, port, ref;
        ref = joint_port.ports;
        for (i = 0, len = ref.length; i < len; i++) {
          port = ref[i];
          using(port);
        }
        return function() {
          var j, k, l, len1, len2, len3, ref1, ref2, ref3;
          Port.set_subport_modes(joint_port);
          Device_GUI.refresh_port_coordinates();
          if (joint_port.mode === '4x10G') {
            if (Port_view.is_selected(joint_port.ports[0])) {
              ref1 = joint_port.ports;
              for (j = 0, len1 = ref1.length; j < len1; j++) {
                port = ref1[j];
                Port_view.select(port, false);
              }
            }
          } else {
            ref2 = joint_port.ports;
            for (k = 0, len2 = ref2.length; k < len2; k++) {
              port = ref2[k];
              if (port !== joint_port.ports[0]) {
                Port_view.deselect(port, false);
              }
            }
          }
          api.begin();
          ref3 = joint_port.ports;
          for (l = 0, len3 = ref3.length; l < len3; l++) {
            port = ref3[l];
            Port.set_eth_mode({
              id: port.id,
              eth_mode: Enums.ethernet_port_modes.DISABLED
            });
          }
          return api.end().then(function() {
            var len4, m, ref4;
            api.begin();
            ref4 = joint_port.ports;
            for (m = 0, len4 = ref4.length; m < len4; m++) {
              port = ref4[m];
              Port.set_eth_mode(port);
            }
            return api.end();
          });
        };
      });
    };
    $scope.is_generic = function(port) {
      return Port.is_generic(port.id);
    };
    $scope.is_first_in_joint_port = function(port) {
      var port_info;
      port_info = $scope.ports_info[port.id - 1];
      return port_info.type === 'joinable' && port_info.is_first_in_joint;
    };
    $scope.joint_port_for = function(port) {
      return $scope.ports_info[port.id - 1].joint_port;
    };
    $scope.if_show_port = function(port) {
      if (Port.is_generic(port.id)) {
        return true;
      }
      if ($scope.joint_port_for(port).mode === '4x10G') {
        return true;
      }
      return $scope.is_first_in_joint_port(port);
    };
    $scope.subport_id = function(port) {
      var joint_port_id, port_id, ref;
      joint_port_id = 0;
      port_id = 0;
      ref = Port_numeration.joined_port_id_from_port_id(port.id), joint_port_id = ref[0], port_id = ref[1];
      return port_id;
    };
    $scope.reset_port_stats = function() {
      if ($scope.can_reset_port_stats === false) {
        return;
      }
      $scope.can_reset_port_stats = false;
      return Promises.promise(function() {
        return Port.reset_stats().then(function() {
          return $scope.urge_port_refresh();
        })["finally"](function() {
          return $scope.can_reset_port_stats = true;
        }).$apply($scope);
      });
    };
    $scope.is_known_ethernet_port_mode = function(mode_value) {
      var i, len, mode, ref;
      ref = $scope.ethernet_port_modes;
      for (i = 0, len = ref.length; i < len; i++) {
        mode = ref[i];
        if (mode.value === mode_value) {
          return true;
        }
      }
    };
    $scope.ethernet_port_mode_name_by_id = function(mode) {
      var key, ref, value;
      ref = Enums.ethernet_port_modes;
      for (key in ref) {
        value = ref[key];
        if (value === mode) {
          return key;
        }
      }
    };
    $scope.toggle_comment_form = function(port, comment) {
      $scope.comment_forms[port.id] = !$scope.comment_forms[port.id] ? true : false;
      if (!$scope.comment_forms[port.id]) {
        return Promises.promise(function() {
          return Configuration.Ports.set_comment(port, comment);
        });
      }
    };
    $scope.get_sfp_power_status = function(port) {
      var dbm, in_range, matches, status, values;
      matches = port.sfp_data.rx_power.match(/(-?[\d.]+).?dBm/);
      if (!matches) {
        return '';
      }
      dbm = parseFloat(matches[1]);
      for (status in sfp_power_statuses) {
        values = sfp_power_statuses[status];
        in_range = values.filter(function(range) {
          return dbm >= range[0] && dbm <= range[1];
        });
        if (in_range.length) {
          return status;
        }
      }
      throw new Error('Range for rx_power|dBm value doesn\'t exists');
    };
    return $scope.initialize_page_with(function() {
      var i, len, port, ref;
      $scope.Graph = Graph;
      Graph.for_ports('.graphic');
      $scope.ethernet_port_modes = [
        {
          title: '1G',
          value: Enums.ethernet_port_modes['1000BASE_X']
        }, {
          title: '10G',
          value: Enums.ethernet_port_modes['10GBASE_CR']
        }
      ];
      $scope.ethernet_port_modes_for_40g = [
        {
          title: '40G',
          value: '40G'
        }, {
          title: '4x10G',
          value: '4x10G'
        }
      ];
      $scope.ports_info = (function() {
        var i, len, ref, results;
        ref = Model.ports;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          port = ref[i];
          results.push(Port_numeration.categorize_port(port.id));
        }
        return results;
      })();
      $scope.busy_ports = {};
      $scope.sfp_info_id = null;
      $scope.comment_forms = [];
      ref = Model.ports;
      for (i = 0, len = ref.length; i < len; i++) {
        port = ref[i];
        $scope.comment_forms[port.id] = false;
      }
      return Promises.promise(function() {
        return Configuration.Ports.load_comments(Model).then(function() {
          return $scope.ready = true;
        }).$apply($scope);
      });
    });
  }]);

}).call(this);

app
  .directive('sfpInfo', ["Port", "Port_numeration", function(Port, Port_numeration) {
    return {
      restrict: 'E',
      scope: {
        data: '=data',
        port_id: '=portId'
      },
      templateUrl: 'pages/include/sfp_info.html'
    };
  }]);

(function() {
  'use strict';
  app.controller("RulesCtrl", ["$rootScope", "$scope", "$filter", "$location", "$timeout", "$q", "translate", "api", "log", "Promises", "Device_routing", "Port", "Rule", "Enums", "Device", "Status", "Model", "Model_service", "Configuration", "Graph", "Routing_model_errors", "Port_view", "Port_numeration", function($rootScope, $scope, $filter, $location, $timeout, $q, translate, api, log, Promises, Device_routing, Port, Rule, Enums, Device, Status, Model, Model_service, Configuration, Graph, Routing_model_errors, Port_view, Port_numeration) {
    $scope._single_complex_filter = function(rule) {
      var complex_types;
      complex_types = ['IP_protocol_source', 'IP_protocol_destination', 'IP_protocol'];
      return rule.filters.length === 2 && rule.filters.filter(function(f) {
        return complex_types.indexOf(f.type) !== -1;
      }).length === 2;
    };
    $scope.hide_bracket = function(rule) {
      return rule.filters.length < 2 || $scope._single_complex_filter(rule);
    };
    $scope.single_filter = function(rule) {
      return rule.filters.length === 1 || $scope._single_complex_filter(rule);
    };
    $scope.sort_by_id = function(array) {
      var sorter;
      sorter = function(one, two) {
        if (one.id > two.id) {
          return 1;
        } else if (one.id === two.id) {
          return 0;
        } else {
          return -1;
        }
      };
      return array.sort(sorter);
    };
    $scope.next_id = function(array) {
      var id, item, j, len, max;
      max = 0;
      for (j = 0, len = array.length; j < len; j++) {
        item = array[j];
        id = item.id;
        max = Math.max(max, id);
      }
      return max + 1;
    };
    $scope.next_priority = function(array) {
      var item, j, len, max, priority;
      max = 0;
      for (j = 0, len = array.length; j < len; j++) {
        item = array[j];
        priority = item.priority;
        max = Math.max(max, priority);
      }
      return max + 1;
    };
    $scope.unselect_all = function() {
      var j, k, key, len, len1, port, ref, ref1, results, rule;
      Port_view.deselect_all();
      ref = $scope.view.rules;
      for (rule = j = 0, len = ref.length; j < len; rule = ++j) {
        key = ref[rule];
        rule.selected = false;
      }
      ref1 = $rootScope.view.ports;
      results = [];
      for (port = k = 0, len1 = ref1.length; k < len1; port = ++k) {
        key = ref1[port];
        port.selectedIn = false;
        results.push(port.selectedOut = false);
      }
      return results;
    };
    $scope.by_id = function(id, where) {
      return where.filter(function(item) {
        return item.id === id;
      })[0];
    };
    $scope.init_stickyeah = function() {
      return $timeout(function() {
        return $.stickyeah();
      });
    };
    $scope.new_rule = {
      set: function(rule, mode) {
        $scope.view.new_rule_id = rule.id;
        $scope.view.new_rule_mode = mode;
        $scope.new_rule.cancel_add_timeout();
        jQuery("html, body").animate({
          scrollTop: '0px'
        });
        if (mode === 'add') {
          return $scope.new_rule.set_add_timeout(5 * 1000);
        }
      },
      reset: function() {
        $scope.view.new_rule_id = null;
        $scope.view.mode = null;
        return $scope.new_rule.cancel_add_timeout();
      },
      adding_new_rule_and_not_timed_out: function() {
        return $scope.view.new_rule_id && $scope.view.add_new_rule_timeout;
      },
      set_add_timeout: function(delay) {
        return $scope.view.add_new_rule_timeout = setTimeout(function() {
          return $scope.view.add_new_rule_timeout = null;
        }, delay);
      },
      cancel_add_timeout: function() {
        if ($scope.view.add_new_rule_timeout) {
          clearTimeout($scope.view.add_new_rule_timeout);
          return $scope.view.add_new_rule_timeout = null;
        }
      },
      is: function(rule) {
        return $scope.view.new_rule_id === rule.id;
      }
    };
    $scope.watch_rules = function() {
      if ($scope.watching_rules) {
        return;
      }
      $scope.$watch('model.rules', $scope.RULE.rules_changed, true);
      return $scope.watching_rules = true;
    };
    $scope.RULE = {
      by_id: function(id) {
        var j, len, ref, rule;
        ref = Model.rules;
        for (j = 0, len = ref.length; j < len; j++) {
          rule = ref[j];
          if (rule.id === id) {
            return rule;
          }
        }
      },
      add: function() {
        var rule;
        rule = angular.copy($scope.templates.rule);
        rule.id = $scope.next_id(Model.rules);
        rule.name = $scope.RULE.name(rule);
        rule.priority = $scope.next_priority(Model.rules);
        $scope.RULE.describe_action(rule);
        Model.rules.push(rule);
        if ($scope.edit_ports) {
          $scope.view.rules[rule.id].inputs_text = '';
          $scope.view.rules[rule.id].outputs_text = '';
        }
        $scope.RULE.sort_by_priority();
        $scope.RULE.select(rule);
        return $scope.new_rule.set(rule, 'add');
      },
      previous: function(rule) {
        return Model.rules.filter(function(x) {
          return x.priority > rule.priority;
        })[0];
      },
      name: function(rule) {
        return translate('page.routing.rule.name', {
          id: rule.id
        });
      },
      remove: function(rule) {
        return $scope.safeApply(function() {
          if ($scope.new_rule.is(rule)) {
            $scope.new_rule.reset();
          }
          $scope.view.rules[rule.id].is_being_removed = true;
          Model.rules.remove(rule);
          delete $scope.view.rules[rule.id];
          if (!$scope.RULE.selected() && Model.rules[0]) {
            return $scope.RULE.select(Model.rules[0]);
          } else {
            return $scope.RULE.deselect_all();
          }
        });
      },
      remove_all: function() {
        return $scope.safeApply(function() {
          $scope.new_rule.reset();
          $scope.RULE.deselect_all();
          Model.rules = [];
          return $scope.view.rules = {};
        });
      },
      add_or_remove_hashing_profile: function(rule) {
        if ((rule.action === 'balance' || rule.action === 'dubbing') && rule.outputs.length > 1) {
          if (rule.hashing_profile == null) {
            return rule.hashing_profile = 0;
          }
        } else {
          return delete rule.hashing_profile;
        }
      },
      has_disabled: function() {
        var count, j, len, ref, rule;
        count = 0;
        if (Model.rules) {
          ref = Model.rules;
          for (j = 0, len = ref.length; j < len; j++) {
            rule = ref[j];
            if (!rule.enabled) {
              count++;
            }
          }
          return !!count;
        } else {
          return false;
        }
      },
      switch_all: function(mode) {
        var j, len, ref, results, rule;
        ref = Model.rules;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          rule = ref[j];
          results.push(rule.enabled = mode);
        }
        return results;
      },
      filter_list_shown: function(rule, extra) {
        return $rootScope.scroll_by(extra.height());
      },
      toggle_available_filters: function(rule) {
        var shown;
        shown = Object.get($scope.view.rules, rule.id, 'show_available_filters');
        return Object.set($scope.view.rules, rule.id, 'show_available_filters', !shown);
      },
      if_show_available_filters: function(rule) {
        return Object.get($scope.view.rules, rule.id, 'show_available_filters');
      },
      initialize: function() {
        var filter, j, k, len, len1, ref, ref1, rule;
        ref = Model.rules;
        for (j = 0, len = ref.length; j < len; j++) {
          rule = ref[j];
          $scope.RULE.describe_action(rule);
          ref1 = rule.filters;
          for (k = 0, len1 = ref1.length; k < len1; k++) {
            filter = ref1[k];
            filter.$$show_mask = (function() {
              switch (filter.type) {
                case 'Level4_data':
                  return true;
                default:
                  if (!$scope.FILTER.is_default_mask(filter)) {
                    return true;
                  }
              }
            })();
            filter.$$interval = filter.to_value != null;
          }
        }
        $scope.refresh_device_port_statuses();
        $scope.RULE.sort_by_priority();
        if (Model.rules[0]) {
          $scope.RULE.select(Model.rules[0]);
        }
        $scope.on_key(function(key) {
          if (key.is('Ctrl', 'Up')) {
            rule = $scope.RULE.selected();
            if (rule) {
              $scope.safeApply(function() {
                return $scope.RULE.change_priority(rule, +1);
              });
            }
            return;
          }
          if (key.is('Ctrl', 'Down')) {
            rule = $scope.RULE.selected();
            if (rule) {
              $scope.safeApply(function() {
                return $scope.RULE.change_priority(rule, -1);
              });
            }
            return;
          }
          if (key.is('Ctrl', 'E')) {
            $scope.safeApply(function() {
              return $scope.toggle_edit_ports();
            });
          }
        });
        return dummy_promise();
      },
      rename: function(rule, on_off) {
        if (on_off == null) {
          on_off = true;
        }
        if (on_off) {
          if (!rule.enabled) {
            return;
          }
        }
        return Object.set($scope.view.rules, rule.id, 'rename', on_off);
      },
      can_have_same_inputs_and_outputs: function(rule) {
        switch (rule.action) {
          case 'mirror':
            return true;
          default:
            return false;
        }
      },
      add_input: function(rule) {
        return $scope.safeApply(function() {
          var j, len, port, ref;
          ref = Model.ports.filter(function(port) {
            return Port_view.is_selected(port);
          });
          for (j = 0, len = ref.length; j < len; j++) {
            port = ref[j];
            if (rule.inputs.has(port)) {
              continue;
            }
            rule.inputs.push(port);
            $scope.sort_by_id(rule.inputs);
            Object.set($rootScope.view.ports, port.id, 'selectedIn', true);
            $scope.refresh_device_port_statuses();
          }
          Port_view.deselect_all();
          $scope.RULE.changed(rule);
          if ($scope.new_rule.is(rule)) {
            $scope.new_rule.reset();
          }
          if ($scope.edit_ports) {
            return $scope.RULE.refresh_input_text(rule);
          }
        });
      },
      add_output: function(rule) {
        return $scope.safeApply(function() {
          var j, len, port, ref;
          ref = Model.ports.filter(function(port) {
            return Port_view.is_selected(port);
          });
          for (j = 0, len = ref.length; j < len; j++) {
            port = ref[j];
            if (rule.outputs.has(port)) {
              continue;
            }
            rule.outputs.push(port);
            $scope.sort_by_id(rule.outputs);
            Port_view.deselect(port);
            Object.set($rootScope.view.ports, port.id, 'selectedOut', true);
            $scope.refresh_device_port_statuses();
          }
          if (rule.action === 'redirect' && rule.outputs.length > 1) {
            rule.action = 'balance';
          }
          Port_view.deselect_all();
          $scope.RULE.add_or_remove_hashing_profile(rule);
          $scope.RULE.changed(rule);
          if ($scope.new_rule.is(rule)) {
            $scope.new_rule.reset();
          }
          if ($scope.edit_ports) {
            return $scope.RULE.refresh_output_text(rule);
          }
        });
      },
      refresh_input_text: function(rule) {
        var input;
        return $scope.view.rules[rule.id].inputs_text = ((function() {
          var j, len, ref, results;
          ref = rule.inputs;
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            input = ref[j];
            results.push(Port_numeration.name_by_id(input.id));
          }
          return results;
        })()).join(' ');
      },
      refresh_output_text: function(rule) {
        var output;
        return $scope.view.rules[rule.id].outputs_text = ((function() {
          var j, len, ref, results;
          ref = rule.outputs;
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            output = ref[j];
            results.push(Port_numeration.name_by_id(output.id));
          }
          return results;
        })()).join(' ');
      },
      changed: function(rule) {
        return Object.set($scope.view.rules, rule.id, 'error', false);
      },
      inputs_text_changed: function(rule) {
        return Object.set($scope.view.rules, rule.id, 'error.invalid_inputs_text', false);
      },
      outputs_text_changed: function(rule) {
        return Object.set($scope.view.rules, rule.id, 'error.invalid_outputs_text', false);
      },
      rules_changed: function() {
        var callback, j, len, ref, rule;
        if ($scope.applying_rules) {
          return;
        }
        if ($rootScope.applying_configuration) {
          return;
        }
        ref = Model.rules;
        for (j = 0, len = ref.length; j < len; j++) {
          rule = ref[j];
          $scope.RULE.describe_action(rule);
        }
        $scope.interactive_validation();
        if ($scope.load_rules_timer) {
          $timeout.cancel($scope.load_rules_timer);
        }
        callback = function() {
          return Device.load_rules().then(function(rules) {
            var gui_rules;
            gui_rules = Device_routing.convert_to_device_rules(Model.rules);
            return $scope.any_changes = !angular.equals(gui_rules, rules);
          });
        };
        return $scope.load_rules_timer = $timeout(callback, 1000);
      },
      hashing_profile_changed: function(rule) {
        return $scope.RULE.describe_action(rule);
      },
      validate: function(rule) {
        var destination_port_filter, j, len, port, ref, source_port_filter;
        if ($scope.form.$invalid) {
          return 'form_errors';
        }
        if ($scope.view.rules[rule.id].edit_ports) {
          return 'exit_port_editing_mode';
        }
        if (rule.inputs.is_empty()) {
          return 'input_required';
        }
        switch (rule.action) {
          case 'drop':
            break;
          default:
            if (rule.outputs.is_empty()) {
              return 'output_required';
            }
        }
        switch (rule.action) {
          case 'redirect':
            if (rule.outputs.length > 1) {
              return 'multiple_outputs_for_redirect';
            }
        }
        source_port_filter = rule.filters.filter(function(x) {
          return x.type === 'IP_protocol_source';
        })[0];
        destination_port_filter = rule.filters.filter(function(x) {
          return x.type === 'IP_protocol_destination';
        })[0];
        if (source_port_filter || destination_port_filter) {
          if (rule.filters.filter(function(x) {
            return x.type === 'IP_protocol';
          }).is_empty()) {
            return 'ip_protocol_required_for_port_filtering';
          }
        }
        ref = rule.inputs.concat(rule.outputs);
        for (j = 0, len = ref.length; j < len; j++) {
          port = ref[j];
          port = Port_numeration.categorize_port(port.id);
          if (port.type === 'joinable') {
            if (port.joint_port.mode === '40G') {
              if (!port.is_first_in_joint) {
                return 'joint_port_is_40G_but_subports_are_used_in_rules';
              }
            }
          }
        }
      },
      duplicate: function(rule) {
        var a_rule, copy, j, len, previous_rule, ref;
        copy = angular.copy(rule);
        copy.inputs = [].concat(rule.inputs);
        copy.outputs = [].concat(rule.outputs);
        copy.id = $scope.next_id(Model.rules);
        copy.name = $scope.RULE.name(copy);
        previous_rule = $scope.RULE.previous(rule);
        if (previous_rule) {
          ref = Model.rules;
          for (j = 0, len = ref.length; j < len; j++) {
            a_rule = ref[j];
            if (a_rule.priority > rule.priority) {
              a_rule.priority++;
            }
          }
          copy.priority = rule.priority;
          rule.priority++;
        } else {
          copy.priority = rule.priority;
          rule.priority = $scope.next_priority(Model.rules);
        }
        $scope.RULE.describe_action(copy);
        Model.rules.push(copy);
        $scope.RULE.sort_by_priority();
        return $timeout((function() {
          $scope.RULE.select(copy);
          return $scope.new_rule.set(copy, 'duplicate');
        }), 0);
      },
      port_clicked: function(rule, port, $event) {
        if (!$scope.view.rules[rule.id].selected) {
          return;
        }
        Port_view.select(port, true);
        return $scope.block_event($event);
      },
      on_off_clicked: function(rule, $event) {
        return $event.stopPropagation();
      },
      selected: function() {
        var ref, rule, rule_id;
        ref = $scope.view.rules;
        for (rule_id in ref) {
          rule = ref[rule_id];
          if (rule.selected) {
            return $scope.RULE.by_id(parseInt(rule_id));
          }
        }
      },
      select: function(rule, $event) {
        var j, k, len, len1, port, ref, ref1, results;
        if ($scope.RULE.selected() === rule) {
          return;
        }
        if ($event) {
          if (jQuery($event.target).hasClass('rule_on_off_switch')) {
            return;
          }
        }
        if ($scope.edit_ports) {
          $scope.RULE.refresh_input_text(rule);
          $scope.RULE.refresh_output_text(rule);
        }
        $scope.RULE.deselect_all();
        Object.set($scope.view.rules, rule.id, 'selected', true);
        if (rule !== Graph.rule) {
          Graph.show = false;
        }
        ref = rule.inputs;
        for (j = 0, len = ref.length; j < len; j++) {
          port = ref[j];
          Object.set($rootScope.view.ports, port.id, 'selectedIn', true);
        }
        ref1 = rule.outputs;
        results = [];
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          port = ref1[k];
          results.push(Object.set($rootScope.view.ports, port.id, 'selectedOut', true));
        }
        return results;
      },
      deselect_all: function() {
        var j, k, len, len1, port, ref, ref1, results, rule;
        ref = Model.rules;
        for (j = 0, len = ref.length; j < len; j++) {
          rule = ref[j];
          Object.set($scope.view.rules, rule.id, 'selected', false);
        }
        ref1 = Model.ports;
        results = [];
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          port = ref1[k];
          Object.set($rootScope.view.ports, port.id, 'selectedIn', false);
          results.push(Object.set($rootScope.view.ports, port.id, 'selectedOut', false));
        }
        return results;
      },
      sort_by_priority: function() {
        return Model.rules.sort(function(a, b) {
          return b.priority - a.priority;
        });
      },
      change_priority: function(rule, change) {
        $scope.RULE.sort_by_priority();
        Model.rules.forEach(function(i, index) {
          var priority, replaced;
          if (i !== rule) {
            return;
          }
          index -= change;
          if (index < 0 || index >= Model.rules.length) {
            return;
          }
          replaced = Model.rules[index];
          priority = rule.priority;
          rule.priority = replaced.priority;
          return replaced.priority = priority;
        });
        return $scope.RULE.sort_by_priority();
      },
      describe_action: function(rule) {
        var describe_filter, describe_filters, description;
        describe_filter = function(filter) {
          var description, get_filter_to_value_label, get_filter_value_label;
          get_filter_value_label = function() {
            var key, ref, value;
            if (filter.value == null) {
              return '?';
            }
            if (!Enums.ACL_Filter[filter.type].value.from) {
              return filter.value;
            }
            ref = Enums.ACL_Filter[filter.type].value.from;
            for (key in ref) {
              value = ref[key];
              if (value === filter.value) {
                return key;
              }
            }
          };
          get_filter_to_value_label = function() {
            if (filter.to_value == null) {
              return;
            }
            if (Enums.ACL_Filter[filter.type].value.from) {
              throw new Error("Unsupported filter type " + filter.type + " for to value selection");
            }
            return filter.to_value;
          };
          return description = {
            type: filter.type,
            value: get_filter_value_label(),
            to_value: get_filter_to_value_label(),
            mask: (function() {
              switch (filter.type) {
                case 'Level4_data':
                  break;
                default:
                  return filter.mask;
              }
            })()
          };
        };
        describe_filters = function(rule) {
          var filter, j, len, ref, results;
          ref = rule.filters;
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            filter = ref[j];
            results.push(describe_filter(filter));
          }
          return results;
        };
        description = {};
        description.action_info = (function() {
          switch (rule.action) {
            case 'balance':
            case 'dubbing':
              if (rule.outputs.is_empty()) {
                return '';
              } else if (rule.outputs.length === 1) {
                return translate('page.routing.rule.action.aggregation');
              } else {
                return Device_routing.LBG.Hash_profile.by_id(rule.hashing_profile).title;
              }
          }
        })();
        description.filters = (function() {
          switch (rule.action) {
            case 'balance':
            case 'redirect':
            case 'mirror':
            case 'drop':
            case 'dubbing':
              return describe_filters(rule);
          }
        })();
        return Object.set($scope.view.rules, rule.id, 'action.description', description);
      },
      filter_type_changed: function(filter) {
        filter.value = null;
        return filter.mask = $scope.FILTER.identity_mask(filter.type);
      },
      has_filter: function(rule, type) {
        var filter, j, len, ref;
        ref = rule.filters;
        for (j = 0, len = ref.length; j < len; j++) {
          filter = ref[j];
          if (filter.type === type) {
            return true;
          }
        }
      },
      add_filter: function(rule, type) {
        var filter, ip_protocol_filter, is_tcp_udp;
        filter = {
          type: type
        };
        switch (type) {
          case 'IP_protocol_source':
          case 'IP_protocol_destination':
            if (!$scope.RULE.has_filter(rule, 'IP_protocol')) {
              $scope.RULE.add_filter(rule, 'IP_protocol');
              return (function() {
                return $scope.safeApply(function() {
                  return $scope.RULE.add_filter(rule, type);
                });
              }).delay(0);
            } else {
              ip_protocol_filter = $scope.RULE.get_filter(rule, 'IP_protocol');
              is_tcp_udp = $scope.port_ip_protocols.filter(function(x) {
                return x.key === ip_protocol_filter.value;
              }).not_empty();
              if (!is_tcp_udp) {
                ip_protocol_filter.value = $scope.port_ip_protocols[0].key;
              }
            }
            break;
          case 'ethernet_protocol':
            filter.value = Enums.ACL_Filter.ethernet_protocol.value["default"];
            break;
          case 'IP_protocol':
            filter.value = Enums.ACL_Filter.IP_protocol.value["default"];
            break;
          case 'Level4_data':
            filter.$$show_mask = true;
            break;
          case 'multi_IP_address':
            $scope.RULE.remove_filter(rule, 'source_IP_address');
            $scope.RULE.remove_filter(rule, 'destination_IP_address');
        }
        filter.mask = Device_routing.Filter.default_mask(type);
        rule.filters.push(filter);
        Device_routing.Filter.sort(rule.filters);
        rule.filters.forEach(function(a_filter, index) {
          if (a_filter === filter) {
            return (function() {
              return $scope.safeApply(function() {
                return $rootScope.scroll_to = jQuery('.rule_filter_list_item[data-index=' + index + ']')[0];
              });
            }).delay(0);
          }
        });
        return $scope.RULE.changed(rule);
      },
      get_filter: function(rule, filter_type) {
        return rule.filters.filter(function(filter) {
          return filter.type === filter_type;
        })[0];
      },
      remove_filter: function(rule, filter) {
        if (angular.isString(filter)) {
          filter = $scope.RULE.get_filter(rule, filter);
          if (!filter) {
            return;
          }
        }
        switch (filter.type) {
          case 'IP_protocol_source':
          case 'IP_protocol_destination':
            rule.filters.remove($scope.RULE.get_filter(rule, 'IP_protocol'));
        }
        rule.filters.remove(filter);
        return $scope.RULE.changed(rule);
      },
      action_changed: function(rule) {
        $scope.RULE.add_or_remove_hashing_profile(rule);
        $scope.RULE.hashing_profile_changed(rule);
        switch (rule.action) {
          case 'redirect':
            if (rule.outputs.length > 1) {
              Status.info(translate('page.routing.rule.error.redirecting_to_several_ports_is_balancing'));
              rule.action = 'balance';
              return $scope.RULE.action_changed(rule);
            }
            break;
          case 'drop':
            rule.outputs = [];
            if (Object.get($scope.view.rules, rule.id, 'selected')) {
              $scope.RULE.deselect_all();
              return $scope.RULE.select(rule);
            }
        }
      },
      implies_deep_inspection: function(rule) {
        var filter, j, len, ref;
        ref = rule.filters;
        for (j = 0, len = ref.length; j < len; j++) {
          filter = ref[j];
          if (filter.type === 'Level4_data') {
            return true;
          }
        }
      }
    };
    $scope.FILTER = {
      identity_mask: function(filter_type) {
        return Device_routing.Filter.identity_mask(Enums.ACL_Filter[filter_type]);
      },
      is_default_mask: function(filter) {
        return Device_routing.Filter.is_default_mask(filter);
      },
      correct_from_to_values: function(filter) {
        var temporary;
        if ((filter.to_value == null) || (filter.value == null)) {
          return;
        }
        if (filter.to_value === '') {
          delete filter.to_value;
        }
        if (filter.to_value < filter.value) {
          temporary = filter.to_value;
          filter.to_value = filter.value;
          filter.value = temporary;
        } else if (filter.to_value === filter.value) {
          delete filter.to_value;
        }
        if (filter.to_value == null) {
          return filter.$$interval = false;
        }
      },
      is_used_in_rule: function(rule, filter) {
        return function(filter_type) {
          return ((function() {
            var j, len, ref, results;
            ref = rule.filters;
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
              filter = ref[j];
              if (filter.type === filter_type.key) {
                results.push(filter);
              }
            }
            return results;
          })()).not_empty();
        };
      }
    };
    $scope.validate = function() {
      var error, errors, j, len, ref, rule;
      errors = false;
      ref = Model.rules;
      for (j = 0, len = ref.length; j < len; j++) {
        rule = ref[j];
        if (!rule.enabled) {
          Object.set($scope.view.rules, rule.id, 'error', false);
          continue;
        }
        Object.set($scope.view.rules, rule.id, 'error', false);
        error = $scope.RULE.validate(rule);
        if (error != null) {
          Object.set($scope.view.rules, rule.id, 'error.' + error, true);
          if (!errors) {
            Object.set($scope.view.rules, rule.id, 'scroll_to', new Date().getTime());
            errors = true;
          }
        }
      }
      return errors;
    };
    $scope.interactive_validation = function() {};
    $scope.show_rule_filter = function(rule, filter) {
      switch (filter.type || filter.key) {
        case 'IP_protocol':
          return rule.filters.filter(function(x) {
            return x.type === 'IP_protocol_source' || x.type === 'IP_protocol_destination';
          }).is_empty();
        case 'source_IP_address':
        case 'destination_IP_address':
          return rule.filters.filter(function(x) {
            return x.type === 'multi_IP_address';
          }).is_empty();
      }
      return true;
    };
    $scope.submit = function() {
      var errors, j, len, ref, rule;
      if (!$scope.exit_ports_editing_mode()) {
        return Status.error(translate('page.routing.status.errors_in_rules'));
      }
      $scope.form.submitted = true;
      Status.busy(translate('page.routing.status.applying_rules'));
      ref = Model.rules;
      for (j = 0, len = ref.length; j < len; j++) {
        rule = ref[j];
        rule.filters = rule.filters.filter(function(filter) {
          return filter.type;
        });
      }
      errors = $scope.validate();
      if (errors) {
        return Status.error(translate('page.routing.status.errors_in_rules'));
      }
      $scope.busy = true;
      return Promises.promise(function() {
        return Configuration.Routing.save().then(function() {
          return $scope.apply_rules();
        }).then(function() {
          $scope.any_changes = false;
          return Status.idle(translate('page.routing.status.rules_saved'));
        })["catch"](Promises.not_navigating_away, function(error) {
          if (api.is_api_error(error)) {
            return;
          }
          if (Routing_model_errors.is(error)) {
            return Status.error(Routing_model_errors.message(error));
          }
          return Status.error(error);
        })["finally"](function() {
          return $scope.busy = false;
        }).$apply($scope);
      });
    };
    $scope.apply_rules = function() {
      var _finally;
      $scope.applying_rules = true;
      _finally = function() {
        $scope.safeApply(function() {
          return $scope.applying_rules = false;
        });
        return $scope.RULE.rules_changed();
      };
      return Device.refresh_ports().then(function() {
        return Device.set_up_routing(Model.rules, Model.ports, Model.joint_ports);
      }).then(function() {
        return _finally();
      })["catch"](Promises.not_navigating_away, function(error) {
        _finally();
        throw error;
      });
    };
    $scope.exit_ports_editing_mode = function() {
      if ($scope.edit_ports) {
        return $scope.toggle_edit_ports();
      }
      return true;
    };
    $scope.toggle_edit_ports = function() {
      var err, error, error1, error2, input, inputs, j, k, l, len, len1, len2, len3, len4, len5, m, n, o, output, outputs, port, ref, ref1, ref2, ref3, rule;
      if (rule = $scope.RULE.selected()) {
        if (!$scope.edit_ports) {
          $scope.RULE.refresh_input_text(rule);
          $scope.RULE.refresh_output_text(rule);
        } else {
          error = function() {
            Object.set($scope.view.rules, rule.id, 'error.' + error, true);
            if (!errors) {
              return Object.set($scope.view.rules, rule.id, 'scroll_to', new Date().getTime());
            }
          };
          if ($scope.view.rules[rule.id].inputs_text.trim().not_empty()) {
            inputs = $scope.view.rules[rule.id].inputs_text.split(/[\s,\n]+/);
            try {
              inputs = (function() {
                var j, len, results;
                results = [];
                for (j = 0, len = inputs.length; j < len; j++) {
                  input = inputs[j];
                  results.push(Port_numeration.by_name(input));
                }
                return results;
              })();
              ref = Model.ports;
              for (j = 0, len = ref.length; j < len; j++) {
                port = ref[j];
                Object.set($rootScope.view.ports, port.id, 'selectedIn', false);
              }
              for (k = 0, len1 = inputs.length; k < len1; k++) {
                input = inputs[k];
                Object.set($rootScope.view.ports, input.id, 'selectedIn', true);
              }
              rule.inputs = inputs;
              $scope.sort_by_id(rule.inputs);
            } catch (error1) {
              err = error1;
              Object.set($scope.view.rules, rule.id, 'error.invalid_inputs_text', true);
              Object.set($scope.view.rules, rule.id, 'scroll_to', new Date().getTime());
              return false;
            }
          } else {
            ref1 = Model.ports;
            for (l = 0, len2 = ref1.length; l < len2; l++) {
              port = ref1[l];
              Object.set($rootScope.view.ports, port.id, 'selectedIn', false);
            }
            rule.inputs = [];
          }
          if ($scope.view.rules[rule.id].outputs_text.trim().not_empty()) {
            outputs = $scope.view.rules[rule.id].outputs_text.split(/[\s,\n]+/);
            try {
              outputs = (function() {
                var len3, m, results;
                results = [];
                for (m = 0, len3 = outputs.length; m < len3; m++) {
                  output = outputs[m];
                  results.push(Port_numeration.by_name(output));
                }
                return results;
              })();
              ref2 = Model.ports;
              for (m = 0, len3 = ref2.length; m < len3; m++) {
                port = ref2[m];
                Object.set($rootScope.view.ports, port.id, 'selectedOut', false);
              }
              for (n = 0, len4 = outputs.length; n < len4; n++) {
                output = outputs[n];
                Object.set($rootScope.view.ports, output.id, 'selectedOut', true);
              }
              rule.outputs = outputs;
              $scope.sort_by_id(rule.inputs);
            } catch (error2) {
              err = error2;
              Object.set($scope.view.rules, rule.id, 'error.invalid_outputs_text', true);
              Object.set($scope.view.rules, rule.id, 'scroll_to', new Date().getTime());
              return false;
            }
          } else {
            ref3 = Model.ports;
            for (o = 0, len5 = ref3.length; o < len5; o++) {
              port = ref3[o];
              Object.set($rootScope.view.ports, port.id, 'selectedOut', false);
            }
            rule.outputs = [];
          }
        }
      }
      $scope.edit_ports = !$scope.edit_ports;
      return true;
    };
    $scope.refresh_device_port_statuses = function() {
      var j, k, len, len1, port, ref, ref1, results, rule;
      ref = Model.rules;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        rule = ref[j];
        ref1 = rule.inputs;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          port = ref1[k];
          Object.set($rootScope.view.ports, port.id, 'in', true);
        }
        results.push((function() {
          var l, len2, ref2, results1;
          ref2 = rule.outputs;
          results1 = [];
          for (l = 0, len2 = ref2.length; l < len2; l++) {
            port = ref2[l];
            results1.push(Object.set($rootScope.view.ports, port.id, 'out', true));
          }
          return results1;
        })());
      }
      return results;
    };
    $scope.max_digits_for_bit_count = function(bit_count) {
      var max_number;
      max_number = Math.pow(2, bit_count + 1) - 1;
      return String(max_number).length;
    };
    $scope.$on('port_removed', function(event, options) {
      return $scope.RULE.add_or_remove_hashing_profile(options.rule);
    });
    return $scope.initialize_page_with(function() {
      var key, ref, ref1, ref2, ref3, value;
      $scope.Graph = Graph;
      Graph.show = false;
      Graph.enable = true;
      $scope.validation_errors = {};
      $scope.any_changes = false;
      $scope.view = angular.extend({
        rules: {}
      }, $scope.view);
      $scope.templates = {
        rule: {
          enabled: true,
          inputs: [],
          outputs: [],
          filters: [],
          action: 'balance',
          hashing_profile: 0
        }
      };
      $scope.filter_types = [];
      ref = Enums.ACL_Filter;
      for (key in ref) {
        value = ref[key];
        $scope.filter_types.push({
          key: key,
          label: translate("ACL.rule.filter.type." + key)
        });
      }
      $scope.ethernet_protocols = [];
      ref1 = Enums.ACL_Filter.ethernet_protocol.value.from;
      for (key in ref1) {
        value = ref1[key];
        $scope.ethernet_protocols.push({
          key: value,
          label: key
        });
      }
      $scope.ethernet_protocols = $scope.ethernet_protocols.filter(function(x) {
        return !['TCP', 'UDP'].has(x.key);
      });
      $scope.ethernet_protocols.sort(function(a, b) {
        if (a.label > b.label) {
          return 1;
        }
        if (a.label < b.label) {
          return -1;
        }
        return 0;
      });
      $scope.ethernet_protocols.unshift({
        key: '',
        label: '———————————'
      });
      $scope.ethernet_protocols.unshift({
        key: Enums.ACL_Filter.ethernet_protocol.value.from.IP,
        label: 'IP'
      });
      $scope.ip_protocols = [];
      ref2 = Enums.ACL_Filter.IP_protocol.value.from;
      for (key in ref2) {
        value = ref2[key];
        $scope.ip_protocols.push({
          key: Enums.ACL_Filter.IP_protocol.value.from[key],
          label: key
        });
      }
      $scope.ip_protocols = $scope.ip_protocols.filter(function(x) {
        return !['IPv4'].has(x.key);
      });
      $scope.ip_protocols.sort(function(a, b) {
        if (a.label > b.label) {
          return 1;
        }
        if (a.label < b.label) {
          return -1;
        }
        return 0;
      });
      $scope.ip_protocols.unshift({
        key: '',
        label: '——————————'
      });
      $scope.ip_protocols.unshift({
        key: Enums.ACL_Filter.IP_protocol.value.from.UDP,
        label: 'UDP'
      });
      $scope.ip_protocols.unshift({
        key: Enums.ACL_Filter.IP_protocol.value.from.TCP,
        label: 'TCP'
      });
      $scope.port_ip_protocols = [
        {
          key: Enums.ACL_Filter.IP_protocol.value.from.TCP,
          label: 'TCP'
        }, {
          key: Enums.ACL_Filter.IP_protocol.value.from.UDP,
          label: 'UDP'
        }
      ];
      $scope.rule_actions = ['balance', 'redirect', 'mirror', 'drop'];
      $scope.rule_action_titles = {};
      ref3 = Enums.ACL_actions;
      for (key in ref3) {
        value = ref3[key];
        $scope.rule_action_titles[key] = translate('ACL.rule.action.' + key);
      }
      $scope.unselect_all();
      Status.busy(translate('page.routing.status.reading_rules_from_device'));
      return Promises.promise(function() {
        return Device_routing.LBG.Hash_profile.fetch().then(function(hashing_profile) {
          return $scope.templates.rule.hashing_profile = hashing_profile.id;
        }).then(function() {
          return Configuration.read_local_routing_configuration();
        }).then(function() {
          $scope.RULE.initialize();
          return $scope.watch_rules();
        }).then(function() {
          return Status.idle();
        })["catch"](Promises.not_navigating_away, function(error) {
          $scope.watch_rules();
          if (api.is_api_error(error)) {
            return;
          }
          if (Routing_model_errors.is(error)) {
            return Status.error(Routing_model_errors.message(error));
          }
          return Status.error(error);
        })["finally"](function() {
          $scope.$on('configuration_loaded', function(rules) {
            return $scope.RULE.rules_changed();
          });
          return $scope.ready = true;
        }).$apply($scope);
      });
    });
  }]);

}).call(this);

(function() {
  'use strict';
  app.controller("SettingsCtrl", ["$scope", "$upload", "api", "Status", "Configuration", "Device", "GUI", "Model", "translate", "Promises", function($scope, $upload, api, Status, Configuration, Device, GUI, Model, translate, Promises) {
    $scope.validate = function() {
      return !$scope.settings_form.$invalid;
    };
    $scope.save = function(callback) {
      if (!$scope.validate()) {
        return Status.error(translate('page.settings.error.form_errors'));
      }
      $scope.busy = true;
      return Promises.promise(function() {
        return Configuration.Network.save().then(function() {
          $scope.rebooting = true;
          return Device.restart();
        })["finally"](function() {
          return $scope.busy = false;
        }).$apply($scope);
      });
    };
    $scope.change_password = function() {
      $scope.busy = true;
      return Promises.promise(function() {
        return api.call('auth.password_matches', {
          password: $scope.current_password
        }).then(function(matches) {
          if (!matches) {
            throw new Error(translate('error.wrong_password'));
          }
          return Configuration.Users.change_password($scope.new_password);
        }).then(function(result) {
          if (result !== false) {
            return Status.info(translate('page.settings.password_changed'));
          }
        })["finally"](function() {
          return $scope.busy = false;
        }).$apply($scope);
      });
    };
    $scope.on_upload_firmware = function($files) {
      var file, upload;
      $scope.safeApply(function() {
        $scope.uploading_firmware = true;
        return Status.busy(translate('page.settings.status.uploading_firmware'));
      });
      file = $files[0];
      upload = null;
      return Promises.promise(function() {
        return new Promise(function(resolve, reject) {
          return upload = $upload.upload({
            url: '/update_firmware',
            data: {
              parameter: $scope.parameter
            },
            file: file
          }).progress(function(event) {
            if (event.loaded === event.total) {
              return Status.busy(translate('page.settings.status.validating_firmware'));
            }
          }).success(function(data, status, headers, config) {
            if (data.error) {
              throw new Error(data.error.message || data.error.code);
            }
            if (data.result !== 0) {
              throw new Error("Operation result: " + data.result);
            }
            return resolve(GUI.wait_for_connection(0, translate('page.settings.status.updating_firmware'), {
              to: 'device',
              infinite: true,
              delay: 8
            }));
          })["catch"](function(error) {
            console.error(error.stack || error);
            Status.error(translate('page.settings.status.firmware_update_failed'));
            return reject(error);
          });
        }).cancellable()["catch"](Promises.is_navigating_away, function(error) {
          upload.abort();
          throw error;
        })["finally"](function() {
          return $scope.uploading_firmware = false;
        }).$apply($scope);
      });
    };
    $scope.on_upload_licence = function($files) {
      var file, upload;
      $scope.safeApply(function() {
        $scope.uploading_licence = true;
        return Status.busy(translate('page.settings.status.uploading_license'));
      });
      file = $files[0];
      upload = null;
      return Promises.promise(function() {
        return new Promise(function(resolve, reject) {
          return upload = $upload.upload({
            url: '/upload_licence',
            data: {
              parameter: $scope.parameter
            },
            file: file
          }).progress(function(event) {
            if (event.loaded === event.total) {
              return Status.busy(translate('page.settings.status.validating_license'));
            }
          }).success(function(data, status, headers, config) {
            if (data.error) {
              throw new Error(data.error.message || data.error.code);
            }
            if (data.result !== 0) {
              throw new Error("Operation result: " + data.result);
            }
            return resolve(Configuration.Device.reset());
          })["catch"](function(error) {
            console.error(error.stack || error);
            Status.error(translate('page.settings.status.firmware_update_failed'));
            return reject(error);
          });
        }).cancellable()["catch"](Promises.is_navigating_away, function(error) {
          upload.abort();
          throw error;
        })["finally"](function() {
          return $scope.uploading_licence = false;
        }).$apply($scope);
      });
    };
    $scope.reset_configuration = function() {
      return Promises.promise(function() {
        return Configuration.reset();
      });
    };
    return $scope.initialize_page_with(function() {
      return Promises.promise(function() {
        return Configuration.Network.load_into_model().then(function() {
          $scope.$watch('model.network.dhcp', function(value) {
            if (value) {
              Model.network.ip = $scope.initial_network_settings.ip;
              Model.network.gateway = $scope.initial_network_settings.gateway;
              return Model.network.mask = $scope.initial_network_settings.mask;
            }
          });
          return $scope.initial_network_settings = angular.copy(Model.network);
        }).$apply($scope);
      });
    });
  }]);

}).call(this);

(function() {
  app.factory('api', ["$rootScope", "$http", "$location", "$timeout", "$q", "Status", "log", "Promises", "Enums", function($rootScope, $http, $location, $timeout, $q, Status, log, Promises, Enums) {
    var Batch, api, id, sort_by_id;
    id = 1;
    sort_by_id = function(a, b) {
      return a.id - b.id;
    };
    Batch = (function() {
      function Batch(options1) {
        this.options = options1;
        this.batch = [];
        this.promises = [];
        if (this.options == null) {
          this.options = {};
        }
      }

      Batch.prototype.call = function(method, parameters, options) {
        this.batch.push(api.request_json(method, parameters));
        return new Promise((function(_this) {
          return function(resolve, reject) {
            return _this.promises.push({
              resolve: resolve,
              reject: reject
            });
          };
        })(this)).cancellable();
      };

      Batch.prototype.end = function() {
        if (this.batch.is_empty()) {
          return Promise.resolve(true).cancellable();
        }
        log.info('┌─', '[…]');
        return this.post();
      };

      Batch.prototype.post = function() {
        return api.post_request(this.batch).cancellable().then((function(_this) {
          return function(batch_response) {
            var batch_error, error, error1, i, len, promise, request, response;
            if (!(batch_response instanceof Array)) {
              batch_response = [batch_response];
            }
            batch_response.sort(sort_by_id);
            batch_error = null;
            for (i = 0, len = batch_response.length; i < len; i++) {
              response = batch_response[i];
              request = _this.batch.shift();
              promise = _this.promises.shift();
              try {
                Batch.printer.request(request, _this.batch.is_empty());
                Batch.printer.response(response, _this.batch.is_empty());
                api.analyze_response(response);
                promise.resolve(response.result);
              } catch (error1) {
                error = error1;
                promise.reject(error);
                api.log_error(request, response);
                api.on_error(request, response);
                if (!batch_error) {
                  batch_error = error;
                }
              }
            }
            if (batch_error) {
              throw batch_error;
            }
            return batch_response;
          };
        })(this), (function(_this) {
          return function(error) {
            var i, len, promise, ref;
            ref = _this.promises;
            for (i = 0, len = ref.length; i < len; i++) {
              promise = ref[i];
              promise.reject(error);
            }
            if (Promises.is_navigating_away(error)) {
              throw error;
            }
          };
        })(this));
      };

      return Batch;

    })();
    Batch.printer = {
      request: function(request, last) {
        var preamble;
        preamble = (last ? '└' : '├') + '─';
        return log.info(preamble, request.method, request.params);
      },
      response: function(response, last) {
        var preamble;
        preamble = (last ? ' ' : '│') + '   ';
        if (response.error) {
          return log.info(preamble, '✕', response.error);
        } else {
          return log.info(preamble, '✓', response.result);
        }
      }
    };
    api = {
      error: {
        generic: custom_error('Api_error'),
        not_authenticated: custom_error('Not_authenticated'),
        device_is_booting_up: custom_error('Device is booting up')
      },
      is_api_error: function(error) {
        var key, ref, value;
        ref = api.error;
        for (key in ref) {
          value = ref[key];
          if (error instanceof value) {
            return true;
          }
        }
      },
      begin: function() {
        return this.json_rpc_batch = new Batch();
      },
      end: function() {
        var json_rpc_batch;
        if (this.json_rpc_batch == null) {
          throw new Error('api.end() called without api.begin()');
        }
        json_rpc_batch = this.json_rpc_batch;
        this.json_rpc_batch = null;
        return json_rpc_batch.end();
      },
      request_json: function(method, params) {
        var request;
        return request = {
          id: id++,
          jsonrpc: "2.0",
          method: method,
          params: params || {}
        };
      },
      call: function(method, params, options) {
        options = options || {};
        if (this.json_rpc_batch) {
          return this.json_rpc_batch.call(method, params, options);
        }
        return this.request(this.request_json(method, params), options);
      },
      log_error: function(request, response) {
        if (response.error.code === 401) {
          return log.info('Not authenticated');
        }
        return log.error('API error in request', request, 'response', response);
      },
      request: function(request, options) {
        if (!options.minor) {
          api.printer.request(request);
        }
        return api.post(request, options);
      },
      post_request: function(request) {
        return new Promise((function(_this) {
          return function(resolve, reject) {
            return $http.post('/api', angular.toJson(request)).then(function(response) {
              return resolve(response.data);
            }, function(response) {
              if (response.status === 434) {
                return reject(new api.error.device_is_booting_up(response.data.error));
              }
              return reject(new Error(response));
            });
          };
        })(this)).cancellable();
      },
      analyze_response: function(response) {
        var error;
        if (!response.error) {
          return response.result;
        }
        error = response.error.code === 401 ? new api.error.not_authenticated(response.error) : new api.error.generic(response.error);
        throw error;
      },
      post: function(request, options) {
        return api.post_request(request).then((function(_this) {
          return function(response) {
            var error, error1;
            if (!options.minor) {
              api.printer.response(response);
            }
            try {
              return api.analyze_response(response);
            } catch (error1) {
              error = error1;
              api.log_error(request, response);
              api.on_error(request, response);
              throw error;
            }
          };
        })(this));
      },
      on_error: function(request, response) {
        var code, message;
        code = response.error.code;
        message = response.error.message;
        if (code === 401) {
          return $rootScope.not_authenticated();
        } else if (code === 403 && request.method === 'auth.login') {

        } else if (code === Enums.Errors.api.set_interface_version) {

        } else {
          return Status.error(request.method + ': ' + message);
        }
      }
    };
    api.printer = {
      request: function(request) {
        return log.info(request.method, Object.not_empty(request.params) ? request.params : '');
      },
      response: function(response) {
        var preamble;
        preamble = ' ';
        if (response.error) {
          return log.info(preamble, '✕', response.error);
        } else {
          return log.info(preamble, '✓', response.result);
        }
      }
    };
    return api;
  }]);

}).call(this);


/*
  Сервис работы с браузером
 */

(function() {
  app.factory('Browser', ["translate", function(translate) {
    var Browser, isValid, names, tests, validationEnabled;
    validationEnabled = true;
    isValid = void 0;
    names = {
      ie: {
        value: 'Internet Explorer'
      },
      chrome: {
        value: 'Google Chrome'
      },
      firefox: {
        value: 'Firefox'
      },
      safari: {
        value: 'Safari'
      },
      opera: {
        value: 'Opera'
      }
    };
    tests = {
      inlineBlock: {
        disabled: true,
        versions: {
          ie: 8,
          chrome: 2,
          firefox: 3,
          safari: 3.1,
          opera: 9.2
        },
        run: function() {
          return Modernizr.testAllProps('display', 'inline-block');
        }
      },
      cssAnimations: {
        disabled: true,
        versions: {
          ie: 10,
          chrome: 4,
          firefox: 5,
          safari: 4,
          opera: 12
        },
        run: function() {
          return Modernizr.cssanimations;
        }
      },
      flexbox: {
        versions: {
          ie: 10,
          chrome: 21,
          firefox: 18,
          safari: 6.1,
          opera: '12.10'
        },
        run: function() {
          return Modernizr.flexbox;
        }
      },
      dragAndDrop: {
        disabled: true,
        versions: {
          ie: 9,
          chrome: 4,
          firefox: 3.5,
          safari: 6,
          opera: 12
        },
        run: function() {
          return Modernizr.draganddrop;
        }
      },
      accessKey: {
        disabled: true,
        versions: {
          ie: 1,
          chrome: 1,
          firefox: 1,
          safari: 1,
          opera: 1
        },
        run: function() {
          var element;
          element = document.createElement('div');
          return element.accessKey !== void 0;
        }
      }
    };
    Browser = {
      getMinimalVersions: function(tests) {
        var browserName, ref, test, testName, version, versions;
        versions = {};
        test = null;
        for (testName in tests) {
          test = tests[testName];
          if (test.disabled) {
            continue;
          }
          ref = test.versions;
          for (browserName in ref) {
            version = ref[browserName];
            if (!names[browserName]) {
              throw new Error(browserName + " is unknown browser");
            }
            !versions[browserName] && (versions[browserName] = 0);
            if (parseFloat(version) > parseFloat(versions[browserName])) {
              versions[browserName] = version;
            }
          }
        }
        return versions;
      },
      versionsToString: function(versions) {
        var name, text, version;
        text = '';
        for (name in versions) {
          version = versions[name];
          text += names[name].value + ": " + version + "+, ";
        }
        return text.substr(0, text.length - 2);
      },
      validate: function() {
        var test, testName;
        if (validationEnabled === false) {
          isValid = true;
          return isValid;
        }
        for (testName in tests) {
          test = tests[testName];
          if (test.disabled === false || test.run() === true) {
            continue;
          }
          isValid = false;
          return isValid;
        }
        isValid = true;
        return isValid;
      },
      getErrorMessage: function() {
        var versions;
        if (isValid === true) {
          return null;
        }
        if (isValid === void 0) {
          throw new Error("Validation wasn't started");
        }
        versions = this.getMinimalVersions(tests);
        return translate('error.old_browser', {
          browsers: this.versionsToString(versions)
        });
      },
      isValid: function(valid) {
        return isValid = valid !== void 0 ? valid : isValid;
      }
    };
    return Browser;
  }]);

}).call(this);

(function() {
  app.factory('Configuration', ["$rootScope", "$q", "api", "Model", "Model_service", "Port", "Rule", "Device_routing", "Routing_model_applier", "Version", "Status", "GUI", "Routing_model_errors", "Enums", "Device_settings", "translate", "Port_numeration", "FileDB", function($rootScope, $q, api, Model, Model_service, Port, Rule, Device_routing, Routing_model_applier, Version, Status, GUI, Routing_model_errors, Enums, Device_settings, translate, Port_numeration, FileDB) {
    var Configuration, exceptions, key, section;
    section = function(description) {
      var deserialize_after_load, migrate_before_deserialize, serialize_before_save;
      description.is_configuration_section = true;
      migrate_before_deserialize = function(description) {
        var deserialize;
        deserialize = description.deserialize;
        return description.deserialize = function(configuration) {
          if (!configuration.version || $rootScope.configuration.version.after(configuration.version)) {
            if (description.migrate) {
              description.migrate(configuration, Version(configuration.version));
            }
          }
          return deserialize.apply(this, arguments);
        };
      };
      serialize_before_save = function(description) {
        var save;
        if (description.save) {
          save = description.save;
          return description.save = function() {
            var data;
            data = description.serialize(Model);
            data.version = $rootScope.configuration.version.toString();
            return save(data);
          };
        }
      };
      deserialize_after_load = function(description) {
        var load;
        if (description.load) {
          load = description.load;
          return description.load = function() {
            return load.apply(this, arguments).then(function(result) {
              result = description.deserialize(result);
              if (description.validate != null) {
                description.validate(result);
              }
              return result;
            });
          };
        }
      };
      migrate_before_deserialize(description);
      serialize_before_save(description);
      deserialize_after_load(description);
      if (description.device) {
        serialize_before_save(description.device);
        deserialize_after_load(description.device);
      }
      description.load_into_model = function() {
        return description.load().then(function(configuration) {
          return replace_with(Model, configuration);
        });
      };
      return description;
    };
    Configuration = {
      Error: {
        Inconsistent_configuration: custom_error('Inconsistent_configuration')
      },
      Device: {
        reset_routing: function() {
          return api.call('softResetSwitch');
        },
        reset: function() {
          return api.call('resetSwitch').then(function(result) {
            return Status.error(translate('error.device.reset_failed'));
          })["catch"](function(error) {
            return GUI.wait_for_connection(16, translate('configuration.status.application_restarting'), {
              to: 'device'
            });
          });
        }
      },
      Ports: section({
        serialize: function(model) {
          var port, result;
          result = {
            ports: (function() {
              var j, len, ref, results;
              ref = model.ports;
              results = [];
              for (j = 0, len = ref.length; j < len; j++) {
                port = ref[j];
                results.push(Port.sanitize(port));
              }
              return results;
            })()
          };
          replace_with(result, Configuration.Ports.Joint_ports.serialize(model));
          return result;
        },
        deserialize: function(configuration) {
          var result;
          result = {
            ports: configuration.ports,
            joint_ports: configuration.joint_ports
          };
          replace_with(result, Configuration.Ports.Joint_ports.deserialize(configuration, result.ports));
          return result;
        },
        migrate: function(configuration, version) {
          var j, len, port, ref;
          if (version.before('1.2.0')) {
            ref = configuration.ports;
            for (j = 0, len = ref.length; j < len; j++) {
              port = ref[j];
              if (port.deep_inspection == null) {
                port.deep_inspection = false;
              }
            }
          }
          return Configuration.Ports.Joint_ports.migrate(configuration, version);
        },
        load_comments: function(configuration) {
          return FileDB.load('system/ports').then(function(result) {
            var j, len, port, ref;
            ref = configuration.ports;
            for (j = 0, len = ref.length; j < len; j++) {
              port = ref[j];
              port.comment = result.comments[port.id];
            }
            return configuration;
          });
        },
        set_comment: function(port, comment) {
          var data;
          data = [];
          data[port.id] = comment;
          return FileDB.update('system/ports', 'comments', data).then(function() {
            return port.comment = comment;
          });
        },
        load: function() {
          return Configuration.Ports.device.load().then(function(configuration) {
            return Configuration.Ports.load_comments(configuration);
          });
        },
        save: function(configuration) {
          var j, len, port, ref, results;
          ref = configuration.ports;
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            port = ref[j];
            if (port.comment) {
              results.push(Configuration.Ports.set_comment(port));
            } else {
              results.push(void 0);
            }
          }
          return results;
        },
        reset: function() {
          var clear_comments;
          clear_comments = {
            'comments': {}
          };
          return FileDB.save('system/ports', clear_comments);
        },
        device: {
          deserialize: function(ports) {
            var configuration, port;
            configuration = {
              ports: (function() {
                var j, len, results;
                results = [];
                for (j = 0, len = ports.length; j < len; j++) {
                  port = ports[j];
                  results.push({
                    id: port.id
                  });
                }
                return results;
              })()
            };
            Configuration.Ports.device.refresh(ports, configuration);
            replace_with(configuration, Configuration.Ports.Joint_ports.device.deserialize(configuration));
            return configuration;
          },
          refresh: function(ports, model) {
            var converter, field, fields, j, len, port, port_data, results;
            results = [];
            for (j = 0, len = ports.length; j < len; j++) {
              port_data = ports[j];
              port = model.ports[port_data.id - 1];
              fields = {
                enabled: function(x) {
                  if (x === 1) {
                    return true;
                  } else {
                    return false;
                  }
                },
                eth_mode: function(x) {
                  switch (x) {
                    case Enums.ethernet_port_modes['1000BASE_X']:
                      return x;
                    case Enums.ethernet_port_modes['10GBASE_CR']:
                      return x;
                    case Enums.ethernet_port_modes['40GBASE_SR4']:
                      return x;
                    case Enums.ethernet_port_modes['DISABLED']:
                      return x;
                    default:
                      console.error('Unknown port mode', x);
                      return x;
                  }
                },
                parser_level: function(x) {
                  return x;
                },
                mac_learning: function(x) {
                  if (x === 1) {
                    return true;
                  } else {
                    return false;
                  }
                },
                deep_inspection: function(x) {
                  if (x === 1) {
                    return true;
                  } else {
                    return false;
                  }
                },
                force_up: function(x) {
                  if (x === 1) {
                    return true;
                  } else {
                    return false;
                  }
                },
                loopback: function(x) {
                  if (x === 1) {
                    return true;
                  } else {
                    return false;
                  }
                }
              };
              results.push((function() {
                var results1;
                results1 = [];
                for (field in fields) {
                  converter = fields[field];
                  results1.push(port[field] = converter(port_data[field]));
                }
                return results1;
              })());
            }
            return results;
          },
          load: function() {
            return api.call("getSwitchInfo").then(function(result) {
              return result.Ports;
            });
          }
        },
        Joint_ports: {
          serialize: function(model) {
            var j, joint_port, joint_ports, len, port, result;
            joint_ports = angular.copy(model.joint_ports);
            for (j = 0, len = joint_ports.length; j < len; j++) {
              joint_port = joint_ports[j];
              joint_port.ports = (function() {
                var k, len1, ref, results;
                ref = joint_port.ports;
                results = [];
                for (k = 0, len1 = ref.length; k < len1; k++) {
                  port = ref[k];
                  results.push(port.id);
                }
                return results;
              })();
            }
            return result = {
              joint_ports: joint_ports
            };
          },
          deserialize: function(configuration, ports) {
            var j, joint_port, joint_ports, len, port, port_by_id, result;
            port_by_id = function(id) {
              var j, len, port;
              for (j = 0, len = ports.length; j < len; j++) {
                port = ports[j];
                if (port.id === id) {
                  return port;
                }
              }
            };
            joint_ports = angular.copy(configuration.joint_ports);
            for (j = 0, len = joint_ports.length; j < len; j++) {
              joint_port = joint_ports[j];
              joint_port.ports = (function() {
                var k, len1, ref, results;
                ref = joint_port.ports;
                results = [];
                for (k = 0, len1 = ref.length; k < len1; k++) {
                  port = ref[k];
                  results.push(port_by_id(port));
                }
                return results;
              })();
            }
            return result = {
              joint_ports: joint_ports
            };
          },
          migrate: function(configuration, version) {
            var i, j, ref, results;
            if (version.before('1.4.0')) {
              if (!configuration.joint_ports) {
                configuration.joint_ports = [];
                if (Port.has_joint_ports()) {
                  results = [];
                  for (i = j = 1, ref = Port.joint_port_count(); 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
                    results.push(configuration.joint_ports.push({
                      id: i,
                      mode: '4x10G'
                    }));
                  }
                  return results;
                }
              }
            }
          },
          device: {
            deserialize: function(model) {
              var configuration, i, id, index, j, joined_ports, joint_port_count, joint_ports, portsId, ref;
              portsId = [];
              joined_ports = function(id) {
                var j, ref, results, shift;
                shift = Port_numeration.joined_port_id_to_port_id(id, 0);
                return (function() {
                  results = [];
                  for (var j = 1, ref = Device_settings.ports_in_joint_port; 1 <= ref ? j <= ref : j >= ref; 1 <= ref ? j++ : j--){ results.push(j); }
                  return results;
                }).apply(this).map(function(i) {
                  return model.ports[shift + i - 1];
                }).map(function(port) {
                  return port.id;
                });
              };
              joint_port_count = Math.ceil((model.ports.length - Device_settings.generic_port_count) * 1.0 / Device_settings.ports_in_joint_port);
              if (joint_port_count < 0) {
                joint_port_count = 0;
              }
              for (i = j = 1, ref = joint_port_count; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
                index = (function() {
                  switch (Device_settings.get_platform()) {
                    case Device_settings.devices.iz1:
                      return i;
                    case Device_settings.devices.iz1f:
                    case Device_settings.devices.unknown:
                      if (i % 2 === 1) {
                        return i + 1;
                      } else {
                        return i - 1;
                      }
                  }
                })();
                portsId.push(index);
              }
              joint_ports = joint_port_count === 0 ? [] : (function() {
                var k, len, results;
                results = [];
                for (k = 0, len = portsId.length; k < len; k++) {
                  id = portsId[k];
                  results.push({
                    id: id,
                    ports: joined_ports(id)
                  });
                }
                return results;
              })();
              configuration = {
                joint_ports: joint_ports
              };
              Configuration.Ports.Joint_ports.device.refresh(configuration);
              return configuration;
            },
            refresh: function(model) {
              var j, joint_port, len, ref, results;
              ref = model.joint_ports;
              results = [];
              for (j = 0, len = ref.length; j < len; j++) {
                joint_port = ref[j];
                results.push(joint_port.mode = joint_port.ports[0].eth_mode === Enums.ethernet_port_modes['40GBASE_SR4'] || joint_port.ports[0].eth_mode === Enums.ethernet_port_modes.XLAUI ? '40G' : '4x10G');
              }
              return results;
            }
          }
        }
      }),
      Routing: section({
        serialize: function(model) {
          var result;
          return result = {
            rules: model.rules.map(function(rule) {
              return Rule.serialize(rule);
            })
          };
        },
        deserialize: function(configuration) {
          var result;
          return result = {
            rules: configuration.rules.map(function(rule) {
              return Rule.deserialize(rule);
            })
          };
        },
        migrate: function(configuration, version) {
          var j, len, ref, results, rule;
          if (version.before('1.1.0')) {
            ref = configuration.rules;
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
              rule = ref[j];
              if (rule.action === 'balance' && rule.outputs.length > 1 && (rule.hashing_profile == null)) {
                results.push(rule.hashing_profile = 0);
              } else {
                results.push(void 0);
              }
            }
            return results;
          }
        },
        save: function(configuration) {
          return FileDB.save('system/routing', configuration);
        },
        load: function() {
          return FileDB.load('system/routing');
        },
        reset: function() {
          return FileDB.save('system/routing', {
            "rules": [],
            "version": "1.6.6"
          });
        },
        validate: function(configuration) {
          var filter, j, len, ref, results, rule;
          if ($rootScope.configuration.version.starting_from('1.3.0')) {
            ref = configuration.rules;
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
              rule = ref[j];
              results.push((function() {
                var k, len1, ref1, results1;
                ref1 = rule.filters;
                results1 = [];
                for (k = 0, len1 = ref1.length; k < len1; k++) {
                  filter = ref1[k];
                  if ($rootScope.unmasked_acl_filter_types.has(filter.type) && Device_routing.Filter.has_non_default_mask(filter)) {
                    throw new Error(translate('configuration.error.filter_should_not_have_a_mask', {
                      filter: translate("ACL.rule.filter.type." + filter.type)
                    }));
                  } else {
                    results1.push(void 0);
                  }
                }
                return results1;
              })());
            }
            return results;
          }
        }
      }),
      Users: {
        change_password: function(password) {
          return FileDB.load('system/users').then(function(result) {
            result.users[0].password = password;
            return FileDB.save('system/users', result);
          });
        }
      },
      Network: section({
        serialize: function(model) {
          var result;
          return result = {
            network: model.network
          };
        },
        deserialize: function(configuration) {
          var result;
          return result = {
            network: configuration.network
          };
        },
        migrate: function(configuration, version) {},
        load: function() {
          return Configuration.Network.device.load();
        },
        save: function(configuration) {
          return Configuration.Network.device.save(configuration);
        },
        device: {
          serialize: function(model) {
            var network;
            network = angular.copy(model.network);
            network.dhcp = network.dhcp === true ? '1' : '0';
            return network;
          },
          deserialize: function(result) {
            return {
              network: {
                dhcp: result.dhcp === '1' ? true : false,
                ip: result.ip,
                mask: result.mask,
                gateway: result.gateway,
                dns1: result.dns1 || '',
                dns2: result.dns2 || ''
              }
            };
          },
          save: function(configuration) {
            return api.call('setNetConfig', configuration);
          },
          load: function() {
            return api.call('getNetConfig');
          }
        }
      }),
      serialize: function(configuration) {
        var name, serialized_configuration;
        serialized_configuration = {};
        for (name in Configuration) {
          section = Configuration[name];
          if (section.is_configuration_section) {
            replace_with(serialized_configuration, section.serialize(configuration));
          }
        }
        serialized_configuration.version = $rootScope.configuration.version.toString();
        return serialized_configuration;
      },
      load: function() {
        var configuration, name, sections;
        configuration = {};
        sections = [];
        for (name in Configuration) {
          section = Configuration[name];
          if (section.is_configuration_section && section.load) {
            sections.push(section);
          }
        }
        return Promise.each(sections, function(section) {
          return section.load().then(function(configuration_portion) {
            return replace_with(configuration, configuration_portion);
          });
        }).then(function() {
          return configuration;
        });
      },
      read_local_routing_configuration: function() {
        $rootScope.routing = {};
        return Configuration.Routing.load().then(function(result) {
          return $rootScope.routing = result;
        });
      },
      validate: function(configuration) {
        if (!configuration.ports) {
          throw new Error(translate('configuration.error.invalid'));
        }
        if (!configuration.rules) {
          throw new Error(translate('configuration.error.invalid'));
        }
      },
      migrate: function(configuration) {
        var name, version;
        version = Version(configuration.version);
        for (name in Configuration) {
          section = Configuration[name];
          if (section.is_configuration_section && section.migrate) {
            section.migrate(configuration, version);
          }
        }
        configuration.version = $rootScope.configuration.version.toString();
        return configuration;
      },
      test_compliance: function(configuration) {
        var j, len, port, ref, results;
        if (Port.count !== configuration.ports.length) {
          throw new Configuration.Error.Inconsistent_configuration();
        }
        ref = configuration.ports;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          port = ref[j];
          if (!Port.by_id(port.id)) {
            throw new Configuration.Error.Inconsistent_configuration();
          } else {
            results.push(void 0);
          }
        }
        return results;
      },
      apply: function(configuration) {
        return Promise.resolve(true).then(function() {
          Configuration.migrate(configuration);
          Configuration.test_compliance(configuration);
          return configuration = angular.copy(configuration);
        }).then(function() {
          $rootScope.applying_configuration = true;
          return Model_service.do_with_port_lock(function() {
            var name;
            replace_with(Model, Configuration.Ports.deserialize(configuration));
            for (name in Configuration) {
              section = Configuration[name];
              if (!['Ports'].has(name)) {
                if (section.is_configuration_section) {
                  replace_with(Model, section.deserialize(configuration));
                }
              }
            }
            return Configuration.Device.reset_routing().then(function() {
              var sections;
              sections = [];
              for (name in Configuration) {
                section = Configuration[name];
                if (section.is_configuration_section && section.save) {
                  sections.push(section);
                }
              }
              return Promise.each(sections, (function(section) {
                return section.save();
              }));
            }).then(function() {
              return Routing_model_applier.set_up_routing(Model.rules, Model.ports, Model.joint_ports);
            });
          });
        })["finally"](function() {
          return $rootScope.applying_configuration = false;
        });
      },
      reset: function() {
        var deferred, name, resets;
        if (!confirm(translate('configuration.confirm_reset'))) {
          return;
        }
        resets = [];
        for (name in Configuration) {
          section = Configuration[name];
          if (section.is_configuration_section) {
            if (section.reset != null) {
              resets.push(section.reset.bind(section));
            }
          }
        }
        deferred = $q.defer();
        deferred.resolve();
        deferred.promise;
        return resets.reduce((function(reduced, reset) {
          return reduced.then(reset);
        }), deferred.promise).then(function() {
          return Configuration.Device.reset();
        });
      }
    };
    exceptions = ['Error', 'Device', 'Users'];
    for (key in Configuration) {
      section = Configuration[key];
      if (typeof section === 'object' && !section.is_configuration_section && exceptions.has_no(key)) {
        throw new Error("Configuration." + key + " is not a section. If it's intended add it to exceptions");
      }
    }
    return Configuration;
  }]);

}).call(this);

(function() {
  app.factory('Configurations', ["$rootScope", "$http", "$timeout", "api", "log", "Status", "Model", "Configuration", "Device", "Device_GUI", "translate", "Routing_model_errors", function($rootScope, $http, $timeout, api, log, Status, Model, Configuration, Device, Device_GUI, translate, Routing_model_errors) {
    var Configurations;
    return Configurations = {
      save: function(name) {
        return Configuration.load().then(function(configuration) {
          configuration = Configuration.serialize(configuration);
          return api.call("filedb.save", {
            file: name + '.conf',
            data: configuration
          });
        }).then(function() {
          log.info(translate('configuration.status.saved'), configuration);
          Status.info(translate('configuration.status.saved'));
          return Configurations.collapse_menu();
        });
      },
      load: function(name) {
        if (!name) {
          return;
        }
        return api.call("filedb.load", {
          file: name + '.conf'
        }).then(function(configuration) {
          Status.busy(translate('configuration.status.applying'));
          return Configuration.apply(configuration);
        }).then(function() {
          Status.info(translate('configuration.status.loaded'));
          return Configurations.collapse_menu();
        });
      },
      download: function(name) {
        Configurations.collapse_menu();
        return $timeout(function() {
          return Configuration.load().then(function(configuration) {
            configuration = Configuration.serialize(configuration);
            return download_file(configuration, 'configuration.conf');
          })["catch"](function(error) {
            console.error(error.stack || error);
            return Status.error(error.message);
          });
        }, 0);
      },
      upload: function(file) {
        var reader;
        Configurations.collapse_menu();
        Status.busy();
        reader = new FileReader();
        reader.onload = function(event) {
          var configuration, error, error1;
          configuration = null;
          try {
            configuration = JSON.parse(event.target.result);
            Configuration.validate(configuration);
          } catch (error1) {
            error = error1;
            log.error(error);
            return Status.error(translate('configuration.error.invalid'));
          }
          Status.busy(translate('configuration.status.applying'));
          return Configuration.apply(configuration).then(function(rules) {
            Status.info(translate('configuration.status.loaded'));
            return $rootScope.$broadcast('configuration_loaded', rules);
          })["catch"](function(error) {
            console.error(error);
            if (error.stack) {
              console.error(error.stack);
            }
            if (error.name === 'Inconsistent_configuration') {
              return Status.error(translate('configuration.error.inconsistent'));
            }
            if (api.is_api_error(error)) {
              return;
            }
            if (Routing_model_errors.is(error)) {
              return Status.error(Routing_model_errors.message(error));
            }
            return Status.error(translate('configuration.error.configuration_upload_failed'));
          });
        };
        return reader.readAsText(file);
      },
      fetch_list: function() {
        return api.call("filedb.list", {}).then(function(list) {
          return $rootScope.configurations = list.map(function(item) {
            return item.substring(0, item.lastIndexOf('.conf'));
          });
        });
      },
      "delete": function(name) {
        if (!confirm(translate('configuration.confirm_deletion', {
          name: name
        }))) {
          return;
        }
        return api.call("filedb.delete", {
          file: name + '.conf'
        }).then(function(result) {
          Status.info(translate('configuration.status.deleted'));
          return Configurations.collapse_menu();
        });
      },
      collapse_menu: function() {
        return $rootScope.close_configuration_menu_dropdown = {};
      }
    };
  }]);

}).call(this);

(function() {
  app.factory('Device_GUI', ["$rootScope", "api", "Port", "Model", "Model_service", "Status", "Device_settings", "Login", "translate", "Port_view", "Configuration", "Port_numeration", function($rootScope, api, Port, Model, Model_service, Status, Device_settings, Login, translate, Port_view, Configuration, Port_numeration) {
    var Device, default_status_place, device, device_margin_top, fixed_head, fixed_head_height, menu, menu_height, navigating_from_page_confirmation, offsetLeft, ports_container;
    ports_container = document.querySelector('.device .ports');
    menu = document.querySelector('.menu');
    device = document.querySelector('.device');
    default_status_place = document.querySelector('.default-status-place');
    fixed_head = document.querySelector('.fixed-head');
    navigating_from_page_confirmation = document.querySelector('.navigating-from-page-confirmation');
    fixed_head_height = fixed_head.offsetHeight;
    device_margin_top = parseInt(window.getComputedStyle(device).marginTop);
    menu_height = menu.offsetHeight + parseInt(window.getComputedStyle(menu).marginTop) + parseInt(window.getComputedStyle(menu).marginBottom);
    offsetLeft = function(element) {
      var add, offset_left;
      offset_left = 0;
      add = function() {
        if (element.offsetLeft != null) {
          return offset_left += element.offsetLeft;
        }
      };
      add();
      while (element = element.offsetParent) {
        add();
      }
      return offset_left;
    };
    Device = {
      port_count: function() {
        if (!Model.ports) {
          return Device_settings.generic_port_count;
        }
        return Math.min(Model.ports.length, Device_settings.generic_port_count);
      },
      group_count: function() {
        return Math.ceil((1.0 * this.port_count()) / this.port_group_size);
      },
      port_group_size: 12,
      port_group_spacing: 10,
      joint_port_group_spacing: 7,
      joint_port_vertical_spacing: 4,
      port_width: 39,
      hole_height: 20,
      inside_joint_port_width: 23,
      inside_joint_port_height: 16,
      inside_joint_port_number_width: 20,
      port_number_height: 25,
      port_height: 45,
      inter_port_spacing: 1,
      port_group_top_offset: 6,
      joint_port_number_height: 16,
      selection: {
        start: false,
        end: false,
        box: {
          element: document.querySelector('#selection'),
          hide: function() {
            return Device.selection.box.element.style.display = 'none';
          },
          show: function() {
            return Device.selection.box.element.style.display = 'block';
          },
          size: function(size) {
            var key, results, value;
            if (size.width == null) {
              size.width = 0;
            }
            if (size.height == null) {
              size.height = 0;
            }
            results = [];
            for (key in size) {
              value = size[key];
              results.push(Device.selection.box.element.style[key] = value + 'px');
            }
            return results;
          }
        }
      },
      reshift: function() {
        return this.shift = {
          x: offsetLeft(ports_container),
          y: menu_height + device_margin_top
        };
      },
      initialize: function() {
        jQuery(Device.selection.box.element).on('mouseup', function() {
          return jQuery(document).trigger('click');
        });
        this.reshift();
        window.onresize = this.reshift.bind(this);
        this.refresh_port_coordinates();
        return Device.ready = true;
      },
      select_port: function(port, multiple_selection) {
        if (multiple_selection) {
          return Port_view.toggle_selection(port);
        } else {
          return Port_view.select(port);
        }
      },
      refresh_port_coordinates: function() {
        return this.port_coordinates = this.generate_port_coordinates();
      },
      generate_port_coordinates: function() {
        var bottom_row_shift, calculate_joint_port_coordinates, coordinates, device_platform, firstRow, group, horizontal_shift, i, index, inside_joint_row_shift, k, l, port_shift, ref, ref1, secondRow, set_coordinates, set_joint_port_coordinates, top_row_shift, x_y_width_height, y;
        coordinates = [[-1, -1, -1, -1]];
        x_y_width_height = function(x, y, width, height) {
          return [x, y, x + width - 1, y + height - 1];
        };
        y = this.port_group_top_offset;
        port_shift = 0;
        horizontal_shift = 0;
        top_row_shift = this.port_number_height;
        bottom_row_shift = this.port_number_height + this.hole_height + this.inter_port_spacing;
        set_coordinates = function(index, x_y_width_height) {
          if (index <= Port.count) {
            return coordinates[index] = x_y_width_height;
          }
        };
        group = 0;
        index = 0;
        firstRow = 0;
        secondRow = 0;
        device_platform = Device_settings.get_platform();
        while (group < this.group_count()) {
          for (i = k = 1, ref = this.port_group_size / 2; 1 <= ref ? k <= ref : k >= ref; i = 1 <= ref ? ++k : --k) {
            index = group * this.port_group_size + i * 2;
            switch (device_platform) {
              case Device_settings.devices.iz1:
                firstRow = index - 1;
                secondRow = index;
                break;
              case Device_settings.devices.iz1f:
              case Device_settings.devices.unknown:
                firstRow = index;
                secondRow = index - 1;
            }
            set_coordinates(firstRow, x_y_width_height(horizontal_shift, y + top_row_shift, this.port_width, this.hole_height));
            set_coordinates(secondRow, x_y_width_height(horizontal_shift, y + bottom_row_shift, this.port_width, this.hole_height));
            horizontal_shift += this.port_width + this.inter_port_spacing;
          }
          horizontal_shift -= this.inter_port_spacing;
          horizontal_shift += this.port_group_spacing;
          port_shift += this.port_group_size;
          group++;
        }
        y = this.joint_port_number_height;
        top_row_shift = 0;
        bottom_row_shift = this.inside_joint_port_height + this.inter_port_spacing + this.inside_joint_port_height + this.joint_port_vertical_spacing;
        inside_joint_row_shift = this.inside_joint_port_height + this.inter_port_spacing;
        if (Port.has_joint_ports()) {
          calculate_joint_port_coordinates = (function(_this) {
            return function(id) {
              var delta_x, extra_horizontal_shift, j, l, m, ref1, ref2, results, results1, shiftStatement, vertical_shift;
              port_shift = Port_numeration.joined_port_id_to_port_id(id, 0);
              shiftStatement = (function() {
                switch (Device_settings.get_platform()) {
                  case Device_settings.devices.iz1:
                    return id % 2 === 1;
                  case Device_settings.devices.iz1f:
                  case Device_settings.devices.unknown:
                    return id % 2 === 0;
                }
              })();
              vertical_shift = shiftStatement ? top_row_shift : bottom_row_shift;
              if (Model_service.get_joint_port_with_offset(Model, id).mode === '40G') {
                coordinates[port_shift + 1] = x_y_width_height(horizontal_shift + _this.inside_joint_port_number_width, y + vertical_shift, _this.inside_joint_port_width * Device_settings.ports_in_joint_port / 2 + _this.inter_port_spacing, _this.inside_joint_port_height * Device_settings.ports_in_joint_port / 2 + _this.inter_port_spacing);
                results = [];
                for (j = l = 2, ref1 = Device_settings.ports_in_joint_port; 2 <= ref1 ? l <= ref1 : l >= ref1; j = 2 <= ref1 ? ++l : --l) {
                  results.push(coordinates[port_shift + j] = [-1, -1, -1, -1]);
                }
                return results;
              } else {
                extra_horizontal_shift = 0;
                results1 = [];
                for (j = m = 1, ref2 = Device_settings.ports_in_joint_port / 2; 1 <= ref2 ? m <= ref2 : m >= ref2; j = 1 <= ref2 ? ++m : --m) {
                  delta_x = j === 1 ? _this.inside_joint_port_number_width : 0;
                  coordinates[port_shift + j] = x_y_width_height(horizontal_shift + extra_horizontal_shift + delta_x, y + vertical_shift, _this.inside_joint_port_width, _this.inside_joint_port_height);
                  coordinates[port_shift + j + Device_settings.ports_in_joint_port / 2] = x_y_width_height(horizontal_shift + extra_horizontal_shift + delta_x, y + vertical_shift + inside_joint_row_shift, _this.inside_joint_port_width, _this.inside_joint_port_height);
                  results1.push(extra_horizontal_shift += _this.inside_joint_port_number_width + _this.inside_joint_port_width + _this.inter_port_spacing);
                }
                return results1;
              }
            };
          })(this);
          set_joint_port_coordinates = function(i, x, y) {
            index = (function() {
              switch (Device_settings.get_platform()) {
                case Device_settings.devices.iz1:
                  return x;
                case Device_settings.devices.iz1f:
                case Device_settings.devices.unknown:
                  return y;
              }
            })();
            return calculate_joint_port_coordinates(i * 2 + 1 + index);
          };
          for (i = l = 0, ref1 = Port.joint_port_count() / 2 - 1; 0 <= ref1 ? l <= ref1 : l >= ref1; i = 0 <= ref1 ? ++l : --l) {
            set_joint_port_coordinates(i, 0, 1);
            set_joint_port_coordinates(i, 1, 0);
            horizontal_shift += (Device_settings.ports_in_joint_port / 2) * (this.inside_joint_port_number_width + this.inside_joint_port_width + this.inter_port_spacing);
            horizontal_shift -= this.inter_port_spacing;
            horizontal_shift += this.joint_port_group_spacing;
          }
        }
        return coordinates;
      },
      intersects: function(a, b) {
        if (a[0] > b[2] || b[0] > a[2]) {
          return false;
        }
        if (a[1] > b[3] || b[1] > a[3]) {
          return false;
        }
        return true;
      },
      detect_port_by_hole: function(x, y) {
        var id;
        this.reshift();
        x -= this.shift.x;
        y -= this.shift.y;
        id = 1;
        while (id < this.port_coordinates.length) {
          if (this.intersects(this.port_coordinates[id], [x, y, x, y])) {
            return Port.by_id(id);
          }
          id++;
        }
      },
      detect_port: function(event) {
        var $element, element;
        element = event.target;
        while (jQuery.contains(ports_container, element)) {
          $element = jQuery(element);
          if ($element.hasClass('port')) {
            return Port.by_id(parseInt($element.attr('data-port-id')));
          }
          element = element.parentNode;
        }
      },
      test_clicked_element: function(element) {
        if (jQuery.contains(menu, element)) {
          return false;
        }
        if (jQuery.contains(default_status_place, element)) {
          return false;
        }
        if (jQuery.contains(navigating_from_page_confirmation, element)) {
          return false;
        }
      },
      x: function(event) {
        if (event.clientX != null) {
          return event.clientX;
        } else {
          return event.x;
        }
      },
      y: function(event) {
        if (event.clientY != null) {
          return event.clientY;
        } else {
          return event.y;
        }
      },
      xy: function(event) {
        return [this.x(event), this.y(event)];
      },
      start_selection: function(event) {
        var is_ctrl_click, port, ref, start_selection, toggle_port_selection, x, y;
        if (event.which !== 1) {
          return;
        }
        if (!Device.ready) {
          return;
        }
        if (!Login.is_authenticated) {
          return;
        }
        if (this.test_clicked_element(event.target) === false) {
          return;
        }
        ref = this.xy(event), x = ref[0], y = ref[1];
        start_selection = (function(_this) {
          return function() {
            event.preventDefault();
            jQuery(fixed_head).addClass('selecting');
            _this.selection.start = {
              x: x,
              y: y
            };
            _this.selection.box.size({
              left: x,
              top: y
            });
            _this.selection.box.show();
            return true;
            return Port_view.deselect_all();
          };
        })(this);
        is_ctrl_click = function() {
          return event.ctrlKey;
        };
        toggle_port_selection = function(port) {
          this.multiple_ports_selected = Port_view.selected_count() > 1;
          return Port_view.toggle_selection(port);
        };
        port = this.detect_port(event);
        if (port) {
          if (is_ctrl_click()) {
            return toggle_port_selection(port);
          }
          if (Port_view.is_selected(port)) {
            return;
          }
        }
        port = this.detect_port_by_hole(x, y);
        if (!port) {
          if (is_ctrl_click()) {
            return;
          }
          return start_selection();
        }
        if (is_ctrl_click()) {
          return toggle_port_selection(port);
        }
        if (Port_view.is_selected(port)) {
          return;
        }
        Port_view.deselect_all();
        this.select_port(port, false);
        return this.multiple_ports_selected = false;
      },
      mouse_moved: function(event) {
        var height, size, width, x, y;
        if (!Device.ready) {
          return;
        }
        if (!this.selection.start) {
          return;
        }
        x = this.x(event);
        y = this.y(event);
        if (y > fixed_head_height) {
          y = fixed_head_height;
        }
        width = x - this.selection.start.x;
        height = y - this.selection.start.y;
        size = {
          left: width < 0 ? x : this.selection.start.x,
          top: height < 0 ? y : this.selection.start.y,
          width: Math.abs(width),
          height: Math.abs(height)
        };
        return this.selection.box.size(size);
      },
      end_selection: function(event) {
        var end, id, k, len, port, ref, selected, start, tmp, x, y;
        if (event.which !== 1) {
          return;
        }
        if (!Device.ready) {
          return;
        }
        ref = this.xy(event), x = ref[0], y = ref[1];
        if (!this.selection.start) {
          return;
        }
        jQuery(fixed_head).removeClass('selecting');
        this.selection.end = {
          x: x,
          y: y
        };
        start = this.selection.start;
        end = this.selection.end;
        this.reshift();
        start.x -= this.shift.x;
        start.y -= this.shift.y;
        end.x -= this.shift.x;
        end.y -= this.shift.y;
        if (start.x > end.x) {
          tmp = start.x;
          start.x = end.x;
          end.x = tmp;
        }
        if (start.y > end.y) {
          tmp = start.y;
          start.y = end.y;
          end.y = tmp;
        }
        selected = [];
        id = 1;
        while (id < this.port_coordinates.length) {
          if (this.intersects(this.port_coordinates[id], [start.x, start.y, end.x, end.y])) {
            selected.push(Port.by_id(id));
          }
          id++;
        }
        Port_view.deselect_all();
        for (k = 0, len = selected.length; k < len; k++) {
          port = selected[k];
          Port_view.select(port, false);
        }
        this.multiple_ports_selected = selected.length > 1;
        this.selection.start = false;
        this.selection.end = false;
        this.selection.box.hide();
        return this.selection.box.size({
          width: 0,
          height: 0
        });
      }
    };
    Device.joint_port_width = function() {
      return (Device_settings.ports_in_joint_port / 2) * (Device.inside_joint_port_width + Device.inside_joint_port_number_width + Device.inter_port_spacing) - Device.inter_port_spacing;
    };
    return Device;
  }]);

}).call(this);

(function() {
  app.factory('Device_settings', ["$rootScope", function($rootScope) {
    var Device_settings;
    return Device_settings = {
      devices: {
        iz1: {
          name: 'IZ1'
        },
        iz1f: {
          name: 'IZ1F'
        },
        unknown: {
          name: 'unknown'
        }
      },
      is_unknown_platform: function() {
        return !Device_settings.is_iz1() && !Device_settings.is_iz1f();
      },
      is_iz1: function() {
        return $rootScope.device_platform === Device_settings.devices.iz1.name;
      },
      is_iz1f: function() {
        return $rootScope.device_platform === Device_settings.devices.iz1f.name;
      },
      get_platform: function() {
        var name, platform, ref;
        ref = Device_settings.devices;
        for (name in ref) {
          platform = ref[name];
          if ($rootScope.device_platform === platform.name) {
            return platform;
          }
        }
        return this.devices.unknown;
      }
    };
  }]);

}).call(this);

(function() {
  app.factory('Device', ["$rootScope", "$q", "api", "Model", "Model_service", "Port", "Status", "GUI", "Device_GUI", "Port_numeration", "Device_settings", "Device_routing", "Routing_model_applier", "Configuration", "translate", "Login", function($rootScope, $q, api, Model, Model_service, Port, Status, GUI, Device_GUI, Port_numeration, Device_settings, Device_routing, Routing_model_applier, Configuration, translate, Login) {
    var Device, get_sfp_data;
    get_sfp_data = function(data) {
      var joint_port_id, ref, sfp_data, sub_port_id;
      sfp_data = data.sfp_data;
      if (!Port.is_generic(data.id)) {
        ref = Port_numeration.joined_port_id_from_port_id(data.id), joint_port_id = ref[0], sub_port_id = ref[1];
        sfp_data.rx_power = sfp_data['rx' + sub_port_id + '_power'];
      }
      return sfp_data;
    };
    return Device = {
      port_stats_fields: ['state', 'rx_octets', 'tx_octets', 'rx_crc_error_octets', 'tx_drop_octets'],
      isBooting: true,
      initialize: function() {
        return api.call('getSwitchInfo').then(function(result) {
          var ports_model;
          $rootScope.serial = result.Serial;
          $rootScope.device_version = result.version;
          $rootScope.device_platform = result.Platform;
          Port.count = result.PortsCount;
          ports_model = Configuration.Ports.device.deserialize(result.Ports);
          replace_with(Model, Configuration.Ports.deserialize(ports_model));
          Device.initialize_port_groups();
          Device.refresh_port_stats_from_switch_info(result);
          Routing_model_applier.set_interface_version(api)["catch"](function(e) {
            return console.error(e);
          });
          return result;
        });
      },
      initialize_port_groups: function() {
        var group, group_num, i, len, port, ref, results;
        group_num = -1;
        group = null;
        ref = Model.ports;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          port = ref[i];
          if (!(port.id <= Device_settings.generic_port_count)) {
            continue;
          }
          if (port.id % Device_GUI.port_group_size === 1) {
            group_num++;
            group = [];
            $rootScope.groups[group_num] = group;
          }
          results.push(group.push(Model_service.get_port_with_offset(Model, port.id)));
        }
        return results;
      },
      refresh_ports_from_switch_info: function(result) {
        if (!Model_service.is_ports_lock_empty()) {
          return;
        }
        Configuration.Ports.device.refresh(result.Ports, Model);
        return Configuration.Ports.Joint_ports.device.refresh(Model);
      },
      refresh_port_stats_from_switch_info: function(result) {
        var delta_rx, delta_t, delta_tx, field, i, len, port, port_data, ref, results;
        ref = result.Ports;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          port_data = ref[i];
          if (!$rootScope.stats.ports[port_data.id]) {
            results.push($rootScope.stats.ports[port_data.id] = {});
          } else {
            port = $rootScope.stats.ports[port_data.id];
            delta_t = (result.timestamp - port.timestamp) / 1000;
            delta_rx = port_data.rx_octets - port.rx_octets;
            delta_tx = port_data.tx_octets - port.tx_octets;
            port.rx_speed = port_data.state && delta_rx > 0 ? delta_rx / delta_t : 0;
            port.tx_speed = port_data.state && delta_tx > 0 ? delta_tx / delta_t : 0;
            port.active = port.rx_speed || port.tx_speed ? true : false;
            port.sfp_present = port_data.sfp_present === 1 ? true : false;
            port.sfp_data = get_sfp_data(port_data);
            port.timestamp = result.timestamp;
            results.push((function() {
              var j, len1, ref1, results1;
              ref1 = Device.port_stats_fields;
              results1 = [];
              for (j = 0, len1 = ref1.length; j < len1; j++) {
                field = ref1[j];
                if (port_data[field] != null) {
                  results1.push(port[field] = port_data[field]);
                }
              }
              return results1;
            })());
          }
        }
        return results;
      },
      refresh_ports: function() {
        var deferred;
        if ($rootScope.offline) {
          deferred = $q.defer();
          deferred.resolve();
          return deferred.promise;
        }
        return api.call("getSwitchInfo", {}, {
          minor: true
        }).then(function(result) {
          Device.refresh_ports_from_switch_info(result);
          Device.refresh_port_stats_from_switch_info(result);
          if (this.isBooting) {
            return $rootScope.safeApply(function() {
              this.isBooting = false;
              $rootScope.device_is_booting = false;
              return Login.authenticate();
            });
          }
        })["catch"](api.error.device_is_booting_up, function() {
          if (!this.isBooting) {
            return $rootScope.safeApply(function() {
              this.isBooting = true;
              return $rootScope.device_is_booting = true;
            });
          }
        });
      },
      set_up_routing: function(rules, ports, joint_ports) {
        return Model_service.do_with_port_lock(function() {
          return Routing_model_applier.set_up_routing(rules, ports, joint_ports);
        });
      },
      restart: function() {
        var rebooted;
        rebooted = function() {
          return GUI.wait_for_connection(60, translate('device.status.rebooting'), {
            to: 'device'
          });
        };
        return api.call('reboot')["finally"](rebooted);
      },
      load_configuration: function() {
        return api.call('getConfig');
      },
      load_rules: function() {
        return Device.load_configuration().then(function(result) {
          var i, index, method, ref;
          for (index = i = ref = result.length - 1; ref <= 0 ? i <= 0 : i >= 0; index = ref <= 0 ? ++i : --i) {
            method = result[index].method;
            if (method === 'setRulesList') {
              return result[index].params.rules;
            }
          }
          return {};
        });
      },
      save_configuration: function() {
        return Routing_model_applier.save_configuration(Model.rules, Model.ports, Model.joint_ports);
      }
    };
  }]);

}).call(this);

(function() {
  app.factory('Device_routing', ["$rootScope", "api", "Enums", "Utilities", "$sanitize", function($rootScope, api, Enums, Utilities, $sanitize) {
    var Device_routing;
    return Device_routing = {
      convert_to_device_rules: function(rules) {
        var filter, i, j, k, l, len, len1, len2, len3, m, name, port, property, ref, ref1, ref2, rule;
        rules = angular.copy(rules);
        for (j = 0, len = rules.length; j < len; j++) {
          rule = rules[j];
          rule.name = $sanitize(rule.name);
          ref = rule.inputs;
          for (i = k = 0, len1 = ref.length; k < len1; i = ++k) {
            port = ref[i];
            rule.inputs[i] = port.id;
          }
          ref1 = rule.outputs;
          for (i = l = 0, len2 = ref1.length; l < len2; i = ++l) {
            port = ref1[i];
            rule.outputs[i] = port.id;
          }
          rule.filters.sort(function(a, b) {
            return a.type > b.type;
          });
          for (name in rule) {
            property = rule[name];
            if (typeof property === 'boolean') {
              rule[name] = property << 0;
            }
          }
          ref2 = rule.filters;
          for (m = 0, len3 = ref2.length; m < len3; m++) {
            filter = ref2[m];
            Device_routing.Filter.convert_to_device(filter);
          }
        }
        return rules;
      },
      LBG: {
        Hash_profile: {
          by_id: function(id) {
            return $rootScope.hash_profiles.filter(function(profile) {
              return profile.id === id;
            })[0];
          },
          fetch: function() {
            return api.call('getDefaultHashProfile').then(function(result) {
              return Device_routing.LBG.Hash_profile.by_id(result.profile);
            });
          },
          fetch_all: function() {
            return api.call('getHashProfiles').then(function(result) {
              return $rootScope.hash_profiles = result.profiles;
            });
          }
        }
      },
      Filter: {
        ip_split_rule: /[,;\n\r\s]/,
        _get_by_type: function(type) {
          if (!Enums.ACL_Filter[type]) {
            throw new Error('Не найден фильтр с типом: ' + type);
          }
          return Enums.ACL_Filter[type];
        },
        _get_value: function(filter) {
          var ip, ips, j, len, result;
          switch (filter.type) {
            case 'multi_IP_address':
              ips = filter.value.split(Device_routing.Filter.ip_split_rule);
              result = [];
              for (j = 0, len = ips.length; j < len; j++) {
                ip = ips[j];
                if ((ip = ip.trim()).length !== 0) {
                  result.push({
                    src: ip
                  });
                  result.push({
                    dst: ip
                  });
                }
              }
              break;
            default:
              result = filter.value;
          }
          return result;
        },
        _get_type: function(filter) {
          var filter_type, type;
          filter_type = Device_routing.Filter._get_by_type(filter.type);
          type = (function() {
            switch (filter.type) {
              case 'IP_protocol_destination':
              case 'IP_protocol_source':
                if (filter.to_value) {
                  return filter_type.filter.value_range;
                } else {
                  return filter_type.filter.value;
                }
                break;
              default:
                return filter_type.filter.value;
            }
          })();
          return type;
        },
        _get_mask: function(filter) {
          var filter_type, mask;
          filter_type = Device_routing.Filter._get_by_type(filter.type);
          mask = filter_type.mask && typeof filter_type.mask.device === 'function' ? filter_type.mask.device(filter.mask) : filter.mask;
          return mask;
        },
        default_mask: function(filter_type) {
          switch (filter_type) {
            case 'Level4_data':
              return '';
            default:
              return Device_routing.Filter.identity_mask(Enums.ACL_Filter[filter_type]);
          }
        },
        is_default_mask: function(filter) {
          return filter.mask === Device_routing.Filter.default_mask(filter.type);
        },
        is_empty: function(filter) {
          if (filter.type === 'Level4_data') {
            filter.value = Utilities.trim_masked_hex(filter.value) || '';
            return filter.value.is_empty();
          }
          return (filter.value == null) && Device_routing.Filter.is_default_mask(filter);
        },
        has_non_default_mask: function(filter) {
          return !Device_routing.Filter.is_default_mask(filter);
        },
        convert_to_device: function(filter) {
          filter.mask = Device_routing.Filter._get_mask(filter);
          filter.value = Device_routing.Filter._get_value(filter);
          filter.type = Device_routing.Filter._get_type(filter);
          return filter;
        },
        sort: function(filters) {
          return filters.sort(function(a, b) {
            return Enums.ACL_Filter[a.type].condition - Enums.ACL_Filter[b.type].condition;
          });
        },
        type: function(filter) {
          var a_filter, name, ref;
          ref = Enums.ACL_Filter;
          for (name in ref) {
            a_filter = ref[name];
            if (a_filter === filter) {
              return name;
            }
          }
        },
        identity_mask: function(filter) {
          var _, to_hex;
          to_hex = function(bits) {
            var array, half_byte;
            array = [];
            while (bits > 0) {
              half_byte = (function() {
                switch (bits) {
                  case 1:
                    bits -= 1;
                    return '1';
                  case 2:
                    bits -= 2;
                    return '3';
                  case 3:
                    bits -= 3;
                    return '7';
                  default:
                    bits -= 4;
                    return 'F';
                }
              })();
              array.unshift(half_byte);
            }
            return array.join('');
          };
          if (to_hex(0) !== '') {
            throw new Error(to_hex(0));
          }
          if (to_hex(5) !== '1F') {
            throw new Error(to_hex(5));
          }
          if (to_hex(8) !== 'FF') {
            throw new Error(to_hex(8));
          }
          if (to_hex(31) !== '7FFFFFFF') {
            throw new Error(to_hex(31));
          }
          _ = Enums.ACL_Filter;
          switch (filter) {
            case _.source_MAC_address:
            case _.destination_MAC_address:
              return to_hex(filter.mask.bits).match(/.{2}/g).join(':');
            case _.source_IP_address:
            case _.destination_IP_address:
              return to_hex(filter.mask.bits).match(/.{2}/g).map(function(x) {
                return parseInt(x, 16);
              }).join('.');
            case _.Level4_data:
            case _.multi_IP_address:
              return '';
            default:
              return to_hex(filter.mask.bits);
          }
        }
      }
    };
  }]);

}).call(this);

(function() {
  app.factory('Enums', ["Utilities", function(Utilities) {
    var Enums, bits, combinations, ethernet_protocols, ip_address_mask, ip_protocols, mac_address_mask, subnet_mask_values, subnet_masks;
    ethernet_protocols = {
      'IP': 0x0800,
      'ARP': 0x0806,
      'VLAN (IEEE 802.1Q)': 0x8100,
      'Wake-on-LAN': 0x0842,
      'TRILL': 0x22F3,
      'DECnet Phase IV': 0x6003,
      'Reverse ARP': 0x8035,
      'AppleTalk (Ethertalk)': 0x809B,
      'AARP': 0x80F3,
      'IPX': 0x8137,
      'IPX': 0x8138,
      'QNX Qnet': 0x8204,
      'IPv6': 0x86DD,
      'Ethernet flow control': 0x8808,
      'IEEE 802.3': 0x8809,
      'CobraNet': 0x8819,
      'MPLS unicast': 0x8847,
      'MPLS multicast': 0x8848,
      'PPPoE Discovery': 0x8863,
      'PPPoE Session': 0x8864,
      'Jumbo Frame': 0x8870,
      'HomePlug 1.0 MME': 0x887B,
      'IEEE 802.1X': 0x888E,
      'PROFINET': 0x8892,
      'HyperSCSI': 0x889A,
      'ATA over Ethernet': 0x88A2,
      'EtherCAT': 0x88A4,
      'IEEE 802.1ad': 0x88A8,
      'Powerlink': 0x88AB,
      'LLDP': 0x88CC,
      'SERCOS III': 0x88CD,
      'HomePlug AV MME': 0x88E1,
      'Media Redundancy': 0x88E3,
      'IEEE 802.1AE': 0x88E5,
      'PTP over Ethernet': 0x88F7,
      'IEEE 802.1ag CFM': 0x8902,
      'FCoE': 0x8906,
      'FCoE Initialization': 0x8914,
      'RoCE': 0x8915,
      'HSR': 0x892F,
      'Ethernet Config Testing': 0x9000,
      'Q-in-Q': 0x9100,
      'LLT for Veritas Cluster': 0xCAFE
    };
    ip_protocols = {
      'HOPOPT': 0,
      'ICMP': 1,
      'IGMP': 2,
      'GGP': 3,
      'IPv4': 4,
      'ST': 5,
      'TCP': 6,
      'CBT': 7,
      'EGP': 8,
      'IGP': 9,
      'BBN-RCC-MON': 10,
      'NVP-II': 11,
      'PUP': 12,
      'ARGUS': 13,
      'EMCON': 14,
      'XNET': 15,
      'CHAOS': 16,
      'UDP': 17,
      'MUX': 18,
      'DCN-MEAS': 19,
      'HMP': 20,
      'PRM': 21,
      'XNS-IDP': 22,
      'TRUNK-1': 23,
      'TRUNK-2': 24,
      'LEAF-1': 25,
      'LEAF-2': 26,
      'RDP': 27,
      'IRTP': 28,
      'ISO-TP4': 29,
      'NETBLT': 30,
      'MFE-NSP': 31,
      'MERIT-INP': 32,
      'DCCP': 33,
      '3PC': 34,
      'IDPR': 35,
      'XTP': 36,
      'DDP': 37,
      'IDPR-CMTP': 38,
      'TP++': 39,
      'IL': 40,
      'IPv6': 41,
      'SDRP': 42,
      'IPv6-Route': 43,
      'IPv6-Frag': 44,
      'IDRP': 45,
      'RSVP': 46,
      'GRE': 47,
      'DSR': 48,
      'BNA': 49,
      'ESP': 50,
      'AH': 51,
      'I-NLSP': 52,
      'SWIPE': 53,
      'NARP': 54,
      'MOBILE': 55,
      'TLSP': 56,
      'SKIP': 57,
      'IPv6-ICMP': 58,
      'IPv6-NoNxt': 59,
      'IPv6-Opts': 60,
      'CFTP': 62,
      'SAT-EXPAK': 64,
      'KRYPTOLAN': 65,
      'RVD': 66,
      'IPPC': 67,
      'SAT-MON': 69,
      'VISA': 70,
      'IPCV': 71,
      'CPNX': 72,
      'CPHB': 73,
      'WSN': 74,
      'PVP': 75,
      'BR-SAT-MON': 76,
      'SUN-ND': 77,
      'WB-MON': 78,
      'WB-EXPAK': 79,
      'ISO-IP': 80,
      'VMTP': 81,
      'SECURE-VMTP': 82,
      'VINES': 83,
      'TTP': 84,
      'IPTM': 84,
      'NSFNET-IGP': 85,
      'DGP': 86,
      'TCF': 87,
      'EIGRP': 88,
      'OSPFIGP': 89,
      'Sprite-RPC': 90,
      'LARP': 91,
      'MTP': 92,
      'AX.25': 93,
      'IPIP': 94,
      'MICP': 95,
      'SCC-SP': 96,
      'ETHERIP': 97,
      'ENCAP': 98,
      'GMTP': 100,
      'IFMP': 101,
      'PNNI': 102,
      'PIM': 103,
      'ARIS': 104,
      'SCPS': 105,
      'QNX': 106,
      'A/N': 107,
      'IPComp': 108,
      'SNP': 109,
      'Compaq-Peer': 110,
      'IPX-in-IP': 111,
      'VRRP': 112,
      'PGM': 113,
      'L2TP': 115,
      'DDX': 116,
      'IATP': 117,
      'STP': 118,
      'SRP': 119,
      'UTI': 120,
      'SMP': 121,
      'SM': 122,
      'PTP': 123,
      'ISIS over IPv4': 124,
      'FIRE': 125,
      'CRTP': 126,
      'CRUDP': 127,
      'SSCOPMCE': 128,
      'IPLT': 129,
      'SPS': 130,
      'PIPE': 131,
      'SCTP': 132,
      'FC': 133,
      'RSVP-E2E-IGNORE': 134,
      'Mobility Header': 135,
      'UDPLite': 136,
      'MPLS-in-IP': 137,
      'manet': 138,
      'HIP': 139,
      'Shim6': 140,
      'WESP': 141,
      'ROHC': 142
    };
    subnet_mask_values = (function() {
      var j, results;
      results = [];
      for (bits = j = 0; j <= 8; bits = ++j) {
        results.push(Math.pow(2, 8) - Math.pow(2, bits));
      }
      return results;
    })();
    subnet_mask_values.remove(0);
    combinations = function(byte_order) {
      var combination_set, combinations_main, previous;
      combinations_main = subnet_mask_values.map(function(value) {
        var i, result;
        result = byte_order === 1 ? [] : (function() {
          var j, ref, results;
          results = [];
          for (i = j = 2, ref = byte_order; 2 <= ref ? j <= ref : j >= ref; i = 2 <= ref ? ++j : --j) {
            results.push(0);
          }
          return results;
        })();
        result.unshift(value);
        return result;
      });
      previous = [];
      if (byte_order > 1) {
        combination_set = combinations(byte_order - 1);
        previous = combination_set.map(function(combination) {
          return [255].concat(combination);
        });
      }
      return previous.concat(combinations_main);
    };
    subnet_masks = combinations(4).map(function(combination) {
      return combination.join('.');
    });
    mac_address_mask = {
      bits: 48
    };
    ip_address_mask = {
      bits: 32
    };
    Enums = {
      subnet_masks: subnet_masks,
      ethernet_port_modes: {
        '1000BASE_KX': 0,
        '1000BASE_X': 1,
        '10GBASE_CR': 2,
        '10GBASE_CX4': 3,
        '10GBASE_KX4': 4,
        '10GBASE_SR': 5,
        '40GBASE_CR4': 6,
        '40GBASE_KR4': 7,
        '40GBASE_SR4': 8,
        'AN_73': 9,
        'DISABLED': 10,
        'SGMII': 11,
        'XAUI': 12,
        'XLAUI': 13
      },
      ACL_actions: {
        drop: 0,
        permit: 1,
        balance: 2,
        redirect: 3,
        mirror: 4,
        set_hash_profile: 5,
        dubbing: 6
      },
      port_parser_levels: {
        L2: 2,
        L3: 3,
        L4: 4
      },
      Errors: {
        api: {
          set_interface_version: -32500
        }
      },
      ACL_Filter: {
        ethernet_protocol: {
          value: {
            type: 'select',
            from: ethernet_protocols,
            "default": ethernet_protocols.IP
          },
          mask: {
            bits: 16,
            device: Utilities.hex_string_to_number,
            model: Utilities.number_to_hex_string
          },
          filter: {
            value: 1,
            mask: 'eth_type_mask'
          },
          condition: 0
        },
        source_MAC_address: {
          value: {
            type: 'text'
          },
          mask: mac_address_mask,
          filter: {
            value: 2,
            mask: 'src_mac_mask'
          },
          condition: 1,
          direction: 'source'
        },
        destination_MAC_address: {
          value: {
            type: 'text'
          },
          mask: mac_address_mask,
          filter: {
            value: 3,
            mask: 'dst_mac_mask'
          },
          condition: 2,
          direction: 'destination'
        },
        source_IP_address: {
          value: {
            type: 'text'
          },
          mask: ip_address_mask,
          filter: {
            value: 4,
            mask: 'src_ip_mask'
          },
          condition: 3,
          direction: 'source'
        },
        destination_IP_address: {
          value: {
            type: 'text'
          },
          mask: ip_address_mask,
          filter: {
            value: 5,
            mask: 'dst_ip_mask'
          },
          condition: 4,
          direction: 'destination'
        },
        multi_IP_address: {
          value: {
            type: 'text'
          },
          filter: {
            value: 14
          },
          condition: 3
        },
        IP_protocol: {
          value: {
            type: 'select',
            from: ip_protocols,
            "default": ip_protocols.TCP
          },
          mask: {
            bits: 8,
            device: Utilities.hex_string_to_number,
            model: Utilities.number_to_hex_string
          },
          filter: {
            value: 6,
            mask: 'l4_proto_mask'
          },
          condition: 7
        },
        IP_protocol_source: {
          value: {
            type: 'text'
          },
          mask: {
            bits: 16,
            device: Utilities.hex_string_to_number,
            model: Utilities.number_to_hex_string
          },
          filter: {
            value: 7,
            value_range: 8,
            mask: 'l4_src_mask'
          },
          condition: 5,
          direction: 'source'
        },
        IP_protocol_destination: {
          value: {
            type: 'text'
          },
          mask: {
            bits: 16,
            device: Utilities.hex_string_to_number,
            model: Utilities.number_to_hex_string
          },
          filter: {
            value: 9,
            value_range: 10,
            mask: 'l4_dst_mask'
          },
          condition: 6,
          direction: 'destination'
        },
        VLAN: {
          value: {
            type: 'text'
          },
          mask: {
            bits: 16,
            device: Utilities.hex_string_to_number,
            model: Utilities.number_to_hex_string
          },
          filter: {
            value: 11,
            mask: 'vlan_mask'
          },
          condition: 8
        },
        VLAN2: {
          value: {
            type: 'text'
          },
          mask: {
            bits: 16,
            device: Utilities.hex_string_to_number,
            model: Utilities.number_to_hex_string
          },
          filter: {
            value: 12,
            mask: 'vlan2_mask'
          },
          condition: 9
        },
        Level4_data: {
          model: function(value, mask) {
            var i, original_value;
            original_value = value;
            i = 0;
            while (i < mask.length) {
              if (mask[i] === '0') {
                value = value.replace_at(i, 'X');
              }
              i++;
            }
            value = Utilities.trim_masked_hex(value);
            value = Utilities.hex_pretty_print(value, 0)[0];
            mask = '';
            return [value, mask];
          },
          device: function(value, mask) {
            value = value.replace(/\s/g, '');
            if (value.length % 2) {
              value = value + 'X';
            }
            mask = value.replace(/[^X]/g, 'F');
            mask = mask.replace(/X/g, '0');
            value = value.replace(/X/g, '0');
            return [value, mask];
          },
          value: {
            type: 'text',
            device: Utilities.hex_string_to_number_array,
            model: Utilities.number_array_to_hex_string
          },
          mask: {
            model: Utilities.number_array_to_hex_string
          },
          filter: {
            value: 13,
            mask: 'l4_data_mask'
          },
          condition: 10
        }
      }
    };
    Enums.Mapper = {
      ethernet_protocol: {
        id: 0,
        condition: 17,
        rule_value: 'mapped_eth_type',
        filter: Enums.ACL_Filter.ethernet_protocol,
        mapped_value_bytes: 1
      },
      IP_address: {
        id: 1,
        source: {
          rule_value: 'mapped_src_ip',
          condition: 20,
          filter: Enums.ACL_Filter.source_IP_address
        },
        destination: {
          rule_value: 'mapped_dst_ip',
          condition: 19,
          filter: Enums.ACL_Filter.destination_IP_address
        },
        mapped_value_bytes: 1
      },
      IP_packet_length: {
        id: 2,
        condition: 18,
        rule_value: 'mapped_ip_length',
        mapped_value_bytes: 1
      },
      L4_destination: {
        id: 3,
        condition: 14,
        rule_value: 'mapped_l4_dst',
        filter: Enums.ACL_Filter.IP_protocol_destination,
        from: function(_) {
          return _.port_start;
        },
        to: function(_) {
          return _.port_end;
        },
        mapped_value_bytes: 2
      },
      L4_source: {
        id: 4,
        condition: 13,
        rule_value: 'mapped_l4_src',
        filter: Enums.ACL_Filter.IP_protocol_source,
        from: function(_) {
          return _.port_start;
        },
        to: function(_) {
          return _.port_end;
        },
        mapped_value_bytes: 2
      },
      MAC_address: {
        id: 5,
        source: {
          rule_value: 'mapped_src_mac',
          condition: 16,
          filter: Enums.ACL_Filter.source_MAC_address
        },
        destination: {
          rule_value: 'mapped_dst_mac',
          condition: 15,
          filter: Enums.ACL_Filter.destination_MAC_address
        },
        mapped_value_bytes: 1
      },
      IP_protocol: {
        id: 6,
        condition: 12,
        rule_value: 'mapped_protocol',
        filter: Enums.ACL_Filter.IP_protocol,
        mapped_value_bytes: 1
      },
      Device_port: {
        id: 7,
        condition: 11,
        rule_value: 'mapped_source_port',
        mapped_value_bytes: 1
      },
      VLAN: {
        id: 8,
        condition: 21,
        rule_value: 'mapped_vlan_id',
        filter: 'VLAN',
        mapped_value_bytes: 2
      }
    };
    return Enums;
  }]);

}).call(this);

(function() {
  app.factory('FileDB', ["api", function(api) {
    var FileDB, parse_path;
    parse_path = function(file) {
      var database;
      database = null;
      if (file.has('/')) {
        database = file.before('/');
        file = file.after('/');
      }
      return [database, file];
    };
    return FileDB = {
      save: function(path, data) {
        var database, file, ref;
        ref = parse_path(path), database = ref[0], file = ref[1];
        return api.call('filedb.save', {
          database: database,
          file: file + '.json',
          data: data
        });
      },
      load: function(path) {
        var database, file, ref;
        ref = parse_path(path), database = ref[0], file = ref[1];
        return api.call('filedb.load', {
          database: database,
          file: file + '.json'
        });
      },
      update: function(path, field, data) {
        return FileDB.load(path).then(function(result) {
          angular.extend(result[field], data);
          return FileDB.save(path, result);
        });
      }
    };
  }]);

}).call(this);

(function() {
  app.factory('Graph', ["$rootScope", "$timeout", "log", "translate", "Port", function($rootScope, $timeout, log, translate, Port) {
    var Graph;
    return Graph = {
      tsg: false,
      rule: false,
      summarize: false,
      data: [],
      ports: {},
      rollups: [
        {
          prefix: '10s.',
          title: translate('graph.time.minutes')
        }, {
          prefix: '1h.',
          title: translate('graph.time.hours')
        }, {
          prefix: '1d.1h.',
          title: translate('graph.time.days')
        }
      ],
      rule_graph_types: [
        {
          value_type: 'rate',
          title: translate('graph.value.type.rate'),
          units: translate('network.rate.Mbps'),
          formula: 'rx_speed / (1000 * 1000), -1 * tx_speed / (1000 * 1000)'
        }, {
          value_type: 'crc',
          title: translate('graph.value.type.crc')
        }, {
          value_type: 'drops',
          title: translate('graph.value.type.drops')
        }
      ],
      port_graph_types: [
        {
          value_type: 'rx/tx',
          title: translate('graph.value.type.rate'),
          units: translate('network.rate.Mbps'),
          formula: 'rx_speed / (1000 * 1000), -1 * tx_speed / (1000 * 1000)'
        }, {
          value_type: 'crc',
          title: translate('graph.value.type.crc')
        }, {
          value_type: 'drops',
          title: translate('graph.value.type.drops')
        }
      ],
      port_graph_type: 0,
      rule_graph_type: 0,
      options: {
        margin: {
          top: 20,
          right: 50,
          bottom: 30,
          left: 140
        }
      },
      rollup: 0,
      enable: true,
      show: false,
      for_rule: function(container, rule) {
        var color_domain, i, port_id, ref;
        Graph.rule = rule;
        Graph.ports = {};
        Graph.ports = {};
        for (port_id = i = 1, ref = Port.count; 1 <= ref ? i <= ref : i >= ref; port_id = 1 <= ref ? ++i : --i) {
          Graph.ports[port_id] = {
            show_in: !!(rule.inputs.filter(function(input) {
              return input.id === port_id;
            }).length),
            show_out: !!(rule.outputs.filter(function(output) {
              return output.id === port_id;
            }).length)
          };
        }
        Graph.show = true;
        Graph.summarize = false;
        Graph.tsg = null;
        Graph.tsg = new TSG(container, Graph.options);
        color_domain = Object.keys(Graph.ports).map(function(id) {
          return "port" + id;
        });
        color_domain.push('In');
        color_domain.push('Out');
        Graph.tsg.colorDomain = color_domain;
        return Graph.draw();
      },
      for_ports: function(container) {
        var i, port_id, ref;
        Graph.rule = false;
        Graph.summarize = false;
        Graph.enable = true;
        Graph.show = false;
        Graph.ports = {};
        for (port_id = i = 1, ref = Port.count; 1 <= ref ? i <= ref : i >= ref; port_id = 1 <= ref ? ++i : --i) {
          Graph.ports[port_id] = {
            show: false
          };
        }
        Graph.tsg = new TSG(container, Graph.options);
        return Graph.tsg.colorDomain = Object.keys(Graph.ports).map(function(id) {
          return "port" + id;
        });
      },
      draw: function(title) {
        var config, graph_type, port_id, port_ids, query, ref, rollup_prefix, value, value_type;
        Graph.tsg.clear();
        port_ids = [];
        ref = Graph.ports;
        for (port_id in ref) {
          value = ref[port_id];
          if (value.show || value.show_in || value.show_out) {
            port_ids.push(port_id);
          }
        }
        graph_type = Graph.rule ? Graph.rule_graph_types[Graph.rule_graph_type] : Graph.port_graph_types[Graph.port_graph_type];
        rollup_prefix = Graph.rollups[Graph.rollup].prefix;
        value_type = graph_type.formula ? graph_type.formula : graph_type.value_type;
        Graph.tsg.title = title || graph_type.units || ' ';
        config = $rootScope.configuration.InfluxDB;
        if (port_ids.is_empty()) {
          return Graph.tsg.clear();
        }
        query = "SELECT " + value_type + " from " + rollup_prefix + "port" + (port_ids.join(', ' + rollup_prefix + 'port')) + " LIMIT 500";
        return d3.json("/influxdb/db/" + config.database + "/series?u=" + config.users.read_only.username + "&p=" + config.users.read_only.password + "&q=" + (encodeURIComponent(query)), function(error, result) {
          var get_series_port_id, graphs, input, inputs, output, outputs, scroll_top, total_input, total_output;
          log.info('ports', port_ids, 'result', result);
          if (error) {
            log.error('Error querying InfluxDB', error);
            Graph.tsg.clear();
          } else {
            if (Graph.rule) {
              inputs = Graph.rule.inputs.filter(function(port) {
                return Graph.ports[port.id].show_in;
              });
              inputs = inputs.map(function(port) {
                return port.id;
              });
              outputs = Graph.rule.outputs.filter(function(port) {
                return Graph.ports[port.id].show_out;
              });
              outputs = outputs.map(function(port) {
                return port.id;
              });
              get_series_port_id = function(series) {
                return parseInt(series.name.replace(rollup_prefix, '').replace('port', ''));
              };
              input = result.filter(function(series) {
                var i, len, point, ref1;
                if (inputs.has(get_series_port_id(series)) && !outputs.has(get_series_port_id(series)) && graph_type.value_type === 'rate') {
                  ref1 = series.points;
                  for (i = 0, len = ref1.length; i < len; i++) {
                    point = ref1[i];
                    point.splice(series.columns.indexOf('expr1'), 1);
                  }
                  series.columns.splice(series.columns.indexOf('expr1'), 1);
                  return true;
                }
                return inputs.has(get_series_port_id(series));
              });
              output = result.filter(function(series) {
                var i, len, point, ref1;
                if (outputs.has(get_series_port_id(series)) && !inputs.has(get_series_port_id(series)) && graph_type.value_type === 'rate') {
                  ref1 = series.points;
                  for (i = 0, len = ref1.length; i < len; i++) {
                    point = ref1[i];
                    point.splice(series.columns.indexOf('expr0'), 1);
                  }
                  series.columns.splice(series.columns.indexOf('expr0'), 1);
                  return true;
                }
                return outputs.has(get_series_port_id(series));
              });
              if (Graph.summarize) {
                total_input = Graph.tsg.sumPoints(input, graph_type.value_type === 'rate' ? 'expr0' : graph_type.value_type);
                total_output = Graph.tsg.sumPoints(output, graph_type.value_type === 'rate' ? 'expr1' : graph_type.value_type);
                graphs = [];
                if (total_input) {
                  graphs.push({
                    name: 'In',
                    points: total_input
                  });
                }
                if (total_output) {
                  graphs.push({
                    name: 'Out',
                    points: total_output
                  });
                }
                Graph.tsg.bind(graphs);
              } else {
                Graph.tsg.bind(result);
              }
            } else {
              Graph.tsg.bind(result);
            }
          }
          scroll_top = (window.pageYOffset || document.scrollTop) - (document.clientTop || 0);
          if (Graph.rule && scroll_top > 500) {
            return window.scrollTo(0, 0);
          }
        });
      },
      refresh: function() {
        var element, timer;
        element = document.querySelector('.refresh i');
        element.className += ' spin';
        timer = $timeout(function() {
          return element.className = element.className.replace(/ spin/g, '');
        }, 500);
        return Graph.draw();
      }
    };
  }]);

}).call(this);

(function() {
  app.factory('GUI', ["$rootScope", "api", "Status", "translate", "Rule", "Port_view", function($rootScope, api, Status, translate, Rule, Port_view) {
    var GUI;
    return GUI = {
      wait_for_connection: function(estimated_time, message, options) {
        var check_interval, infinite, launch, should_have_already_been_up, should_have_already_been_up_timeout, test_connection, try_until_succeeded;
        if (estimated_time == null) {
          throw new Error('Define estimated time for progress bar');
        }
        infinite = estimated_time === 0;
        check_interval = 1;
        $rootScope.offline = true;
        $rootScope.waiting_for_connection_elapsed = 0;
        should_have_already_been_up_timeout = null;
        if (infinite) {
          $rootScope.waiting_for_connection_estimated = Infinity;
          $rootScope.waiting_for_connection_left = Infinity;
        } else {
          $rootScope.waiting_for_connection_estimated = estimated_time;
          $rootScope.waiting_for_connection_left = estimated_time;
          $rootScope.countdown = true;
          should_have_already_been_up = function() {
            $rootScope.countdown = false;
            return Status.busy(translate('device.status.connecting'), {
              sticky: true
            });
          };
          should_have_already_been_up_timeout = should_have_already_been_up.delay(estimated_time * 1000);
        }
        test_connection = function() {
          var command;
          command = (function() {
            switch (options.to) {
              case 'device':
                return 'getSwitchInfo';
              case 'gui':
                return 'utilities.ping';
            }
          })();
          return api.call(command).then(function() {
            if (!infinite) {
              clearTimeout(should_have_already_been_up_timeout);
            }
            Status.idle();
            $rootScope.countdown = false;
            $rootScope.offline = false;
            return location.reload();
          });
        };
        try_until_succeeded = function(action, period) {
          var tick, try_again;
          try_again = function(tried_at) {
            var failed_at;
            failed_at = new Date().getTime();
            return tick.delay(period - (failed_at - tried_at));
          };
          tick = function() {
            var tried_at;
            $rootScope.waiting_for_connection_elapsed += check_interval;
            if (!infinite) {
              $rootScope.waiting_for_connection_left -= check_interval;
              if ($rootScope.waiting_for_connection_left < 0) {
                $rootScope.waiting_for_connection_left = -1;
              }
            }
            tried_at = new Date().getTime();
            return action()["catch"](function() {
              return try_again(tried_at);
            });
          };
          return tick();
        };
        if (infinite) {
          Status.busy(message, {
            sticky: true
          });
        } else {
          Status.progress(message);
        }
        launch = function() {
          return try_until_succeeded(test_connection, check_interval * 1000);
        };
        launch.delay((options.delay || 1) * 1000);
        return new Promise(function(resolve, reject) {}).cancellable();
      },
      remove_port: function(elements) {
        var port_id, port_type;
        port_id = +angular.element(elements.dragged).attr('data-port-id');
        if (isNaN(port_id)) {
          return;
        }
        port_type = angular.element(elements.dragged).attr('data-port-type');
        return $rootScope.safeApply(function() {
          var rule;
          rule = Rule.remove_port(port_id, port_type);
          if (!rule) {
            return;
          }
          if ($rootScope.this_page.page === 'routing') {
            $rootScope.$broadcast('port_removed', {
              rule: rule
            });
          }
          return Port_view.deselect(port_id);
        });
      }
    };
  }]);

}).call(this);

(function() {
  app.factory('log', function() {
    var _console, buffer, key, log, value;
    _console = {
      info: console.log,
      warning: console.warn || console.log,
      error: console.error
    };
    if (console.log.bind) {
      for (key in _console) {
        value = _console[key];
        _console[key] = value.bind(console);
      }
    }
    buffer = {
      size: 5000,
      store: [],
      add: function(level, message) {
        if (buffer.store.length === buffer.size) {
          buffer.store.shift();
        }
        return buffer.store.push({
          level: level,
          message: message,
          date: new Date()
        });
      }
    };
    return log = {
      info: function() {
        var parameters;
        parameters = Array.prototype.slice.call(arguments);
        _console.info.apply(this, parameters);
        return buffer.add('info', log.message.apply(this, parameters));
      },
      debug: function() {
        var parameters;
        parameters = Array.prototype.slice.call(arguments);
        return _console.debug.apply(this, parameters);
      },
      warning: function() {
        var parameters;
        parameters = Array.prototype.slice.call(arguments);
        _console.warning.apply(this, parameters);
        return buffer.add('warning', log.message.apply(this, parameters));
      },
      error: function() {
        var parameters;
        parameters = Array.prototype.slice.call(arguments);
        _console.error.apply(this, parameters);
        return buffer.add('error', log.message.apply(this, parameters));
      },
      message: function() {
        var parameters;
        parameters = Array.prototype.slice.call(arguments);
        return parameters.map(function(argument) {
          if (typeof argument === 'object') {
            if (argument instanceof Error) {
              return argument.stack;
            }
            return JSON.stringify(argument, null, 2);
          }
          if (argument.toString) {
            return argument.toString();
          } else {
            return String(argument);
          }
        });
      },
      messages: function() {
        return buffer.store;
      },
      print_messages: function() {
        return log.messages().map(function(message) {
          var date, message_text, preamble, preamble_spacing, status;
          date = moment(message.date).format('MMMM Do YYYY, HH:mm:ss');
          status = (function() {
            switch (message.level) {
              case 'info':
                return '';
              default:
                return " [" + message.level + "]";
            }
          })();
          preamble = "" + date + status + " ";
          message_text = message.message.reduce((function(message, argument) {
            var last_new_line, spacing;
            if (message.not_empty()) {
              message += ' ';
            }
            last_new_line = message.lastIndexOf('\n');
            spacing = last_new_line >= 0 ? message.substring(last_new_line + 1) : message;
            argument = argument.replace(/\n/g, "\n" + (' '.repeat(spacing.length)));
            return message += argument;
          }), '');
          preamble_spacing = ' '.repeat(preamble.length);
          message_text = message_text.replace(/\n/g, "\n" + preamble_spacing);
          return "" + preamble + message_text;
        }).reduce(function(text, message) {
          if (text) {
            text += '\n';
          }
          return text + message;
        });
      },
      download: function() {
        return download_file(log.print_messages(), 'log.txt');
      }
    };
  });

}).call(this);

(function() {
  app.factory('Login', ["$rootScope", "$location", "$routeParams", "$filter", "$window", "$timeout", "api", "log", "Status", "Routing_model_applier", function($rootScope, $location, $routeParams, $filter, $window, $timeout, api, log, Status, Routing_model_applier) {
    var Login;
    return Login = {
      is_authenticated: null,
      validate: function(form) {
        var field, fields, i, len;
        fields = ['password'];
        for (i = 0, len = fields.length; i < len; i++) {
          field = fields[i];
          if (form[field].$invalid) {
            form.indicate_invalid(field);
          }
        }
        return !form.$invalid;
      },
      login: function(form) {
        var credentials;
        if (!Login.validate(form)) {
          return;
        }
        credentials = {
          username: 'admin',
          password: form.password.$modelValue
        };
        return api.call('auth.login', credentials).then(function(user) {
          form.password.$setViewValue('');
          form.password.$render();
          $rootScope.safeApply(function() {
            Login.authenticated();
            Routing_model_applier.set_interface_version(api);
            return $rootScope.user = user;
          });
          $.stickyeah();
          if (!$rootScope.state.is_application_loaded) {
            return $rootScope.initialize_application();
          } else if ($rootScope.loading_page) {
            return $rootScope.initialize_page();
          }
        }, function(error) {
          log.error(error);
          if (error instanceof api.error.generic && error.code === 403) {
            form.errors = form.errors || {};
            form.errors.wrong_credentials = true;
            return form.indicate_invalid('password');
          }
        });
      },
      logout: function() {
        return api.call('auth.logout', {}).then(function() {
          return $rootScope.safeApply(function() {
            return Login.not_authenticated();
          });
        });
      },
      authenticate: function() {
        return api.call('auth.auth').then(function(user) {
          Login.authenticated();
          return user;
        });
      },
      authenticated: function() {
        Status.place();
        return Login.is_authenticated = true;
      },
      not_authenticated: function() {
        Status.place('login');
        return Login.is_authenticated = false;
      }
    };
  }]);

}).call(this);

(function() {
  app.factory('Model_service', ["Device_settings", function(Device_settings) {
    var Model_service;
    return Model_service = {
      get_port_id_with_offset: function(port_id) {
        var port_id_with_offset;
        port_id_with_offset = (function() {
          switch (Device_settings.get_platform()) {
            case Device_settings.devices.iz1:
              return port_id - 1;
            case Device_settings.devices.iz1f:
            case Device_settings.devices.unknown:
              return port_id - (port_id % 2 === 0 ? 2 : 0);
          }
        })();
        return port_id_with_offset;
      },
      get_joint_port_with_offset: function(Model, port_id) {
        return Model.joint_ports[Model_service.get_port_id_with_offset(port_id)];
      },
      get_port_with_offset: function(Model, port_id) {
        return Model.ports[Model_service.get_port_id_with_offset(port_id)];
      },
      update: function(Model, model) {
        return angular.extend(Model, model);
      },
      reset: function(model) {
        return Model_service.update(Model, Model_service.create());
      },
      ports_lock: [],
      is_ports_lock_empty: function() {
        return Model_service.ports_lock.length === 0;
      },
      lock_ports: function() {
        var lock;
        lock = new Object();
        Model_service.ports_lock.push(lock);
        return lock;
      },
      unlock_ports: function(lock) {
        if (!Model_service.ports_lock.has(lock)) {
          throw new Error('Port lock not found');
        }
        return Model_service.ports_lock.remove(lock);
      },
      ensure_ports_lock: function() {
        if (Model_service.ports_lock.is_empty()) {
          throw new Error('Model ports must be locked when calling this method');
        }
      },
      do_with_port_lock: function(action) {
        var lock, result;
        lock = Model_service.lock_ports();
        result = action();
        if ((result != null) && result["finally"]) {
          return result["finally"](function() {
            return Model_service.unlock_ports(lock);
          });
        } else {
          Model_service.unlock_ports(lock);
          return dummy_promise();
        }
      }
    };
  }]);

}).call(this);

(function() {
  app.factory('Model', ["Model_service", function(Model_service) {
    var Model;
    return Model = {};
  }]);

}).call(this);

(function() {
  app.factory('Network', ["Model", "api", function(Model, api) {
    var Network;
    return Network = {
      save: function() {
        var network;
        network = angular.copy(Model.network);
        network.dhcp = network.dhcp === true ? '1' : '0';
        return api.call('setNetConfig', network);
      },
      load: function() {
        return api.call('getNetConfig').then(function(result) {
          return Model.network = {
            dhcp: result.dhcp === '1' ? true : false,
            ip: result.ip,
            mask: result.mask,
            gateway: result.gateway,
            dns1: result.dns1 || '',
            dns2: result.dns2 || ''
          };
        });
      }
    };
  }]);

}).call(this);

(function() {
  app.factory('Port_numeration', ["$rootScope", "api", "Model", "Model_service", "Device_settings", "Port", function($rootScope, api, Model, Model_service, Device_settings, Port) {
    var Port_numeration;
    return Port_numeration = {
      joint_port_client_number: function(joint_port_id) {
        return Device_settings.generic_port_count + joint_port_id;
      },
      port_id_from_client_number: function(client_number) {
        return Device_settings.generic_port_count + (client_number - Device_settings.generic_port_count - 1) * Device_settings.ports_in_joint_port + 1;
      },
      by_name: function(name) {
        return Port.by_id(Port_numeration.id_by_name(name));
      },
      id_by_name: function(name) {
        var id, main, parts, port, port_id, subport;
        parts = name.match(/(\d+)(\.(\d+))?/);
        main = parseInt(parts[1]);
        subport = parts[3] ? parseInt(parts[3]) : null;
        port_id = Port_numeration.port_id_from_client_number(main);
        port = Port_numeration.categorize_port(port_id);
        return id = (function() {
          if (subport) {
            if (port.type === 'generic') {
              throw new Error("Port " + main + " is not a part of joint port");
            }
            if (port.joint_port.mode !== '4x10G') {
              throw new Error("Joint port " + port.joint_port.id + " isn't in 4x10G mode");
            }
            return Port_numeration.joined_port_id_to_port_id(port.joint_port.id, subport);
          } else {
            if (port.type === 'generic') {
              return main;
            } else {
              if (port.joint_port.mode !== '40G') {
                throw new Error("Joint port " + port.joint_port.id + " isn't in 40G mode");
              }
              return Port_numeration.joined_port_id_to_port_id(port.joint_port.id);
            }
          }
        })();
      },
      name_by_id: function(port_id) {
        var joint_port_id, ref, subport_id;
        if (Port.is_generic(port_id)) {
          return String(port_id);
        }
        ref = Port_numeration.joined_port_id_from_port_id(port_id), joint_port_id = ref[0], subport_id = ref[1];
        if (Model_service.get_joint_port_with_offset(Model, joint_port_id).mode === '40G' && subport_id === 1) {
          return String(Port_numeration.joint_port_client_number(joint_port_id));
        }
        return (Port_numeration.joint_port_client_number(joint_port_id)) + "." + subport_id;
      },
      joined_port_id_from_port_id: function(port_id) {
        var joint_port_id;
        if (port_id > Port.count) {
          throw new Error("Port " + port_id + " is out of bounds");
        }
        if (port_id <= Device_settings.generic_port_count) {
          throw new Error("Port " + port_id + " isn't a part of a joint port");
        }
        port_id -= Device_settings.generic_port_count;
        joint_port_id = 1;
        while (port_id > Device_settings.ports_in_joint_port) {
          port_id -= Device_settings.ports_in_joint_port;
          joint_port_id++;
        }
        return [joint_port_id, port_id];
      },
      joined_port_id_to_port_id: function(joint_port_id, subport_id) {
        if (joint_port_id < 0 || joint_port_id > Port.joint_port_count()) {
          throw new Error("Invalid joint port id " + joint_port_id);
        }
        if (subport_id > Device_settings.ports_in_joint_port) {
          throw new Error("Invalid subport id " + subport_id);
        }
        if (subport_id == null) {
          subport_id = 1;
        }
        return Device_settings.generic_port_count + (joint_port_id - 1) * Device_settings.ports_in_joint_port + subport_id;
      },
      categorize_port: function(port_id) {
        var joint_port_id, ref;
        if (Port.is_generic(port_id)) {
          return {
            type: 'generic'
          };
        }
        ref = Port_numeration.joined_port_id_from_port_id(port_id), joint_port_id = ref[0], port_id = ref[1];
        return {
          type: 'joinable',
          joint_port: Model_service.get_joint_port_with_offset(Model, joint_port_id),
          is_first_in_joint: port_id === 1
        };
      }
    };
  }]);

}).call(this);

(function() {
  app.factory('Port_view', ["$rootScope", "api", "Model", "Model_service", "Device_settings", function($rootScope, api, Model, Model_service, Device_settings) {
    var Port_view;
    return Port_view = {
      select: function(port_id, discard_selection) {
        if (typeof port_id === 'object') {
          port_id = port_id.id;
        }
        if (discard_selection !== false) {
          Port_view.deselect_all();
        }
        return Object.set($rootScope.view.ports, port_id, 'selected', true);
      },
      deselect: function(port_id) {
        if (typeof port_id === 'object') {
          port_id = port_id.id;
        }
        return Object.set($rootScope.view.ports, port_id, 'selected', false);
      },
      toggle_selection: function(port) {
        if (!this.is_selected(port)) {
          return this.select(port, false);
        } else {
          return this.deselect(port);
        }
      },
      is_selected: function(port) {
        return Object.get($rootScope.view.ports, port.id, 'selected');
      },
      deselect_all: function() {
        var i, len, port, ref, results;
        if (!Model.ports) {
          return;
        }
        ref = Model.ports;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          port = ref[i];
          results.push(Object.set($rootScope.view.ports, port.id, 'selected', false));
        }
        return results;
      },
      selected_count: function() {
        var count, i, len, port, ref;
        count = 0;
        ref = Model.ports;
        for (i = 0, len = ref.length; i < len; i++) {
          port = ref[i];
          if (Port_view.is_selected(port)) {
            count++;
          }
        }
        return count;
      },
      is_joint_port_up: function(joint_port) {
        var port;
        return ((function() {
          var i, len, ref, results;
          ref = joint_port.ports;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            port = ref[i];
            if (Port_view.is_up(port)) {
              results.push(port);
            }
          }
          return results;
        })()).not_empty();
      },
      is_up: function(port) {
        return $rootScope.stats.ports[port.id].state;
      }
    };
  }]);

}).call(this);

(function() {
  var injected;

  injected = ['$rootScope', 'api', 'Model', 'Model_service', 'Device_settings', 'Enums'];

  this.Port_service_constructor = function($rootScope, api, Model, Model_service, Device_settings, Enums) {
    var Port;
    return Port = {
      count: 0,
      by_id: function(id) {
        if (id > Model.ports.length) {
          throw new Error("Port " + id + " not found");
        }
        return Model.ports[id - 1];
      },
      set_eth_mode: function(port) {
        Model_service.ensure_ports_lock();
        return api.call("setPortEthMode", {
          id: port.id,
          eth_mode: port.eth_mode
        }).then(function(result) {});
      },
      set_parser_level: function(port) {
        Model_service.ensure_ports_lock();
        return api.call("setPortParserLevel", {
          id: port.id,
          level: port.parser_level
        }).then(function(result) {});
      },
      set_deep_inspection: function(port) {
        Model_service.ensure_ports_lock();
        return api.call("setPortDIParsing", {
          id: port.id,
          enable: port.deep_inspection
        });
      },
      enable: function(port) {
        Model_service.ensure_ports_lock();
        return Port.set_enabled({
          id: port.id,
          enabled: true
        }).then(function(result) {
          return port.enabled = true;
        });
      },
      disable: function(port) {
        Model_service.ensure_ports_lock();
        return Port.set_enabled({
          id: port.id,
          enabled: false
        }).then(function(result) {
          return port.enabled = false;
        });
      },
      set_enabled: function(port) {
        Model_service.ensure_ports_lock();
        return api.call("setPortEnabled", {
          id: port.id,
          enable: port.enabled ? 1 : 0
        });
      },
      set_mac_learning: function(port) {
        Model_service.ensure_ports_lock();
        return api.call("setPortLearning", {
          id: port.id,
          enable: 0
        }).then(function(result) {});
      },
      set_force_up_simple: function(port) {
        Model_service.ensure_ports_lock();
        return api.call("setPortForceUp", {
          id: port.id,
          enable: port.force_up ? 1 : 0
        });
      },
      set_force_up: function(port) {
        api.begin();
        Port.set_force_up_simple(port);
        if (port.enabled == null) {
          throw new Error('setPortForceUp called without known port enabled/disabled state');
        }
        Port.set_enabled(port);
        return api.end();
      },
      set_loopback: function(port) {
        Model_service.ensure_ports_lock();
        return api.call("setPortLoopback", {
          id: port.id,
          enable: port.loopback ? 1 : 0
        });
      },
      reset_port_stats: function(port) {
        return api.call("resetPortStat", {
          id: port.id
        });
      },
      reset_stats: function(port) {
        var i, len, ref;
        if (port != null) {
          return Port.reset_port_stats(port);
        }
        api.begin();
        ref = Model.ports;
        for (i = 0, len = ref.length; i < len; i++) {
          port = ref[i];
          Port.reset_port_stats(port);
        }
        return api.end();
      },
      update: function(data) {
        var device_port;
        device_port = Port.by_id(data.id);
        return angular.extend(device_port, data);
      },
      configure: function(port) {
        if (port.enabled != null) {
          Port.set_enabled(port);
        }
        if (port.eth_mode != null) {
          Port.set_eth_mode(port);
        }
        Port.set_mac_learning(port);
        if (port.parser_level != null) {
          Port.set_parser_level(port);
        }
        if (port.deep_inspection != null) {
          Port.set_deep_inspection(port);
        }
        if (port.loopback != null) {
          Port.set_loopback(port);
        }
        if (port.force_up != null) {
          Port.set_force_up_simple(port);
          return Port.set_enabled(port);
        }
      },
      is_generic: function(port_id) {
        return port_id <= Device_settings.generic_port_count;
      },
      has_joint_ports: function() {
        return Port.count > Device_settings.generic_port_count;
      },
      joint_port_count: function() {
        return Math.ceil((Port.count - Device_settings.generic_port_count) / Device_settings.ports_in_joint_port);
      },
      sanitize: function(port) {
        var key, value;
        for (key in port) {
          value = port[key];
          if (key.starts_with('$$')) {
            delete port[key];
          }
        }
        return port;
      },
      set_subport_modes: function(joint_port) {
        var i, len, ref, results, subport;
        ref = joint_port.ports;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          subport = ref[i];
          results.push(subport.eth_mode = joint_port.mode === '40G' ? subport === joint_port.ports[0] ? Enums.ethernet_port_modes['40GBASE_SR4'] : Enums.ethernet_port_modes['DISABLED'] : Enums.ethernet_port_modes['10GBASE_CR']);
        }
        return results;
      },
      load_comments: function() {
        return filedb.load('ports').then(function(result) {
          return result.comments;
        });
      },
      set_comment: function(port) {
        var data;
        data = [];
        data[port.id] = port.comment;
        return filedb.update('ports', 'comments', data);
      }
    };
  };

  this.Port_service_constructor.$inject = injected;

  app.factory('Port', this.Port_service_constructor);

}).call(this);

(function() {
  app.factory('Promises', ["$rootScope", "log", function($rootScope, log) {
    var Promises, done_listeners;
    done_listeners = [];
    return Promises = {
      promise: function(promiser) {
        var promise;
        promise = dummy_promise().then(promiser);
        $rootScope.promises.push(promise);
        return promise["catch"](Promises.Cancellation_error, function(error) {
          return log.info('A promise was cancelled due to user navigating away from the page');
        })["finally"](function() {
          $rootScope.promises.remove(promise);
          return Promises.check_for_pending_promises();
        });
      },
      Cancellation_error: Promise_cancellation_error,
      reset: function() {
        return $rootScope.promises = [];
      },
      pending: function() {
        return $rootScope.promises.not_empty();
      },
      cancel: function() {
        var i, len, promise, ref, results;
        ref = $rootScope.promises;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          promise = ref[i];
          log.info('Cancelling promise');
          results.push(promise.cancel(new Promises.Cancellation_error()));
        }
        return results;
      },
      is_navigating_away: function(error) {
        return error instanceof Promises.Cancellation_error;
      },
      not_navigating_away: function(error) {
        return !Promises.is_navigating_away(error);
      },
      check_for_pending_promises: function() {
        var i, len, listener;
        if (Promises.pending()) {
          return;
        }
        for (i = 0, len = done_listeners.length; i < len; i++) {
          listener = done_listeners[i];
          listener();
        }
        return done_listeners = [];
      },
      when_done: function(listener) {
        return done_listeners.push(listener);
      },
      wait: function() {
        return done_listeners = [];
      }
    };
  }]);

}).call(this);

(function() {
  app.factory('Routing_model_applier', ["$injector", "api", "log", "Port", "Rule", "Device_routing", "Model", "Model_service", "Device_settings", "Enums", function($injector, api, log, Port, Rule, Device_routing, Model, Model_service, Device_settings, Enums) {
    var Routing_model_applier, _extract_ports, _set_rules_config, _set_up_rules, api_stub, save_configuration_batch, set_joint_ports_subports_eth_modes, set_up_rules, update_ports, validate_joint_port_routing;
    api_stub = function() {
      var request_json, stub;
      request_json = api.request_json.bind(api);
      return stub = {
        batch: [],
        begin: function() {},
        end: function() {
          return dummy_promise(this.batch);
        },
        call: function(method, parameters) {
          this.batch.push(request_json(method, parameters));
          return dummy_promise(true);
        }
      };
    };
    set_joint_ports_subports_eth_modes = function(joint_ports) {
      var i, joint_port, len, port, results;
      results = [];
      for (i = 0, len = joint_ports.length; i < len; i++) {
        joint_port = joint_ports[i];
        if (joint_port.mode === '40G') {
          results.push((function() {
            var j, len1, ref, results1;
            ref = joint_port.ports;
            results1 = [];
            for (j = 0, len1 = ref.length; j < len1; j++) {
              port = ref[j];
              results1.push(port.eth_mode = port === joint_port.ports[0] ? Enums.ethernet_port_modes['40GBASE_SR4'] : Enums.ethernet_port_modes.DISABLED);
            }
            return results1;
          })());
        }
      }
      return results;
    };
    _extract_ports = function(rules) {
      var i, j, k, len, len1, len2, port, ports, ref, ref1, rule;
      ports = {
        all: []
      };
      for (i = 0, len = rules.length; i < len; i++) {
        rule = rules[i];
        ref = rule.inputs;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          port = ref[j];
          if (!ports.all.has(port.id)) {
            ports.all.push(port.id);
          }
        }
        ref1 = rule.outputs;
        for (k = 0, len2 = ref1.length; k < len2; k++) {
          port = ref1[k];
          if (!ports.all.has(port.id)) {
            ports.all.push(port.id);
          }
        }
      }
      ports.all.sort(function(a, b) {
        return a - b;
      });
      return ports;
    };
    validate_joint_port_routing = function(joint_ports, routed_ports) {
      var i, joint_port, len, port, results;
      results = [];
      for (i = 0, len = joint_ports.length; i < len; i++) {
        joint_port = joint_ports[i];
        if (joint_port.mode === '40G') {
          results.push((function() {
            var j, len1, ref, results1;
            ref = joint_port.ports;
            results1 = [];
            for (j = 0, len1 = ref.length; j < len1; j++) {
              port = ref[j];
              if (port !== joint_port.ports[0]) {
                if (routed_ports.all.has(port.id)) {
                  throw new Error("Joint port " + joint_port.id + " is set to 40G mode, but port " + port.id + " is being used in rules");
                } else {
                  results1.push(void 0);
                }
              }
            }
            return results1;
          })());
        }
      }
      return results;
    };
    update_ports = function(rules, ports, joint_ports) {
      var i, len, port, routed_ports;
      routed_ports = _extract_ports(rules);
      validate_joint_port_routing(joint_ports, routed_ports);
      api.begin();
      for (i = 0, len = ports.length; i < len; i++) {
        port = ports[i];
        if (routed_ports.all.has(port.id)) {
          port.enabled = true;
          Port.configure(port);
        }
      }
      return api.end();
    };
    save_configuration_batch = function(batch) {
      return api.call('saveConfig', {
        config: JSON.stringify(batch)
      });
    };
    set_up_rules = function(rules, ports, joint_ports, options) {
      return dummy_promise().then(function() {
        options = options || {};
        Model_service.ensure_ports_lock();
        return (function(api, Port) {
          if (options.offline_batch) {
            api = api_stub();
            Port = $injector.invoke(Port_service_constructor, this, {
              api: api
            });
          }
          api.begin();
          Routing_model_applier.set_interface_version(api);
          _set_up_rules(rules, ports, joint_ports, options, api, Port);
          return api.end();
        })(api, Port);
      });
    };
    _set_rules_config = function(api, rules) {
      rules = Device_routing.convert_to_device_rules(rules);
      return api.call('setRulesList', {
        rules: rules
      });
    };
    _set_up_rules = function(rules, ports, joint_ports, options, api, Port) {
      var i, len, port;
      set_joint_ports_subports_eth_modes(joint_ports);
      for (i = 0, len = ports.length; i < len; i++) {
        port = ports[i];
        Port.configure(port);
      }
      return _set_rules_config(api, rules);
    };
    return Routing_model_applier = {
      save_configuration: function(rules, ports, joint_ports) {
        return Routing_model_applier.generate_configuration_batch(rules, ports, joint_ports).then(function(batch) {
          return save_configuration_batch(batch);
        });
      },
      generate_configuration_batch: function(rules, ports, joint_ports) {
        var i, joint_port, joint_ports_copy, len, ports_copy;
        ports_copy = angular.copy(ports);
        joint_ports_copy = angular.copy(joint_ports);
        for (i = 0, len = joint_ports_copy.length; i < len; i++) {
          joint_port = joint_ports_copy[i];
          joint_port.ports = joint_port.ports.map(function(original_port) {
            return ports_copy.filter(function(port) {
              return port.id === original_port.id;
            })[0];
          });
        }
        return set_up_rules(rules, ports_copy, joint_ports_copy, {
          offline_batch: true
        });
      },
      set_interface_version: function(api, version) {
        return api.call('setInterfaceVersion', {
          ver: version || Device_settings.interface_version
        });
      },
      set_up_routing: function(rules, ports, joint_ports) {
        return update_ports(rules, ports, joint_ports).then(function() {
          return Routing_model_applier.generate_configuration_batch(rules, ports, joint_ports);
        }).bind({}).then(function(batch) {
          return this.batch = batch;
        }).then(function() {
          return save_configuration_batch(this.batch);
        }).then(function() {
          return _set_rules_config(api, rules);
        });
      }
    };
  }]);

}).call(this);

(function() {
  app.factory('Routing_model_errors', ["translate", "Device_settings", function(translate, Device_settings) {
    var Routing_model_errors;
    return Routing_model_errors = {
      Maximum_number_of_mapper_values_exceeded: custom_error('Maximum_number_of_mapper_values_exceeded'),
      Maximum_number_of_mirroring_groups_exceeded: custom_error('Maximum_number_of_mirroring_groups_exceeded'),
      Maximum_number_of_access_control_lists_exceeded: custom_error('Maximum_number_of_access_control_lists_exceeded'),
      is: function(error) {
        var error_class, name;
        for (name in Routing_model_errors) {
          error_class = Routing_model_errors[name];
          if (error_class.is_custom_error) {
            if (error instanceof error_class) {
              return true;
            }
          }
        }
      },
      message: function(error) {
        if (error instanceof Routing_model_errors.Maximum_number_of_mapper_values_exceeded) {
          return translate('configuration.error.too_many_intervals_in_filters');
        }
        if (error instanceof Routing_model_errors.Maximum_number_of_mirroring_groups_exceeded) {
          return translate('configuration.error.max_mirroring_ports', {
            max: Device_settings.max_mirror_groups
          });
        }
        if (error instanceof Routing_model_errors.Maximum_number_of_access_control_lists_exceeded) {
          return translate('configuration.error.max_acls', {
            max: Device_settings.max_acls
          });
        }
      }
    };
  }]);

}).call(this);

(function() {
  app.factory('Rule', ["$rootScope", "api", "Port", "Device_routing", function($rootScope, api, Port, Device_routing) {
    var Rule;
    return Rule = {
      current: function(rule) {
        if (rule == null) {
          return $rootScope.current_rule;
        }
        return $rootScope.current_rule = rule;
      },
      copy: function(rule) {
        var copy, i, j, len, len1, port, ref, ref1;
        copy = angular.copy(rule);
        copy.inputs = [];
        ref = rule.inputs;
        for (i = 0, len = ref.length; i < len; i++) {
          port = ref[i];
          copy.inputs.push(port);
        }
        copy.outputs = [];
        ref1 = rule.outputs;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          port = ref1[j];
          copy.outputs.push(port);
        }
        return copy;
      },
      sanitize: function(rule) {
        var filter, i, len, ref;
        delete rule.$$hashKey;
        ref = rule.filters;
        for (i = 0, len = ref.length; i < len; i++) {
          filter = ref[i];
          delete filter.$$show_mask;
          delete filter.$$interval;
        }
        return rule.filters = (function() {
          var j, len1, ref1, results;
          ref1 = rule.filters;
          results = [];
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            filter = ref1[j];
            if (!Device_routing.Filter.is_empty(filter)) {
              results.push(filter);
            }
          }
          return results;
        })();
      },
      serialize: function(rule) {
        var port;
        rule = angular.copy(rule);
        rule.inputs = (function() {
          var i, len, ref, results;
          ref = rule.inputs;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            port = ref[i];
            results.push(port.id);
          }
          return results;
        })();
        rule.outputs = (function() {
          var i, len, ref, results;
          ref = rule.outputs;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            port = ref[i];
            results.push(port.id);
          }
          return results;
        })();
        Rule.sanitize(rule);
        return rule;
      },
      deserialize: function(rule) {
        var port_id;
        rule = angular.copy(rule);
        rule.inputs = (function() {
          var i, len, ref, results;
          ref = rule.inputs;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            port_id = ref[i];
            results.push(Port.by_id(port_id));
          }
          return results;
        })();
        rule.outputs = (function() {
          var i, len, ref, results;
          ref = rule.outputs;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            port_id = ref[i];
            results.push(Port.by_id(port_id));
          }
          return results;
        })();
        return rule;
      },
      merge: function(rules, start_from) {
        var groupable_port, groupable_ports, i, index, input, input_ports_are_found_in_between, intermediate_rule, intermediate_rules, j, joint_inputs, k, l, len, len1, len2, len3, len4, len5, len6, m, n, o, p, q, ref, ref1, ref2, ref3, ref4, ref5, rule, rule_copy, subsequent, subsequent_rule, subsequent_rule_copy;
        if (rules.is_empty()) {
          return [];
        }
        if (start_from == null) {
          start_from = 1;
        }
        for (index = i = ref = start_from, ref1 = rules.length; ref <= ref1 ? i <= ref1 : i >= ref1; index = ref <= ref1 ? ++i : --i) {
          rule = rules[index - 1];
          intermediate_rules = [];
          for (subsequent = j = ref2 = index, ref3 = rules.length; ref2 <= ref3 ? j <= ref3 : j >= ref3; subsequent = ref2 <= ref3 ? ++j : --j) {
            if (subsequent === index) {
              continue;
            }
            subsequent_rule = rules[subsequent - 1];
            intermediate_rules.push(subsequent_rule);
            if (angular.equals(rule, subsequent_rule)) {
              rules.remove_at(subsequent - 1);
              if (index > rules.length) {
                return rules;
              }
              return Rule.merge(rules, index);
            }
            if (rule.inputs.intersect(subsequent_rule.inputs).is_empty()) {
              rule_copy = angular.copy(rule);
              subsequent_rule_copy = angular.copy(subsequent_rule);
              delete rule_copy.inputs;
              delete subsequent_rule_copy.inputs;
              if (angular.equals(rule_copy, subsequent_rule_copy)) {
                groupable_ports = angular.copy(subsequent_rule.inputs);
                for (k = 0, len = intermediate_rules.length; k < len; k++) {
                  intermediate_rule = intermediate_rules[k];
                  if (intermediate_rule === subsequent_rule) {
                    continue;
                  }
                  ref4 = angular.copy(groupable_ports);
                  for (l = 0, len1 = ref4.length; l < len1; l++) {
                    groupable_port = ref4[l];
                    if (intermediate_rule.inputs.has(groupable_port) || intermediate_rule.outputs.has(groupable_port)) {
                      groupable_ports.remove(groupable_port);
                    }
                  }
                }
                if (groupable_ports.not_empty()) {
                  for (m = 0, len2 = groupable_ports.length; m < len2; m++) {
                    groupable_port = groupable_ports[m];
                    rule.inputs.push(groupable_port);
                    subsequent_rule.inputs.remove(groupable_port);
                  }
                  rule.inputs.sort(function(a, b) {
                    return a - b;
                  });
                  if (subsequent_rule.inputs.is_empty()) {
                    rules.remove_at(subsequent - 1);
                  }
                  if (index > rules.length) {
                    return rules;
                  }
                  return Rule.merge(rules, index);
                }
              }
            }
            if (rule.action === 'mirror' && subsequent_rule.action === 'mirror') {
              if (angular.equals(rule.outputs, subsequent_rule.outputs)) {
                rule_copy = angular.copy(rule);
                subsequent_rule_copy = angular.copy(subsequent_rule);
                delete rule_copy.inputs;
                delete subsequent_rule_copy.inputs;
                if (angular.equals(rule_copy, subsequent_rule_copy)) {
                  input_ports_are_found_in_between = false;
                  joint_inputs = angular.copy(rule.inputs);
                  ref5 = subsequent_rule.inputs;
                  for (n = 0, len3 = ref5.length; n < len3; n++) {
                    input = ref5[n];
                    if (!joint_inputs.has(input)) {
                      joint_inputs.push(input);
                    }
                  }
                  for (o = 0, len4 = intermediate_rules.length; o < len4; o++) {
                    intermediate_rule = intermediate_rules[o];
                    if (intermediate_rule === subsequent_rule) {
                      continue;
                    }
                    if (intermediate_rule.inputs.intersect(joint_inputs).not_empty() || intermediate_rule.outputs.intersect(joint_inputs).not_empty()) {
                      input_ports_are_found_in_between = true;
                      break;
                    }
                  }
                  if (!input_ports_are_found_in_between) {
                    rule.inputs = joint_inputs;
                    rule.inputs.sort(function(a, b) {
                      return a - b;
                    });
                    rules.remove_at(subsequent - 1);
                    if (index > rules.length) {
                      return rules;
                    }
                    return Rule.merge(rules, index);
                  }
                }
              }
            }
            if (rule.action === 'mirror' && subsequent_rule.action !== 'mirror') {
              rule_copy = angular.copy(rule);
              subsequent_rule_copy = angular.copy(subsequent_rule);
              delete rule_copy.outputs;
              delete subsequent_rule_copy.outputs;
              delete rule_copy.action;
              delete subsequent_rule_copy.action;
              delete subsequent_rule_copy.hashing_profile;
              if (angular.equals(rule_copy, subsequent_rule_copy)) {
                input_ports_are_found_in_between = false;
                for (p = 0, len5 = intermediate_rules.length; p < len5; p++) {
                  intermediate_rule = intermediate_rules[p];
                  if (intermediate_rule === subsequent_rule) {
                    continue;
                  }
                  if (intermediate_rule.inputs.intersect(rule.inputs).not_empty() || intermediate_rule.outputs.intersect(rule.inputs).not_empty()) {
                    input_ports_are_found_in_between = true;
                    break;
                  }
                }
                if (!input_ports_are_found_in_between) {
                  rule.mirror_to = rule.outputs;
                  rule.mirror_to.sort(function(a, b) {
                    return a - b;
                  });
                  angular.extend(rule, subsequent_rule);
                  rules.remove_at(subsequent - 1);
                  if (index > rules.length) {
                    return rules;
                  }
                  return Rule.merge(rules, index);
                }
              }
            }
            if (rule.action === 'mirror' && subsequent_rule.action === 'mirror') {
              if (rule.outputs.intersect(subsequent_rule.outputs).is_empty()) {
                rule_copy = angular.copy(rule);
                subsequent_rule_copy = angular.copy(subsequent_rule);
                delete rule_copy.outputs;
                delete subsequent_rule_copy.outputs;
                if (angular.equals(rule_copy, subsequent_rule_copy)) {
                  input_ports_are_found_in_between = false;
                  for (q = 0, len6 = intermediate_rules.length; q < len6; q++) {
                    intermediate_rule = intermediate_rules[q];
                    if (intermediate_rule === subsequent_rule) {
                      continue;
                    }
                    if (intermediate_rule.inputs.intersect(rule.inputs).not_empty() || intermediate_rule.outputs.intersect(rule.inputs).not_empty()) {
                      input_ports_are_found_in_between = true;
                      break;
                    }
                  }
                  if (!input_ports_are_found_in_between) {
                    rule.outputs = rule.outputs.concat(subsequent_rule.outputs);
                    rules.remove_at(subsequent - 1);
                    if (index > rules.length) {
                      return rules;
                    }
                    return Rule.merge(rules, index);
                  }
                }
              }
            }
          }
        }
        return rules;
      },
      remove_port: function(port_id, port_type) {
        var port, rule;
        port = Port.by_id(port_id);
        rule = Rule.current();
        if (!rule) {
          return;
        }
        Rule.current(false);
        switch (port_type) {
          case 'input':
            rule.inputs.remove(port);
            Object.set($rootScope.view.ports, port.id, 'selectedIn', false);
            break;
          case 'output':
            rule.outputs.remove(port);
            Object.set($rootScope.view.ports, port.id, 'selectedOut', false);
            break;
          default:
            throw new Error("Unknown data-port-type: " + port_type);
        }
        return rule;
      }
    };
  }]);

}).call(this);

(function() {
  app.factory('Status', ["$rootScope", "translate", function($rootScope, translate) {
    var Status;
    return Status = {
      statuses: {
        busy: 'busy',
        progress: 'progress',
        idle: 'idle'
      },
      set: function(status, message, options) {
        var current_status_data, id, status_data;
        status_data = Status.status_data(status, message, options);
        if ($rootScope.status) {
          current_status_data = angular.copy($rootScope.status);
          delete current_status_data.id;
          if (angular.equals(status_data, current_status_data)) {
            return;
          }
        }
        id = $rootScope.status ? $rootScope.status.id + 1 : 1;
        return $rootScope.safeApply(function() {
          return $rootScope.status = angular.extend(status_data, {
            id: id
          });
        });
      },
      status_data: function(status, message, options) {
        var status_data;
        return status_data = {
          code: status,
          message: message || '',
          sticky: options && options.sticky
        };
      },
      busy: function(message) {
        return this.set(this.statuses.busy, message, {
          sticky: true
        });
      },
      not_busy: function() {
        if (!$rootScope.status) {
          return;
        }
        if ($rootScope.status.code === this.statuses.busy) {
          return Status.idle();
        }
      },
      progress: function(message) {
        return this.set(this.statuses.progress, message, {
          sticky: true
        });
      },
      idle: function(message, options) {
        return this.set(this.statuses.idle, message, options);
      },
      info: function(message, options) {
        return this.idle(message, options);
      },
      error: function(message, options) {
        console.error(message.stack || message);
        if (message instanceof Error) {
          message = message.message;
        }
        if (message.code && message.message) {
          message = message.message;
        }
        if (!$rootScope.application_view_ready || $rootScope.this_page.status === false || $rootScope.this_page.page === 'debug') {
          if ((translate('error.generic')) === 'error.generic') {
            alert('Error:\n\n' + message);
          } else {
            alert(translate('error.generic', {
              message: message
            }));
          }
        }
        return this.set('error', message, options);
      },
      not_authenticated: function() {
        if ($rootScope.status && $rootScope.status.code === 'busy') {
          return this.idle();
        }
      },
      place: function(where) {
        var $element;
        $element = $('.status');
        if (where) {
          return $element.appendTo('.' + where + '-status-place');
        }
        if ($('.preferred-status-place')[0]) {
          return $element.appendTo($('.preferred-status-place'));
        }
        return $element.appendTo($('.default-status-place'));
      },
      test: function() {
        Status.busy('Testing busy');
        (function() {
          return Status.error('Testing error');
        }).delay(3000);
        return (function() {
          return Status.idle('Testing idle');
        }).delay(6000);
      }
    };
  }]);

}).call(this);

(function() {
  app.factory('translate', ["$translate", function($translate) {
    var translate;
    return translate = function() {
      return $translate.instant.apply(this, arguments);
    };
  }]);

}).call(this);

(function() {
  app.factory('Utilities', function() {
    var Utilities;
    return Utilities = {
      hex_string_to_number: function(mask) {
        return parseInt(mask, 16);
      },
      number_to_hex_string: function(mask) {
        return mask.toString(16).toUpperCase();
      },
      hex_string_to_number_array: function(hex) {
        if (hex.length % 2) {
          hex = '0' + hex;
        }
        return hex.match(/.{1,2}/g).map(function(character) {
          return Utilities.hex_string_to_number(character);
        });
      },
      number_array_to_hex_string: function(array) {
        array = array.clone();
        return array.map(function(number) {
          var hex;
          hex = Utilities.number_to_hex_string(number);
          if (hex.length === 1) {
            hex = '0' + hex;
          }
          return hex;
        }).join('');
      },
      hex_pretty_print: function(hex, position) {
        var before, byte, byte_index, bytes, calculate_shift, delta_position, fours_in_line, original, printed, shift;
        original = hex;
        before = hex.substring(0, position);
        delta_position = before.length - before.replace(/\s/g, '').length;
        position -= delta_position;
        hex = hex.replace(/\s/g, '').toUpperCase();
        fours_in_line = 4;
        calculate_shift = function(byte_index) {
          var fours, lines_before;
          fours = Math.floor(byte_index / 4);
          lines_before = Math.floor(fours / fours_in_line);
          return byte_index + fours - lines_before * '\n'.length;
        };
        bytes = hex.match(/.{1,2}/g);
        if (!bytes) {
          return [original, 0];
        }
        shift = null;
        printed = '';
        byte_index = 0;
        while (byte_index < bytes.length) {
          byte = bytes[byte_index];
          if (shift == null) {
            position -= 2;
            if (position <= 0) {
              shift = calculate_shift(byte_index);
            }
          }
          printed += byte;
          if (byte_index + 1 < bytes.length) {
            if (byte_index !== 0 && (byte_index + 1) % (4 * fours_in_line) === 0) {
              printed += '\n';
            } else if (byte_index !== 0 && (byte_index + 1) % 4 === 0) {
              printed += '  ';
            } else {
              printed += ' ';
            }
          }
          byte_index++;
        }
        return [printed, shift != null ? shift - delta_position : 0];
      },
      trim_masked_hex: function(hex) {
        if (hex == null) {
          return;
        }
        hex = hex.replace(/[\sX]+$/, '');
        if (hex.replace(/\s/g, '').length % 2) {
          hex = hex + 'X';
        }
        return hex;
      },
      difference: function(from, to, diff, path) {
        var key, value;
        if ((diff == null) && (path == null)) {
          diff = {};
          path = '';
        }
        if (typeof from === 'object') {
          if (typeof to !== 'object') {
            throw new Error('Unequivalent object trees. Leaves:', from, to);
          }
          for (key in from) {
            value = from[key];
            Utilities.difference(from[key], to[key], diff, path === '' ? key : path + "." + key);
          }
        } else {
          if (typeof to === 'object') {
            throw new Error('Unequivalent object trees. Leaves:', from, to);
          }
          if (!angular.equals(from, to)) {
            Object.set(diff, path, to);
          }
        }
        return diff;
      }
    };
  });

}).call(this);

(function() {
  app.factory('Version', function() {
    return Version;
  });

}).call(this);

(function() {
  this.Version = function(version) {
    var api, to_parts;
    if (!/\d+\.\d+\.\d+/.test(version)) {
      version = '1.0.0';
    }
    to_parts = function(version) {
      return version.split('.').map(function(x) {
        return parseInt(x);
      });
    };
    return api = {
      compare: function(another_version) {
        var another_part, another_parts, part, parts;
        parts = to_parts(version);
        another_parts = to_parts(another_version);
        while (parts.not_empty()) {
          part = parts.shift();
          another_part = another_parts.shift();
          if (part < another_part) {
            return -1;
          } else if (part > another_part) {
            return 1;
          }
        }
        return 0;
      },
      before: function(another_version) {
        return api.compare(another_version) < 0;
      },
      after: function(another_version) {
        return api.compare(another_version) > 0;
      },
      starting_from: function(another_version) {
        return api.compare(another_version) >= 0;
      },
      greater_or_equal: function(another_version) {
        return api.compare(another_version) >= 0;
      },
      no_higher_than: function(another_version) {
        return api.compare(another_version) <= 0;
      },
      less_or_equal: function(another_version) {
        return api.compare(another_version) <= 0;
      },
      toString: function() {
        return version;
      }
    };
  };

}).call(this);
