//  messages.publish('authenticate', data)
//  data.xxxx
//    request:              'getUser': data.uid=UID to retrieve
//    returnMsg:            Return message (or no.return.message)
//

define(['messages', 'utilities'], function(messages, utilities) {
  // define(['messages', 'utilities', 'Firebase', 'firebase', 'constants'], function(messages, utilities, Firebase, firebase, constants) {

  var SvcAuthenticate = function() {
    var _this = this;

    // Entry for all authentication data requests
    messages.subscribe('authenticate', function(data) {
      var _data = data;
      _data.returnMsg = (_data.returnMsg) ? _data.returnMsg : 'no.return.message';
      switch (_data.request) {
        case 'getUser':
          getUser(data, _data.returnMsg);
          break;
        case 'authLogin':
          authLogin(data, _data.returnMsg);
          break;
        case 'getStudentKey':
          getStudentKey(data.studentKey, _data.returnMsg);
          break;
      }
    });

  };

  return new SvcAuthenticate();
});

