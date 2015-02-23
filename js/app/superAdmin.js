//	Revision history
// 	2012-11-01	Written
//
define(['messages', 'jquery', 'templates', 'validator'],
  function(messages, $, templates) {

  	messages.subscribe('templatesLoaded', function () {
  		// require(['validator']);
  		require(['mod/modLoadLoginVM']);
  		require(['mod/modLoadSuperAdminVM']);
  	});

	  return {

	    init: function() {
	    	templates.load('body', 'templatesLoaded');
				// $('#myTabs a').click(function (e) {
				//   e.preventDefault();
				//   $(this).tab('show');
				// });
	    }

	  };

  });