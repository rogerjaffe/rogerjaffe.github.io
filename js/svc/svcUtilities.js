define(['constants'], function(constants) {

	var SvcUtilities = function() {

		var _this = this;

		this.clone = function(obj) {
			return JSON.parse(JSON.stringify(obj));
		};

		this.addVmDebug = function(vmName, vm) {
			if (constants.debug) {
				if (!window.vmDebug) {
					window.vmDebug = {};
				}
				window.vmDebug[vmName] = vm;
			}
		};

	};
	return new SvcUtilities();
});