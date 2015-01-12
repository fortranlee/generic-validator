!function(e) {
  if ("object" == typeof exports && "undefined" != typeof module)
    module.exports = e();
  else if ("function" == typeof define && define.amd)
    define([], e);
  else {
    var f;
    "undefined" != typeof window ? f = window : "undefined" != typeof global
        ? f = global
        : "undefined" != typeof self && (f = self), f.validator = e()
  }
}(function() {
  var define, module, exports;
  return (function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;
          if (!u && a)
            return a(o, !0);
          if (i)
            return i(o, !0);
          throw new Error("Cannot find module '" + o + "'")
        }
        var f = n[o] = {
          exports: {}
        };
        t[o][0].call(f.exports, function _dereq_(e) {
          var n = t[o][1][e];
          return s(n ? n : e)
        }, f, f.exports, e, t, n, r)
      }
      return n[o].exports
    }
    var i = typeof require == "function" && require;
    for ( var o = 0; o < r.length; o++)
      s(r[o]);
    return s
  })({
    // global exports
    1: [function(_dereq_, module, exports) {

      module.exports = _dereq_('./lib/');

    }, {
      './lib/': 2
    }],
    
    2: [function(_dereq_, module, exports){
      
      module.exports = _dereq_('./validator');
      
    }, {
      './validator': 3
    }],
    
    3: [function(_dereq_, module, exports){
      
      module.exports = Validator;
      
      var debug = _dereq_('debug')('validator:prototype');
      var mixin = _dereq_('mixin');
      var type = _dereq_('type');
      var keys = _dereq_('keys');
      var sortBy = _dereq_('sortBy');
      var filter = _dereq_('filter');
      var methods = _dereq_('./methods');
      
      function Validator(opts){
        opts = opts || {};
        if(!(this instanceof Validator))
          return new Validator(opts);
        
        // verified or not
        this.valid = false;
        
        //
        this.methods = mixin(this.methods, opts.methods || {}, true);
        
        this.methodsOrder = sortBy(this.methods, 'pr');
        
        // 
        this.fieldsConfig = {};
        
        // execution order
        this.fields = [];
      }
      
      Validator.prototype.addValidation = function(field, label, validations){
        if(type(label) === 'object'){
          validations = label;
          label = field;
        }
        
        if(true === this.valid){
          debug('call `.addValidation` after `.runValidation`');
        }
        this.valid = false;
        
        if(this.fields.indexOf(field) > 0){
          debug('overwriting %s validations: %o → %o', field, this.fieldsConfig[field], validations);
        }else{
          this.fields.push(field);
        }
        this.fieldsConfig[field] = {label: label, validations: validations};
        
        return this;
      };
      
      Validator.prototype.runValidation = function(values, keepon){
        var results = this.results = [];
        var errors = this.errors = [];
        var methods = this.methods;
        var methodsOrder = this.methodsOrder;
        var fields = this.fields;
        var fieldsConfig = this.fieldsConfig;
        var getMessage = this.getMessage;
        
        this.valid = true;
        
        try{
          for(var i = 0, length = fields.length; i < length; i++){
            var field = fields[i];
            var value = values[field] || '';
            var config = fieldsConfig[field];
            var unSortedValidations = keys(config.validations);
            var sortedValidations = filter(methodsOrder, function(method){
              return unSortedValidations.indexOf(method) > -1;
            });
            
            if(sortedValidations[0] === 'required'
                && config.validations['required'] === false
                && !!value === false){
              results.push({field: field, label: config.label, value: value});
              continue;
            }
            
            var breakInside = false;
            for(var j = 0, length1 = sortedValidations.length; j < length1; j++){
              var validation = sortedValidations[j];
              var expected = config.validations[validation];
              var method = methods[validation];
              var msg = getMessage(method.msg, {label: config.label, expected: expected});
              var fn = method.fn;
              var result = !!fn(value, expected);
              
              if(!result){
                this.valid = false;
                errors.push({field: field, label: config.label, msg: msg});
                if(keepon !== true){
                  breakInside = true;
                  break;
                }
              }
            }
            
            if(breakInside){
              break;
            }
            
            results.push({field: field, label: config.label, value: value});
          }
        }catch(e){
          this.valid = false;
        }
      };
      
      Validator.prototype.methods = methods;
      
      Validator.prototype.addMethod = function(name, obj){
        this.methods[name] = obj;
        this.methodsOrder = sortBy(this.methods, 'pr');
        
        return this;
      };
      
      Validator.prototype.getMessage = function(msgTmpl, varsObj){
        return msgTmpl.replace(/@([_\w\$]{1}[0-9\w_\$]*)/g, function(match, _var_){
          return varsObj[_var_];
        });
      };
      
    }, {
      './methods': 4,
      'mixin': 10,
      'type': 11,
      'keys': 12,
      'sortBy': 13,
      'filter': 14,
      'debug': 20
    }],
    
    // validation methods
    4: [function(_dereq_, module, exports){
      
      exports.required = {
        pr: 0,
        msg: '@label不能为空',
        fn: function(val, expected){
          if(expected === true){
            return val.length > 0;
          }
          return true;
        }
      };
      
      exports.minLength = {
        pr: 1,
        msg: '@label的长度不能少于@expected个字符',
        fn: function(val, expected){
          return val.length >= expected;
        }
      };
      
      exports.maxLength = {
        pr: 1,
        msg: '@label的长度不能多于@expected个字符',
        fn: function(val, expected){
          return val.length <= expected;
        }
      };
      
      exports.isNormalWord = {
        pr: 2,
        msg: '@label必须是字母，数字和特殊符号_，$的组合，且首位不能为数字',
        fn: function(val, expected){
          if(expected === true){
            return /^[a-z_\$]{1}[_\$\w]*$/ig.test(val);
          }
          return true;
        }
      };
      
      exports.isCNMobile = {
        pr: 2,
        msg: '@label必须是合法的手机号码',
        fn: function(val, expected){
          if(expected === true){
            return /^(13\d|15[0|3|6|7|8|9]|18[89])\d{8}$/g.test(val);
          }
          return true;
        }
      };
      
      exports.isEmail = {
        pr: 2,
        msg: '@label必须是合法的Email地址',
        fn: function(val, expected){
          if(expected === true){
            return /^(?:[a-z\d]+[_\-\+\.]?)*[a-z\d]+@(?:([a-z\d]+\-?)*[a-z\d]+\.)+([a-z]{2,})+$/i.test(val);
          }
          return true;
        }
      };
      
    }, {}],
    
    // mixin
    10: [function(_dereq_, module, exports) {
      
      module.exports = mixin;
      
      var hasProp = {}.hasOwnProperty;
      
      function mixin(a, b, extended){
        var o = {};
        
        for(var prop in a){
          if(!hasProp.call(a, prop))
            continue;
          o[prop] = a[prop];
        }
        
        for(var prop in b){
          if(!hasProp.call(b, prop) ||
              extended !== true && a[prop] === undefined)
            continue;
          o[prop] = b[prop];
        }
        
        return o;
      }
    }, {}],
    
    // type
    11: [function(_dereq_, module, exports) {
      
      module.exports = type;
      
      var toString = {}.toString;
      
      function type(obj){
        return toString.call(obj).slice(8, -1).toLowerCase();
      }
    }, {}],
    
    // keys
    12: [function(_dereq_, module, exports) {
      
      var hasProp = {}.hasOwnProperty;
      
      var keys = Object.keys || function (obj){
        var keys = [];
        for(var prop in obj){
          if(!hasProp.call(obj, prop))
            continue;
          keys.push(prop);
        }
        return keys;
      };
      
      module.exports = keys;
      
    }, {}],
    
    // sortBy
    13: [function(_dereq_, module, exports) {
      
      module.exports = sortBy;
      
      var keys = _dereq_('keys');
      
      function sortBy(obj, iterator){
        var objKeys = keys(obj);
        
        for(var i = 0, length = objKeys.length - 1; i < length; i++){
          var key = objKeys[i];
          var nextKey = objKeys[i + 1];
          var left = obj[key];
          var right = obj[nextKey];
          if(left[iterator] > right[iterator]){
            // 交换位置
            objKeys[i] = nextKey;
            objKeys[i + 1] = key;
          }
        }
        
        return objKeys;
      }
      
    }, {
      'keys': 12
    }],
    
    // filter
    14: [function(_dereq_, module, exports) {
      
      module.exports = filter;
      
      var type = _dereq_('type');
      
      var _filter = [].filter || undefined;
      
      function filter(array, fn){
        if(type(_filter) === 'function'){
          return _filter.call(array, fn);
        }
        
        var filtered = [];
        
        for(var i = 0, length = array.length; i < length; i++){
          (function(item){
            var result = !!fn.call(array, item);
            if(result === true){
              filtered.push(item);
            }
          })(array[i]);
        }
        
        return filtered;
      }
      
    }, {
      'type': 11
    }],
    
    // debug
    20: [function(_dereq_, module, exports) {

      /**
       * Expose `debug()` as the module.
       */

      module.exports = debug;

      /**
       * Create a debugger with the given `name`.
       *
       * @param {String} name
       * @return {Type}
       * @api public
       */

      function debug(name) {
          if (!debug.enabled(name)) return function() {};

          return function(fmt) {
              fmt = coerce(fmt);

              var curr = new Date;
              var ms = curr - (debug[name] || curr);
              debug[name] = curr;

              fmt = name + ' ' + fmt + ' +' + debug.humanize(ms);

              // This hackery is required for IE8
              // where `console.log` doesn't have 'apply'
              window.console && console.log && Function.prototype.apply.call(console.log, console, arguments);
          }
      }

      /**
       * The currently active debug mode names.
       */

      debug.names = [];
      debug.skips = [];

      /**
       * Enables a debug mode by name. This can include modes
       * separated by a colon and wildcards.
       *
       * @param {String} name
       * @api public
       */

      debug.enable = function(name) {
          try {
              localStorage.debug = name;
          } catch (e) {}

          var split = (name || '').split(/[\s,]+/),
              len = split.length;

          for (var i = 0; i < len; i++) {
              name = split[i].replace('*', '.*?');
              if (name[0] === '-') {
                  debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
              } else {
                  debug.names.push(new RegExp('^' + name + '$'));
              }
          }
      };

      /**
       * Disable debug output.
       *
       * @api public
       */

      debug.disable = function() {
          debug.enable('');
      };

      /**
       * Humanize the given `ms`.
       *
       * @param {Number} m
       * @return {String}
       * @api private
       */

      debug.humanize = function(ms) {
          var sec = 1000,
              min = 60 * 1000,
              hour = 60 * min;

          if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
          if (ms >= min) return (ms / min).toFixed(1) + 'm';
          if (ms >= sec) return (ms / sec | 0) + 's';
          return ms + 'ms';
      };

      /**
       * Returns true if the given mode name is enabled, false otherwise.
       *
       * @param {String} name
       * @return {Boolean}
       * @api public
       */

      debug.enabled = function(name) {
          for (var i = 0, len = debug.skips.length; i < len; i++) {
              if (debug.skips[i].test(name)) {
                  return false;
              }
          }
          for (var i = 0, len = debug.names.length; i < len; i++) {
              if (debug.names[i].test(name)) {
                  return true;
              }
          }
          return false;
      };

      /**
       * Coerce `val`.
       */

      function coerce(val) {
          if (val instanceof Error) return val.stack || val.message;
          return val;
      }

      // persist

      try {
          if (window.localStorage) debug.enable(localStorage.debug);
      } catch (e) {}

    }, {}]
    
  }, {}, [1])(1)
});