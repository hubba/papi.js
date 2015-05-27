'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var _model = require('../model');

var _model2 = _interopRequireDefault(_model);

var User = (function (_Model) {
  function User() {
    _classCallCheck(this, User);

    if (_Model != null) {
      _Model.apply(this, arguments);
    }
  }

  _inherits(User, _Model);

  _createClass(User, [{
    key: 'hasAccess',
    value: function hasAccess() {
      return this.access.status === 0;
    }
  }]);

  return User;
})(_model2['default']);

exports['default'] = User;
module.exports = exports['default'];