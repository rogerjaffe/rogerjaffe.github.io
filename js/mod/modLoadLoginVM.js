define([
	'knockout',
	'vm/login'
], function (
	ko,
	VMLogin
) {
	ko.applyBindings(new VMLogin(), document.getElementById('vmLogin'));
});

