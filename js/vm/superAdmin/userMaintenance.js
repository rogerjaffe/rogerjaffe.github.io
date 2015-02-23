define(['messages', 'jquery', 'knockout', 'utilities', 'crypto', 'constants', 'bootbox'], function(messages, $, ko, u, Crypto, constants, bootbox) {

  return function VMUserMaintenance() {

    u.addVmDebug('vmUserMaintenance', this);

    var _this = this;
    var roleOptionsList = [{
      text: 'Super admin',
      value: 0
    }, {
      text: 'Admin',
      value: 1
    }, {
      text: 'Teacher',
      value: 2
    }];
    var roleOptionsListArray = ['Super admin', 'Admin', 'Teacher'];
    this.visible = ko.observable(true);
    this.users = ko.observableArray([]);
    this.id = ko.observable();
    this.lastname = ko.observable();
    this.firstname = ko.observable();
    this.email = ko.observable();
    this.role = ko.observable();
    this.roleText = ko.observable();
    this.roleOptions = ko.observableArray(roleOptionsList);
    this.userVisible = ko.computed(function() {
      return (this.lastname() !== undefined);
    }, this);
    this.interventionsEntered = ko.observable();
    this.interventionsEnteredText = ko.computed(function () {
      return (this.interventionsEntered()) ? "Yes" : "No";
    }, this);
    this.password1 = ko.observable();
    this.password2 = ko.observable();
    this.newUser = ko.observable(false);
    var revert;

    messages.subscribe('db.login', function(data) {
      messages.publish('db', {
        request: 'users',
        returnMsg: 'db.users'
      });
    });

    function clearFields() {
      _this.id(undefined);
      _this.lastname(undefined);
      _this.firstname(undefined);
      _this.email(undefined);  
      _this.interventionsEntered(false);    
    }

    function toFields(user) {
      _this.lastname(user.lastname);
      _this.firstname(user.firstname);
      _this.id(user.id);
      _this.email(user.email);
      _this.role(user.role);
      _this.interventionsEntered((user.interventionsEntered == '1') ? true : false);
    }

    messages.subscribe('db.users', function(data) {
      _this.users(data.users);
      clearFields();
    });

    messages.subscribe('db.user', function(data) {
      var user = data.user[0];
      toFields(user);
      // _this.lastname(user.lastname);
      // _this.firstname(user.firstname);
      // _this.id(user.id);
      // _this.email(user.email);
      // _this.role(user.role);
      _this.roleText(roleOptionsListArray[_this.role()]);
    });

    messages.subscribe('db.saveUser db.deleteUser', function() {
      messages.publish('db', {
        request: 'users',
        returnMsg: 'db.users'
      });
    });

    this.userClick = function(userId) {
      messages.publish('db', {
        request: 'user',
        returnMsg: 'db.user',
        id: userId
      });
    };

    this.deleteUser = function() {
      bootbox.confirm('Are you sure?', function (confirm) {
        if (confirm) {
          messages.publish('db', {
            request: 'deleteUser',
            returnMsg: 'db.deleteUser',
            id: _this.id()
          });
        }
      });
    };

    this.addUser = function() {
      _this.newUser(true);
      clearFields();
      // _this.id(undefined);
      // _this.lastname(undefined);
      // _this.firstname(undefined);
      // _this.role(constants.TEACHER_ROLE);
      // _this.email(undefined);
      $('#editUserForm').validator('validate');
    };

    this.editUser = function() {
      _this.newUser(false);
      revert = {
        lastname: _this.lastname(),
        firstname: _this.firstname(),
        id: _this.id(),
        email: _this.email(),
        role: _this.role()
      };
      $('#editUserForm').validator('validate');
    };

    this.saveUser = function() {
      $('#editUser').modal('hide');
      messages.publish('db', {
        request: 'saveUser',
        returnMsg: 'db.saveUser',
        lastname: _this.lastname(),
        firstname: _this.firstname(),
        id: _this.id(),
        email: _this.email(),
        role: _this.role(),
        interventionsEntered: (_this.interventionsEntered()) ? '1' : '0',
        newUser: _this.newUser()
      });
      $('#editUserForm').validator('destroy');
    };

    this.cancelUser = function() {
      if (!_this.newUser()) {
        toFields(revert);
        // _this.lastname(revert.lastname);
        // _this.firstname(revert.firstname);
        // _this.id(revert.id);
        // _this.email(revert.email);
        // _this.role(revert.role);
        _this.roleText(roleOptionsListArray[_this.role()]);
      }
      $('#editUserForm').validator('destroy');
    };
  };
});
