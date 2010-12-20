(function(){
	function request(url){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onreadystatechange = function(){
	        if (xhr.readyState == 4){
	        	if(xhr.status == 200){
	        		alert(xhr.responseText);
	        	}
	        }
	    };
		xhr.send(null);
	}

	function start(evt){
		var bs = window.getBrowser().selectedBrowser;
		var doc = bs.contentDocument,
		    url = bs.currentURI.spec;
		if(/^https?:\/\/movie.douban.com\/subject\/.*/i.test(url)){
			//alert('match');
			request('http://www.baidu.com');
		}
		else{
			//alert(location.href);
		}
	}

	function main(evt){
		window.getBrowser().selectedBrowser.contentDocument.addEventListener( "DOMContentLoaded", start, false);
	}

	document.addEventListener( "DOMContentLoaded", main, false); 
})();
