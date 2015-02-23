define(['messages', 'jquery', 'knockout', 'utilities'], function(messages, $, ko, u) {

  return function VMList() {

    u.addVmDebug('vmList', this);

    var _this = this;
    this.visible = ko.observable(true);
    this.processingCaption = ko.observable(false);
    this.gradeLevels = ko.observableArray(['All', 6, 7, 8]);
    this.selectedGradeLevel = ko.observable();
    this.periods = ko.observableArray(['All', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    this.selectedPeriod = ko.observable();
    this.teachers = ko.observableArray(['All', 'Jaffe Roger', 'Jaffe Adam']);
    this.selectedTeacher = ko.observable();
    this.selectedIntervention = ko.observable();
    this.refreshBtnText = ko.observable("Refresh list");
    this.refreshBtnEnabled = ko.observable(true);
    this.doneStatus = ko.observable(false);
    this.doneStatusText = ko.computed(function () {
      return (this.doneStatus()) ? "Wait... I'm not done!" : "I'm finished!";
    }, this);
    this.username = '';

    this.students = ko.observableArray([]);

    messages.subscribe('db.login', function(data) {
      _this.username = data.user.id;
      _this.doneStatus(data.user.toggleInterventionsEntered === '1');
    });

    messages.subscribe('db.dataLists', function(data) {
      data.gradeList.unshift('All');
      data.periodList.unshift('All');
      data.teacherList.unshift('All');
      _this.gradeLevels(data.gradeList);
      _this.periods(data.periodList);
      _this.teachers(data.teacherList);
    });

    messages.subscribe('db.getStudentsWithFilter', function(data) {
      _this.students(data.studentList);
      _this.refreshBtnText("Refresh list");
      _this.refreshBtnEnabled(true);
    });

    messages.subscribe('db.setIntervention', function(data) {
      var id = $('[studentId="'+data.studentId+'"][subject="'+data.field+'"]');
      if (data.newValue === 0) {
        id.removeClass('active-intervention');
        id.addClass('no-active-intervention');
      } else {
        id.removeClass('no-active-intervention');
        id.addClass('active-intervention');
      }
    });

    this.changeFilter = function() {
      _this.students([]);
      _this.refreshBtnText("Processing...");
      _this.refreshBtnEnabled(false);
      messages.publish('db', {
        request: 'getStudentsWithFilter',
        returnMsg: 'db.getStudentsWithFilter',
        gradeLevel: (_this.selectedGradeLevel() == 'All') ? '' : _this.selectedGradeLevel(),
        period: (_this.selectedPeriod() == 'All') ? '' : _this.selectedPeriod(),
        teacher: (_this.selectedTeacher() == 'All') ? '' : _this.selectedTeacher(),
        intervention: (_this.selectedIntervention() == 'All') ? '' : _this.selectedIntervention()
      });
    };

    this.interventionClick  = function(el, studentId, type) {
      messages.publish('db', {
        request: 'setIntervention',
        returnMsg: 'db.setIntervention',
        studentId: studentId,
        field: type
      });
    };

    this.toggleDone = function () {
      messages.publish('db', {
        request: 'toggleInterventionsEntered',
        returnMsg: 'db.toggleInterventionsEntered',
        id: _this.username
      });
    };

    messages.subscribe('db.toggleInterventionsEntered', function(data) {
      _this.doneStatus(data.status === '1');
    });

    this.test = function () {
      alert('abc');
    };
  };
});
