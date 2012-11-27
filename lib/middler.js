var matcher = require('../').matcher
  , parseUrl = require('./parseUrl')
  , pathRegExp = require('../').pathRegExp
  , Item = require('../').Item
  , inherits = require('util').inherits
  , EventEmitter = require('events').EventEmitter

function Middler () {
  this.items = [];
  this.handler = this.handler.bind(this);
}
inherits(Middler, EventEmitter);
module.exports = Middler;

/**
 * Attaches this instance to a server.
 */
Middler.prototype.attach = function (server) {
  return require('../').attach(server, this);
};

/**
 * Detaches this instance from a server.
 */
Middler.prototype.detach = function () {
  return require('../').detach(this.server, this);
};

/**
 * Middleware kernel. Embeddable in other middleware!
 */
Middler.prototype.handler = function middlerKernel (req, res, next) {
  var thisArg = {req: req, res: res}
    , i = 0
    , items = this.items
    , self = this

  ;(function nextItem () {
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
            if (self.listeners('error').length) {
              self.emit('error', err, req, res);
            }
            else {
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
};

/**
 * Adds item(s) onto the stack.
 */
Middler.prototype.add = function addItem () {
  var args = [].slice.call(arguments)
    , self = this
    , divs = []

  // If arrays are passed, push an item for every permutation.
  // Credit: http://stackoverflow.com/a/4331713
  var arrs = args.map(function (val) {
    return Array.isArray(val) ? val : [val];
  });
  for (var i = arrs.length - 1; ~i; i--) {
    divs[i] = divs[i + 1] ? divs[i + 1] * arrs[i + 1].length : 1;
  }
  var numPerms = divs.reduce(function (prev, curr) {
    return prev * curr;
  }, 1);

  for (var n = 0; n < numPerms; n++) {
    self.items.push(new Item(arrs.map(function (arr, idx) {
      return arr[Math.floor(n / divs[idx]) % arr.length];
    })));
  }

  this.sort();
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
  return this.add.apply(this, val.concat([].slice.call(arguments[1])));
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