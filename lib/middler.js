var matcher = require('../').matcher
  , parseUrl = require('./parseUrl')
  , pathRegExp = require('../').pathRegExp
  , Item = require('../').Item

function Middler () {
  this.items = [];
  this.cache = {};
  this.handler = this.handler.bind(this);
}
module.exports = Middler;

/**
 * Attaches this instance to a server.
 */
Middler.prototype.attach = function (server) {
  return require('../').attach(server, this);
};

/**
 * Middleware kernel. Embeddable in other middleware!
 */
Middler.prototype.handler = function middlerKernel (req, res, next) {
  var thisArg = {req: req, res: res}
    , i = 0
    , items = this.items
    ;

  (function nextItem () {
    var item = items[i++];

    if (item) {
      var m = item.match(req);
 
      if (m) {
        req.params = m;

        // compatibility with https://github.com/flatiron/union
        res.removeListener('next', nextItem);
        res.once('next', nextItem);

        item.fn.call(thisArg, req, res, function next (err) {
          if (err) {
            if (err.stack) {
              console.error(err.stack);
            }
            else {
              if (err.code) {
                err.message = err.code + ' - ' + err.message;
              }
              console.error('middler caught an error: ' + err.message);
            }
            
            res.writeHead(500);
            res.end();
          }
          else {
            nextItem();
          }
        });
      }
      else {
        nextItem();
      }
    }
    else {
      next && next();
    }
  })();
}
module.exports = Middler;

/**
 * Adds item(s) onto the stack.
 */
Middler.prototype.add = function addItem () {
  var args = Array.prototype.slice.call(arguments)
    , self = this
    , isMulti = false

  for (var idx in args) {
    // Flatten arrays by calling add() for each element.
    if (Array.isArray(args[idx])) {
      var argsCopy = args.slice();
      argsCopy.splice(idx, 1)[0].forEach(function (arg) {
        self.add.apply(self, argsCopy.concat(arg));
      });
      isMulti = true;
    }
  }
  if (!isMulti) {
    this.items.push(new Item(args, this.cache));
    this.sort();
  }
  return this;
};

/**
 * Removes item from the stack.
 */
Middler.prototype.remove = function (fn) {
  for (var idx in this.items) {
    if (this.items[idx].fn === fn) {
      this.items.splice(idx, 1);
    }
  }
  return this;
};

/**
 * Clears the stack.
 */
Middler.prototype.removeAll = function () {
  this.items = [];
  return this;
};

/**
 * Shortcuts to add items with various properties.
 */
['first', 'last', 'get', 'post', 'put', 'delete', 'head'].forEach(function (val) {
  Middler.prototype[val] = function () {
    if (val === 'first') val = -1000;
    if (val === 'last') val = 1000;
    return this._shortcut(val, arguments);
  };
});

/**
 * Adds item(s) with certain value(s) baked in.
 */
Middler.prototype._shortcut = function (val) {
  if (!Array.isArray(val)) val = [val];
  return this.add.apply(this, val.concat(Array.prototype.slice.call(arguments[1])));
};

/**
 * Sorts the item list.
 */
Middler.prototype.sort = function () {
  function sortProp (prop, a, b) {
    if (a[prop] === b[prop]) {
      return prop === 'weight' ? sortProp('id', a, b) : 0;
    }
    return a[prop] < b[prop] ? -1 : 1;
  }
  this.items.sort(sortProp.bind(null, 'weight'));
};