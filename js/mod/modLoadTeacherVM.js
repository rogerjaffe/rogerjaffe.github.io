define([
	'knockout',
	'vm/teacher/list'
], function (
	ko,
	VMList
) {
	ko.applyBindings(new VMList(), document.getElementById('vmList'));
});

