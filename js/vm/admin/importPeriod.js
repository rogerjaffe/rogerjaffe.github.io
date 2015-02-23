define(['messages', 'jquery', 'knockout'], function(messages, $, ko) {

  return function VMImportPeriod() {

    var _this = this;
    this.csvData = ko.observable();
    this.csvData.subscribe(function (newValue) {
      _this.enableProcessBtn(newValue.length>0);
    });
    this.visible = ko.observable(true);
    this.periodList = ko.observableArray(['2', '2-3', '3', '3-4', '4', '4-5', '5', '5-6', '6', '6-7', '7']);
    this.selectedPeriod = ko.observable(1);
    this.enableProcessBtn = ko.observable(false);
    this.processBtnCaption = ko.observable('Process');

    this.processClick = function() {
      _this.processBtnCaption('Processing...');
      messages.publish('db', {
        request: 'importPeriods',
        returnMsg: 'db.importPeriods',
        csv: _this.csvData(),
        period: _this.selectedPeriod()
      });
    };

    messages.subscribe('db.importPeriods', function (data) {
      _this.csvData('');
      _this.processBtnCaption('Process');
      messages.publish('dataLists', data);
    });
  };
});
