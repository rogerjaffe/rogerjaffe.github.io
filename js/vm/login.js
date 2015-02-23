define(['messages', 'jquery', 'knockout', 'crypto', 'bootbox'], function(messages, $, ko, Crypto, bootbox) {

  return function VMLogin() {

    var _this = this;
    this.username = ko.observable('117449');
    this.password = ko.observable('patriots');
    this.visible = ko.observable(true);
    this.error = ko.observable(false);
    this.forgotPasswordText = ko.observable(false);
    this.newPasswordEmail = ko.observable('');
    this.newPasswordEmailText = ko.computed(function() {
      return "Your new password was emailed to " + this.newPasswordEmail();
    }, this);
    this.loginBtnCaption = ko.observable('Login');

    this.loginClick = function() {
      _this.loginBtnCaption('Logging in...');
      messages.publish('db', {
        request: 'login',
        returnMsg: 'db.login',
        username: _this.username(),
        password: CryptoJS.SHA1(_this.password()).toString()
      });
    };

    this.forgotPasswordClick = function() {
      if (_this.username().length > 0) {
        messages.publish('db', {
          request: 'forgotPassword',
          returnMsg: 'db.forgotPassword',
          username: _this.username()
        });
      } else {
        bootbox.alert('Please enter a username');
      }
    };

    messages.subscribe('db.login', function(data) {
      _this.error(data.error);
      _this.loginBtnCaption('Login');
      _this.forgotPasswordText(false);
      if (!data.error) {
        _this.visible(false);
        $('#tabContent').show();
        messages.publish('db', {
          request: 'dataLists',
          returnMsg: 'db.dataLists'
        });
        $('#content').show();
      }
      $('.enable-tooltips').tooltip();
    });

    messages.subscribe('db.error', function(data) {
      $('#content').hide();
      _this.loginBtnCaption('Login');
      if (data.errorType == 'expired') {
        $('#expired').show();
      } else {
        if (data.errorType == 'password') {
          _this.error(true);
        } else {
          $('#otherError').show();
        }
      }
    });

    messages.subscribe('db.forgotPassword', function(data) {
      _this.newPasswordEmail(data.email);
      _this.forgotPasswordText(true);
    });

  };
});
