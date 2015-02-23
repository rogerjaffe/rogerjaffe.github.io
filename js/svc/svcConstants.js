// Define constant values
define([], function () {

	return {
		debug: true,
		debugLog: true,

		TEACHER_ROLE: 2,
		ADMIN_ROLE: 1,
		SUPER_ADMIN_ROLE: 0,
		// debugStack: false,
		// debugLocalData: false,

		interventionFilterList: [{
      text: 'No filter',
      value: 'none'
    }, {
      text: 'English Intervention',
      value: 'english'
    }, {
      text: 'Math Intervention',
      value: 'math'
    }, {
      text: 'Science Intervention',
      value: 'science'
    }, {
      text: 'Study Hall',
      value: 'studyHall'
    }, {
      text: 'Learning Upgrade',
      value: 'learningUpgrade'
    }]

	};
});