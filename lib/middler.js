var parseUrl = require('../').parseUrl
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
        if (item.pathCount) {
          req.params = m;
        }

        // compatibility with https://github.com/flatiron/union
        res.removeListener('next', nextItem);
        res.once('next', nextItem);

        item.fn.call(thisArg, req, res, function nextHandler (err) {
          if (err) {
            if (self.listeners('error').length) {
              self.emit('error', err, req, res);
            }
            else if (next) {
              return next(err);
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
  var args = [].slice.call(arguments);

  this.items.push(new Item(args));
  this.sort();
  return this;
};

/**
 * Removes item from the stack.
 */
Middler.prototype.remove = function (fnOrPath) {
  var key = typeof fnOrPath === 'function' ? 'fns' : 'paths';
  for (var idx in this.items) {
    for (var idx2 in this.items[idx][key]) {
      if (this.items[idx][key][idx2] === fnOrPath) {
        this.items.splice(idx, 1);
        return this;
      }
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
['first', 'last', 'get', 'post', 'put', 'delete', 'head', 'patch'].forEach(function (val) {
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