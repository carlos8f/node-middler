var matcher = require('../').matcher
  , pathRegExp = require('../').pathRegExp

function Middler () {
  this.items = [];
  this._currentId = 0;
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
  var runlist = this.runlist()
    , thisArg = {req: req, res: res};

  (function nextItem () {
    var item = runlist.shift();

    if (item) {
      var m = matcher(item, req);

      if (m) {
        req.params = m;

        // compatibility with https://github.com/flatiron/union
        res.removeListener('next', nextItem);
        res.once('next', nextItem);

        item.fn.call(thisArg, req, res, function next (err) {
          if (err) {
            console.error(err, 'middler caught an error');
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
    this.items.push(this._wrap(args));
  }
  return this;
};

/**
 * Removes item from the stack.
 */
Middler.prototype.remove = function () {
  var idx = this.items.indexOf(this._wrap(arguments));
  if (idx !== -1) {
    this.items.splice(idx, 1);
  }
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
 * Returns a sorted copy of all items.
 */
Middler.prototype.runlist = function () {
  var runlist = this.items.slice(0);
  function sortProp (prop, a, b) {
    if (a[prop] === b[prop]) {
      return prop === 'weight' ? sortProp('id', a, b) : 0;
    }
    return a[prop] < b[prop] ? -1 : 1;
  }
  runlist.sort(sortProp.bind(null, 'weight'));
  return runlist;
};

/**
 * Parses arguments and wraps them in an object.
 */
Middler.prototype._wrap = function wrapArgs (args) {
  var item = { weight: 0 };
  Array.prototype.slice.call(args).forEach(function (arg) {
    if (typeof arg === 'object') {
      // Item properties
      // (Add weight for remove() to work)
      if (typeof arg.weight === 'undefined') arg.weight = 0;
      item = arg;
    }
    else if (arg instanceof RegExp || (typeof arg === 'string' && arg[0] === '/')) {
      // Implied path string/regex
      item.path = arg;
    }
    else if (typeof arg === 'number') {
      // Implied weight
      item.weight = arg;
    }
    else if (typeof arg === 'string') {
      // Implied HTTP method
      item.method = arg;
    }
    else if (typeof arg === 'function') {
      // middleware handler
      item.fn = arg;
    }
  });

  if (!item.fn) {
    throw new Error('middler expected a middleware callback of some kind');
  }

  if (item.method) {
    item.method = item.method.toLowerCase();
  }
  if (item.path) {
    item.params = [];
    item.regex = pathRegExp(item.path, item.params, true, true);
  }

  item.id = this._currentId++;

  return item;
};