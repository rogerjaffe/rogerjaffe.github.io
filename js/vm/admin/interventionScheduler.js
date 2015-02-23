define(['messages', 'jquery', 'knockout', 'utilities', 'constants', 'bootbox', 'bootstrap-select'], function(messages, $, ko, u, constants, bootbox) {

  return function VMInterventionScheduler() {

    u.addVmDebug('vmInterventionScheduler', this);

    var _this = this;
    var interventionFilterList = constants.interventionFilterList;

    this.currentCycleList = ko.observableArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    this.currentCycle = ko.observable();
    this.currentCycle.subscribe(function(newCycle) {
      // Save new cycle in DB
      messages.publish('db', {
        request: 'currentCycle',
        direction: 'put',
        currentCycle: newCycle
      });
      getEnrollmentCounts();
      _this.getInterventionUnenrolled();
      _this.getInterventionEnrolled();
      _this.getInterventionDifferentClass();
    });
    this.enrolledListCount = ko.observable(0);
    this.unenrolledListCount = ko.observable(0);
    this.differentCourseListCount = ko.observableArray(0);

    this.selectedInterventionFilter = ko.observable();
    this.selectedInterventionFilter.subscribe(function(newValue) {
      _this.getInterventionUnenrolled();
      _this.getInterventionEnrolled();
      _this.getInterventionDifferentClass();
    });
    this.interventionFilter = ko.observableArray(interventionFilterList);
    this.selectedGradeLevel = ko.observable();
    this.selectedGradeLevel.subscribe(function(newValue) {
      _this.getInterventionUnenrolled();
      _this.getInterventionEnrolled();
      _this.getInterventionDifferentClass();
    });
    this.studentList = ko.observableArray([]);
    this.studentList.subscribe(function(newValue) {

    });

    this.selectedInterventionCourseId = ko.observable();
    this.selectedInterventionCourseId.subscribe(function(newValue) {
      getCourse(newValue);
      getEnrollmentCounts();
      _this.getInterventionUnenrolled();
      _this.getInterventionEnrolled();
      _this.getInterventionDifferentClass();
    });

    this.interventionCourseList = ko.observableArray([]);

    this.selectedCourse = ko.observable();
    this.selectedCourse.subscribe(function(newValue) {
      _this.sectionList(buildSectionList(newValue));
      _this.refreshSelect();
    });

    this.sectionList = ko.observableArray([]);
    this.sectionList.subscribe(function() {
      _this.updateButtons();
    });

    this.selectedSection = ko.observable();
    this.selectedSection.subscribe(function(newValue) {
      _this.selectNoneBtnClick();
      _this.refreshSelect();
      _this.getInterventionEnrolled();
      _this.updateButtons();
    });

    this.interventionCounts = ko.observableArray([]);
    this.interventionCourseCounts = ko.observableArray([]);

    this.removeAlreadyTaken = ko.observable(false);
    this.removeAlreadyTaken.subscribe(function(newValue) {
      _this.getInterventionUnenrolled();
      _this.getInterventionDifferentClass();
    });

    this.unenrolledList = ko.observableArray();
    this.unenrolledList.subscribe(function() {
      displayList();
    });
    this.enrolledList = ko.observableArray();
    this.enrolledList.subscribe(function() {
      displayList();
    });
    this.differentClassList = ko.observableArray();
    this.differentClassList.subscribe(function() {
      displayList();
    });

    this.listType = ko.observable('unenrolled');
    this.listType.subscribe(function() {
      displayList();
      _this.updateButtons();
    });
    this.displayList = ko.observableArray();

    this.enrollBtnVisible = ko.observable(false);
    this.unenrollBtnVisible = ko.observable(false);
    this.enrollUnenrollBtnEnable = ko.observable(false);

    this.selectedText = ko.observable();

    this.enrolledMsg = ko.observable(false);
    this.enrollingMsg = ko.observable(false);
    this.unenrolledMsg = ko.observable(false);
    this.unenrollingMsg = ko.observable(false);

    messages.subscribe('db.login', function() {
      $('.selectpicker').selectpicker();
      messages.publish('db', {
        request: 'interventionCourseList',
        returnMsg: 'db.interventionCourseList'
      });
      // Get the current cycle on load
      messages.publish('db', {
        request: 'currentCycle',
        returnMsg: 'db.currentCycle',
        direction: 'get'
      });
      // _this.getInterventionUnenrolled();
      getInterventionCounts();
    });

    messages.subscribe('db.interventionCourseList', function(data) {
      _this.interventionCourseList(data.interventionCourseList);
    });

    messages.subscribe('db.currentCycle', function(data) {
      _this.currentCycle(data.currentCycle);
    });

    messages.subscribe('db.interventionCourseCounts', function(data) {
      if (_this.selectedCourse()) {
        var counts = [];
        for (var i = 0; i < _this.selectedCourse().sectionsForCycle; i++) {
          counts[i] = 0;
        }
        for (i = 0; i < data.list.length; i++) {
          counts[data.list[i].sectionId - 1] ++;
        }
        _this.interventionCourseCounts(counts);
      }
    });

    messages.subscribe('db.getInterventionCounts', function(data) {
      _this.interventionCounts(data.counts);
    });

    messages.subscribe('db.schedule.course', function(data) {
      _this.selectedCourse(data.course[0]);
    });

    messages.subscribe('db.getInterventionDifferentClass', function(data) {
      _this.differentCourseListCount(data.studentList.length);
      _this.differentClassList(data.studentList);
    });

    messages.subscribe('db.getInterventionUnenrolled', function(data) {
      _this.unenrolledList(data.studentList);
      _this.unenrolledListCount(data.studentList.length);
    });

    messages.subscribe('db.getInterventionEnrolled', function(data) {
      _this.enrolledList(data.studentList);
      _this.enrolledListCount(data.studentList.length);
    });

    messages.subscribe('db.enroll db.unenroll', function(data) {
      _this.getInterventionEnrolled();
      _this.getInterventionUnenrolled();
      _this.getInterventionDifferentClass();
      getEnrollmentCounts();
    });

    // messages.subscribe('db.unenroll', function(data) {
    //   _this.getInterventionEnrolled();
    //   _this.getInterventionUnenrolled();
    //   _this.getInterventionDifferentClass();
    //   getEnrollmentCounts();
    // });

    // Update the select / enroll / unenroll buttons for visibility and being enabled
    this.updateButtons = function() {
      _this.enrollBtnVisible(_this.listType() === 'unenrolled');
      _this.unenrollBtnVisible(_this.listType() !== 'unenrolled');
      if (_this.listType() == 'unenrolled') {
        // Check that we have checkboxes checked and a section selected
        _this.enrollUnenrollBtnEnable(($('.display-list input:checked').length > 0) && (_this.selectedSection() !== undefined));
      } else {
        // Check that we have checkboxes checked
        _this.enrollUnenrollBtnEnable($('.display-list input:checked').length > 0);
      }
      // Display how many students are checked
      _this.selectedText("Checked: "+$('.display-list input:checked').length);
      return true;
    };

    // Called from KO when list type button clicked
    // Wait 300ms then update the VM variable
    this.changeListType = function() {
      setTimeout(function() {
        _this.listType(getListType());
      }, 300);
    };

    this.selectNoneBtnClick = function() {
      $('.display-list input[type="checkbox"]').prop("checked", false);
      _this.updateButtons();
    };

    this.selectAllBtnClick = function() {
      $('.display-list input[type="checkbox"]').prop("checked", true);
      _this.updateButtons();
    };

    this.selectRandomBtnClick = function() {
      _this.selectNoneBtnClick();
      var arr = [];
      $.each($('.display-list input[type="checkbox"]'), function (idx, el) {
        arr.push({el: el, seq: Math.random()});
      });
      arr.sort(function(a, b) {
        return (a.seq < b.seq) ? -1 : ((a.seq > b.seq) ? 1 : 0);
      });
      var course = _this.selectedCourse();
      var sectionId = _this.selectedSection();
      var numberOfSeats, numberEnrolled, numberAvailable;
      numberOfSeats = course.classSize;
      numberEnrolled = getCurrentEnrollment(sectionId);
      numberAvailable = numberOfSeats - numberEnrolled;
      for (var i=0; i<numberAvailable; i++) {
        $(arr[i].el).prop("checked", true);
      }
      _this.updateButtons();
    };

    this.refreshSelect = function() {
      $('.selectpicker').selectpicker('refresh');
    };

    this.getInterventionUnenrolled = function() {
      if (v(_this.selectedInterventionFilter()) && v(_this.selectedInterventionCourseId()) && v(_this.currentCycle()) && vUndefined(_this.selectedGradeLevel())) {
        messages.publish('db', {
          request: 'getInterventionUnenrolled',
          returnMsg: 'db.getInterventionUnenrolled',
          interventionFilter: _this.selectedInterventionFilter(),
          gradeLevel: _this.selectedGradeLevel(),
          removeAlreadyTaken: _this.removeAlreadyTaken(),
          courseId: _this.selectedInterventionCourseId(),
          cycleId: _this.currentCycle()
        });
      }
    };

    this.getInterventionEnrolled = function() {
      if (v(_this.selectedInterventionCourseId()) && v(_this.currentCycle()) && v(_this.selectedSection())) {
        messages.publish('db', {
          request: 'getInterventionEnrolled',
          returnMsg: 'db.getInterventionEnrolled',
          courseId: _this.selectedInterventionCourseId(),
          cycleId: _this.currentCycle(),
          sectionId: _this.selectedSection()
        });
      } else {
        _this.enrolledList([]);
      }
    };

    this.getInterventionDifferentClass = function() {
      if (v(_this.selectedInterventionFilter()) && vUndefined(_this.selectedGradeLevel()) && v(_this.selectedInterventionCourseId()) && v(_this.currentCycle())) {
        messages.publish('db', {
          request: 'getInterventionDifferentClass',
          returnMsg: 'db.getInterventionDifferentClass',
          interventionFilter: _this.selectedInterventionFilter(),
          gradeLevel: _this.selectedGradeLevel(),
          removeAlreadyTaken: _this.removeAlreadyTaken(),
          courseId: _this.selectedInterventionCourseId(),
          cycleId: _this.currentCycle()
        });
      }
    };

    this.checkBox = function(obj, evt) {
      var el = $(evt.currentTarget).siblings('input');
      el.prop('checked', !el.prop('checked'));
      updateButtons();
    };

    this.enrollClick = function() {
      var sectionId = _this.selectedSection();
      var studentList = [];
      var students = $($('.display-list input:checked'));
      for (var i = 0; i < students.length; i++) {
        studentList.push({studentId: $(students[i]).attr('roster')});
      }
      var course = _this.selectedCourse();
      var courseId = _this.selectedInterventionCourseId();
      var cycleId = _this.currentCycle();
      var sectionMsg = 'section ' + sectionId;
      var msg = "Confirm that you want to enroll " + studentList.length + " students in " + course.name + ", Section "+sectionId;
      bootbox.confirm(msg, function(result) {
        if (result) {
          messages.publish('db', {
            request: 'enroll',
            returnMsg: 'db.enroll',
            studentList: studentList,
            sectionId: sectionId,
            courseId: courseId,
            cycleId: cycleId,
          });
        }
      });
    };

    this.unenrollClick = function() {
      var idList = [];
      var ids = $($('.display-list input:checked'));
      for (var i = 0; i < ids.length; i++) {
        var id = $(ids[i]).attr('roster');
        idList.push(id);
      }
      messages.publish('db', {
        request: 'unenroll',
        returnMsg: 'db.unenroll',
        idList: idList
      });
    };

    // Returns the list type selected ('unenrolled', 'enrolled', 'differentClass')
    function getListType() {
      return $('.list-type .active input').attr('value');
    }

    // Put the corrent list into the display list based on which button was pressed
    function displayList() {
      switch (_this.listType()) {
        case 'unenrolled':
          _this.displayList(_this.unenrolledList());
          break;
        case 'enrolled':
          _this.displayList(_this.enrolledList());
          break;
        case 'differentClass':
          _this.displayList(_this.differentClassList());
      }
      _this.updateButtons();
    }

    // Get the course from the DB
    function getCourse(id) {
      messages.publish('db', {
        request: 'course',
        returnMsg: 'db.schedule.course',
        id: id
      });
    }

    // Build the list of sections with section number and teacher name
    function buildSectionList(course) {
      var clObj = [];
      var teacherList = course.teachers.split(',');
      for (var i = 0; i < course.sectionsForCycle; i++) {
        var secObj = {
          id: i + 1,
          name: "Sec " + (i + 1)
        };
        if (teacherList[i]) {
          secObj.name += " (" + teacherList[i] + ")";
        }
        clObj.push(secObj);
      }
      return clObj;
    }

    // Get the number of students flagged for one or more interventions
    function getInterventionCounts() {
      messages.publish('db', {
        request: 'getInterventionCounts',
        returnMsg: 'db.getInterventionCounts'
      });
    }

    // Get the enrollment counts for this course and cycle
    function getEnrollmentCounts() {
      if (_this.selectedInterventionCourseId() >= 0) {
        messages.publish('db', {
          request: 'interventionCourseCounts',
          returnMsg: 'db.interventionCourseCounts',
          courseId: _this.selectedInterventionCourseId(),
          cycleId: _this.currentCycle()
        });
      }
    }

    function randomizeStudentList(studentList) {
      for (var i = 0; i < studentList.length; i++) {
        studentList[i].rand = Math.random();
      }
      studentList.sort(function(a, b) {
        return (a.rand < b.rand) ? -1 : ((a.rand > b.rand) ? 1 : 0);
      });
      return studentList;
    }

    function v(field) {
      if (!field) {
        return false;
      } else {
        switch (typeof(field)) {
          case 'number': return true;
          case 'string': return field.length>0;
          default: return false;
        }
      }
    }

    function vUndefined(field) {
      return (field !== undefined);
    }

    function displayEnrolledMsg() {
      _this.enrolledMsg(true);
      setTimeout(function() {
        _this.enrolledMsg(false);
      }, 2000);
    }

    function displayUnenrolledMsg() {
      _this.unenrolledMsg(true);
      setTimeout(function() {
        _this.unenrolledMsg(false);
      }, 2000);
    }

    function getCurrentEnrollment(sectionId) {
      var c = 0;
      if (sectionId === 0) {
        for (var i = 0; i < _this.interventionCourseCounts().length; i++) {
          c += _this.interventionCourseCounts()[i];
        }
      } else {
        c = _this.interventionCourseCounts()[sectionId - 1];
      }
      return c;
    }

  };
});
