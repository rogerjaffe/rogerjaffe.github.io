define([
	'knockout',
	'vm/admin/importStudents',
	'vm/admin/importPeriod',
	'vm/admin/interventionScheduler',
	'vm/admin/courseMaintenance', 
	'vm/admin/teachers'
], function (
	ko,
	VMImportStudents,
	VMImportPeriod,
	VMInterventionScheduler,
	VMCourseMaintenance,
	VMTeachers
) {
	ko.applyBindings(new VMImportStudents(), document.getElementById('vmImportStudents'));
	ko.applyBindings(new VMImportPeriod(), document.getElementById('vmImportPeriod'));
	ko.applyBindings(new VMInterventionScheduler(), document.getElementById('vmInterventionScheduler'));
	ko.applyBindings(new VMCourseMaintenance(), document.getElementById('vmCourseMaintenance'));
	ko.applyBindings(new VMTeachers(), document.getElementById('vmTeachers'));
	require(['mod/modLoadTeacherVM']);
});

