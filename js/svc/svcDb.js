//  messages.publish('authenticate', data)
//  data.xxxx
//    request:              'getUser': data.uid=UID to retrieve
//    returnMsg:            Return message (or no.return.message)
//
//  request: onStudentKey
//    data.callback:  callback function
//    data.this:      calling object
//    data.returnMsg: Return message with callback function that's returned by on function

define(['messages', 'utilities', 'jquery'], function(messages, utilities, $) {
  // define(['messages', 'utilities', 'Firebase', 'firebase', 'constants'], function(messages, utilities, Firebase, firebase, constants) {

  var SvcDb = function() {
    var _this = this;
    this.username = '';
    this.token = '';

    // Entry for all DB data requests
    messages.subscribe('db', function(data) {
      var _data = data;
      _data.returnMsg = (_data.returnMsg) ? _data.returnMsg : 'no.return.message';
      fetch(data, _data.returnMsg);
    });

    messages.subscribe('db.login', function (data) {
      _this.username = data.username;
      _this.token = data.token;
    });

    function fetch(data, returnMsg) {
      if ((data.request == 'login') || (data.request == 'forgotPassword')) {
        _this.username = data.username;
      }

      data.username = _this.username;
      data.token = _this.token;
      $.ajax({
        url: 'php/fetch.php',
        data: data,
        dataType: 'json',
        type: 'POST',
        success: function (data) {
          if (data.error) {
            messages.publish('db.error', data);
          } else {
            messages.publish(returnMsg, data);
          }
        }
      });
    }

  };

  return new SvcDb();
});

