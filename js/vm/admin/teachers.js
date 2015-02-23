define(['messages', 'jquery', 'knockout', 'utilities'], function(messages, $, ko, u) {

  return function VMTeachers() {

    u.addVmDebug('vmTeachers', this);

    var _this = this;

    this.visible = ko.observable(true);
    this.checkMark = ko.observable(false);
    this.users = ko.observableArray([]);
    messages.subscribe('db.users', function(data) {
      _this.users(data.users);
    });

    this.statusChange = function (id) {
      messages.publish('db', {
        request: 'toggleInterventionsEntered',
        returnMsg: 'db.toggleInterventionsEntered',
        username: id,
        id: id
      });
    };

    messages.subscribe('db.toggleInterventionsEntered', function() {
      messages.publish('db', {
        request: 'users',
        returnMsg: 'db.users'
      });
    });

    this.clearAll = function() {
      messages.publish('db', {
        request: 'clearAllInterventionFlags',
        returnMsg: 'db.clearAllInterventionFlags'
      });
    };

    messages.subscribe('db.clearAllInterventionFlags', function () {
      messages.publish('db', {
        request: 'users',
        returnMsg: 'db.users'
      });
    });

  };
});
