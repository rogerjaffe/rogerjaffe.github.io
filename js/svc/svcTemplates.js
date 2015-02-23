define(['constants', 'jquery', 'messages'], function (constants, $, messages) {

	var count = 0;
	var SvcTemplates = function () {

		var _this = this;

		// Inputs:
		//  el: 				Element to load
		// 	returnMsg: 	Return message appended to 'template.'
		this.load = function (el, returnMsg) {
			var els = $(el).find('[template]');
			$.each(els, function(i, el) {
				var $el = $(el);
				var filename = $el.attr('template');
				count++;			// Count recursions
				$.ajax({
					async: false,
					cache: constants.cache,
					dataType: 'html',
					url: filename,
					success: function (data) {
						var jqel = $(data);
						$el.append(jqel);
						_this.load(jqel);
						count--; 		// Reset recursions
					}
				});
			});
			// When recursions have all finished, send completed message
			if (count === 0) {
				messages.publish(returnMsg);
			}
		};

	};

	return new SvcTemplates();

});

