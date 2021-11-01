"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _app = _interopRequireDefault(require("firebase/app"));

var _UserModel = _interopRequireDefault(require("./models/UserModel"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// const demoUser = new User('pJXqEFAmUSR3EEvznLL3PO8HJpm1', 'Yurii Trofimenko', '', 'tyaamariupol@gmail.com')
var _default = {
  // состояние с наблюдаемыми свойствами
  state: {
    user: null // user: demoUser

  },
  // методы изменения состояния
  mutations: {
    setUser: function setUser(state, payload) {
      state.user = payload;
    }
  },
  // методы действий, вызываемые, как правило, из внешних модулей,
  // и вызывающие методы изменения состояния,
  // а также взаимодействующие с сервером (опционально)
  actions: {
    // Logged
    loggedUser: function loggedUser(_ref, payload) {
      var commit = _ref.commit;
      // Send mutation new uid used helped Class
      commit('setUser', new _UserModel["default"](payload.uid, payload.displayName, payload.photoURL, payload.email));
    },
    // Logout
    logoutUser: function logoutUser(_ref2) {
      var commit;
      return regeneratorRuntime.async(function logoutUser$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              commit = _ref2.commit;

              _app["default"].auth().signOut(); // Send mutation null


              commit('setUser', null);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      });
    }
  },
  getters: {
    // Return user (for get id)
    user: function user(state) {
      return state.user;
    },
    // Check User (for logged)
    checkUser: function checkUser(state) {
      return state.user !== null;
    }
  }
};
exports["default"] = _default;