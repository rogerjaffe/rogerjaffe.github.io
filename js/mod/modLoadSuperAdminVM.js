define([
	'knockout',
	'vm/superAdmin/userMaintenance'
], function (
	ko,
	VMUserMaintenance
) {
	ko.applyBindings(new VMUserMaintenance(), document.getElementById('vmUserMaintenance'));
	require(['mod/modLoadAdminVM']);
});

