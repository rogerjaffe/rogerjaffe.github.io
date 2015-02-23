var require = {
	baseUrl: 'js',
	paths: { 
		'jquery': [
			'http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min',
			'lib/jquery/jquery-2.1.1.min'
		],
		'bootstrap': [
			'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min',
			'lib/bootstrap/bootstrap.min'
		],
		'knockout': 'lib/knockout/knockout-3.2.0',
		'domReady': 'lib/jquery/domReady',
		'authenticate': 'svc/svcAuthenticate',
		'login': 'svc/svcLogin',
		'messages': 'svc/svcMessages',
		'constants': 'svc/svcConstants',
		'logger': 'svc/svcLogger',
		'templates': 'svc/svcTemplates',
		'utilities': 'svc/svcUtilities',
		'validator': 'lib/bootstrap/validator',
		'bootbox': 'lib/bootstrap/bootbox',
		'bootstrap-select': 'lib/bootstrap/bootstrap-select',
		'crypto': 'lib/utils/sha1',
		'csv': 'lib/jquery/jquery.csv'
	},
	
	shim: {
		'bootstrap': {
			deps: ['jquery']
		},
		'validator': {
			deps: ['jquery', 'bootstrap']
		},
		'knockout': {
			exports: 'ko'
		},
		'crypto': {
			exports: 'CryptoJS'
		},
		'csv': {
			deps: ['jquery']			
		},
	},
	
	deps: ['svc/svcDb'],
	callback: function () {
	}
// urlArgs: "bust"
};