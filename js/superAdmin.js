require(['domReady', 'app/superAdmin', 'bootstrap'], function (domReady, intervention) {
	domReady(function () {

		// From http://stackoverflow.com/questions/2400935/browser-detection-in-javascript,
		// user Kennebec's reply
		var browser = (function(){
		  var N= navigator.appName, ua= navigator.userAgent, tem;
		  var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
		  if(M && (tem = ua.match(/version\/([\.\d]+)/i))!= null) {M[2]= tem[1];}
		  M= M? [M[1], M[2]]: [N, navigator.appVersion,'-?'];
		  return M;
		 })();

		if (browser[0].toLowerCase() === 'msie') {
			alert("Intervention selection doesn't support Internet Explorer.  Please use a real web browser like Chrome or Firefox");
		} else {
			intervention.init();
		}
	});
});