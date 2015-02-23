define(['messages', 'jquery', 'knockout', 'csv'], function(messages, $, ko) {

  return function VMImportStudents() {

    var _this = this;
    this.csvData = ko.observable();
    this.csvData.subscribe(function (newValue) {
      _this.enableProcessBtn(newValue.length>0);
    });
    this.visible = ko.observable(true);
    this.enableProcessBtn = ko.observable(false);
    this.processBtnCaption = ko.observable('Process');

    this.processClick = function() {
      _this.processBtnCaption('Processing...');
      messages.publish('db', {
        request: 'importStudents',
        returnMsg: 'db.importStudents',
        csv: _this.csvData()
      });
    };

    messages.subscribe('db.importStudents', function (data) {
      messages.publish('db', {
        request: 'dataLists',
        returnMsg: 'db.dataLists'
      });
      _this.csvData('');
      _this.processBtnCaption('Process');
    });
  };
});
