define(['messages', 'jquery', 'knockout', 'utilities', 'bootbox'], function(messages, $, ko, u, bootbox) {

  return function VMCourseMaintenance() {

    u.addVmDebug('vmCourseMaintenance', this);

    var _this = this;
    var gradeLevelOptionsList = [{
      text: 'All grades',
      value: 0
    }, {
      text: '6th grade',
      value: 6
    }, {
      text: '7th grade',
      value: 7
    }, {
      text: '8th grade',
      value: 8
    }];
    var gradeLevelOptionsArray = {
      0: 'All grades',
      6: '6th grade', 
      7: '7th grade', 
      8: '8th grade'
    };
    this.visible = ko.observable(true);
    this.courses = ko.observableArray([]);
    this.id = ko.observable();
    this.courseVisible = ko.computed(function () {
      return this.id() !== undefined;
    }, this);

    this.name = ko.observable();
    this.sectionsForCycle = ko.observable();
    this.classSize = ko.observable();

    this.gradeLevel = ko.observable();
    this.gradeLevelOptions = ko.observableArray(gradeLevelOptionsList);
    this.gradeLevelText = ko.computed(function () {
      return gradeLevelOptionsArray[this.gradeLevel()];
    }, this);
    this.selectedGradeLevel = ko.observable();
    
    this.locked = ko.observable();
    this.lockedText = ko.computed(function () {
      return (this.locked()) ? "Yes" : "No";
    }, this);
    this.intervention = ko.observable();
    this.interventionText = ko.computed(function() {
      return (this.intervention()) ? "Yes" : "No";
    }, this);
    this.teacher1 = ko.observable();
    this.teacher2 = ko.observable();
    this.teacher3 = ko.observable();
    this.teacher4 = ko.observable();
    this.category = ko.observable();
    
    this.categories = ko.observableArray();
    this.categoriesWithOther = ko.computed(function () {
      var arr = u.clone(this.categories());
      arr.push('New category');
      return arr;
    }, this);
    this.selectedCategory = ko.observable();
    
    this.newCourse = ko.observable(false);
    var revert;

    messages.subscribe('db.login', function(data) {
      messages.publish('db', {
        request: 'courses',
        returnMsg: 'db.courses'
      });
      messages.publish('db', {
        request: 'categories',
        returnMsg: 'db.categories'
      });
    });

    messages.subscribe('db.categories', function (data) {
      _this.categories(data.categories);
    });

    messages.subscribe('db.courses', function(data) {
      _this.courses(data.courses);
    });

    messages.subscribe('db.course', function(data) {
      var course = data.course[0];
      toFields(course);
      var teacherArr = course.teachers.split(',');
      _this.teacher1(teacherArr[0]);
      _this.teacher2(teacherArr[1]);
      _this.teacher3(teacherArr[2]);
      _this.teacher4(teacherArr[3]);
    });

    messages.subscribe('db.saveCourse db.deleteCourse', function() {
      messages.publish('db', {
        request: 'courses',
        returnMsg: 'db.courses'
      });
    });

    function clearFields() {
      _this.name(undefined);
      _this.id(undefined);
      _this.sectionsForCycle(undefined);
      _this.classSize(undefined);      
      _this.gradeLevel(undefined);
      _this.teacher1(undefined);
      _this.teacher2(undefined);
      _this.teacher3(undefined);
      _this.teacher4(undefined);
      _this.intervention(false);
      _this.locked(false);
      _this.category(undefined);
    }

    function toFields(course) {
      _this.name(course.name);
      _this.id(course.id);
      _this.sectionsForCycle(course.sectionsForCycle);
      _this.classSize(course.classSize);
      _this.gradeLevel(course.gradeLevel);
      _this.locked(course.locked === '1');
      _this.intervention(course.intervention === '1');
      _this.category(course.category);
    }

    this.courseClick = function(courseId) {
      messages.publish('db', {
        request: 'course',
        returnMsg: 'db.course',
        id: courseId
      });
      messages.publish('db', {
        request: 'categories',
        returnMsg: 'db.categories',
      });
    };

    this.deleteCourse = function() {
      bootbox.confirm('Are you sure?', function (confirm) {
        if (confirm) {
          messages.publish('db', {
            request: 'deleteCourse',
            returnMsg: 'db.deleteCourse',
            id: _this.id()
          });
        _this.id(undefined);
        }
      });
    };

    this.addCourse = function() {
      clearFields();
      _this.newCourse(true);
      _this.selectedCategory(_this.categories()[0]);
      _this.classSize(0);
      _this.sectionsForCycle(0);
      $('#editCourseForm').validator('validate');
    };

    this.editCourse = function() {
      _this.newCourse(false);
      revert = {
        id: _this.id(),
        name: _this.name(),
        sectionsForCycle: _this.sectionsForCycle(),
        classSize: _this.classSize(),
        gradeLevel: _this.gradeLevel(),
        teacher1: _this.teacher1(),
        teacher2: _this.teacher2(),
        teacher3: _this.teacher3(),
        teacher4: _this.teacher4(),
        intervention: _this.intervention(),
        locked: _this.locked(),
        category: _this.category()
      };
      _this.selectedGradeLevel(_this.gradeLevel());
      _this.selectedCategory(_this.category());
      $('#editUserForm').validator('validate');
    };

    this.saveCourse = function() {
      $('#editCourse').modal('hide');
      var teacherArr = [_this.teacher1(), _this.teacher2(), _this.teacher3(), _this.teacher4()];
      messages.publish('db', {
        request: (_this.newCourse()) ? 'addCourse' : 'saveCourse',
        returnMsg: 'db.saveCourse',
        id: _this.id(),
        name: _this.name(),
        sectionsForCycle: _this.sectionsForCycle(),
        classSize: _this.classSize(),
        gradeLevel: _this.selectedGradeLevel(),
        teachers: teacherArr.join(','),
        intervention: (_this.intervention()) ? '1' : '0',
        locked: (_this.locked()) ? '1' : '0',
        category: _this.selectedCategory()
      });
      $('#editCourseForm').validator('destroy');
      _this.id(undefined);
    };

    this.cancelCourse = function() {
      if (!_this.newCourse()) {
        toFields(revert);
        _this.teacher1(revert.teacher1);
        _this.teacher2(revert.teacher2);
        _this.teacher3(revert.teacher3);
        _this.teacher4(revert.teacher4);
      }
      $('#editCourseForm').validator('destroy');
    };

    this.newCategoryCheck = function () {
      if (_this.selectedCategory() === 'New category') {
        bootbox.prompt('Enter the new category', function (result) {
          if (result !== null) {
            var arr = _this.categories();
            arr.push(result);
            _this.categories(arr);
            _this.selectedCategory(result);
          }
        });
      }
    };
  };
});
