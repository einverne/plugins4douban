// ==UserScript==
// @name			EBook_Douban
// @namespace		http://fdream.net
// @version			v0.1.1
// @author			xushengs@gmail.com
// @modified        2009-08-18
// @creation        2009-04-27
// @description     get e-book downloading information from google.com.
// @include         http://www.douban.com/subject/*
// ==/UserScript==

(function() {
	String.prototype.process = function(o) {
		return this.replace(/\$\{([^\}]+)\}/g,
		function(a, b) {
			return o ? o[b] : '';
		});
	};

	var _books = [],
        _isbn = '', _title = '', _link = '',
        _extLinkTpl = 'http://www.google.com/cse?cx=004798099194550741737%3Aq_g80ujebkq&ie=UTF-8&q=${key}&sa=Search',
        _itemTpl = ['<li>',
                    '<a href="${link}" target="_blank">${title}</a>',
                    '<br />',
                    '来自：${website}',
                    '</li>'].join

    var _showing = false;
    function _toggle(){
    	var m = document.getElementById("_ebook4douban_more"); 
    	if(_showing){ 
    		m.style.display="none"; 
    		this.innerHTML = "显示更多..."; 
    	}
    	else{ 
    		m.style.display=""; 
    		this.innerHTML = "收起"; 
    	} 
    	_showing = !_showing; 
    };

    // gernerate html
    function _getHtml() {
        var _link = _extLinkTpl.process({ 'key': encodeURIComponent(_title) });
        var s = [];
        //s.push('<script type="text/javascript">');
        //s.push('var showing = false;');
        //s.push('function _ebook_toggle(o){ var m = document.getElementById("_ebook_more"); if(showing){ m.style.display="none"; o.innerHTML = "显示更多..."; }else{ m.style.display=""; o.innerHTML = "收起"; } showing = !showing; }');
        //s.push('</script>');
        s.push('<h2>哪里有这本书的电子版?  ·  ·  ·  ·  ·  · </h2>');
        s.push('<div class="indent">');
        s.push('<h4 style="margin-bottom: 0px;"><a href="' + _link + '" target="_blank">去Google搜索更多结果</a></h4>');
        var l = _books.length;
        if (l > 0) {
            s.push('<ul class="bs">');
            for (var i = 0; i < 3; i++) {
                s.push(_itemTpl.process(_books[i]));
            }
            s.push('<span id="_ebook4douban_more" style="display:none">');
            while (i < l) {
                s.push(_itemTpl.process(_books[i]));
                i++;
            }
            s.push('</span>');
            if(l > 3){
            	s.push('<a id="_ebook4douban_btn" href="javascript:void(0)">显示更多...</a>');
            }
            s.push('</ul>');
        }
        s.push('</div></br>');
        return s.join('');
    }
    
   // analysis
    function _analyse(res) {
        var p = /<ol.*?<\/ol>/im;
        var r = res.match(p);
        if (r) {
            var rs = r[0];
            p = /<li([^\$]|$)*?<a([^\$]|$)*?href=['"](.+?)["']([^\$]|$)*?>(([^\$]|$)*?)<\/a>([^\$]|$)*?<\/div>/img;
            var line = p.exec(rs);
            while (line) {
                _books.push({ 'link': line[3], 'title': line[5].replace(/<.*?>/img, ''), 'website': line[3].match(/http:\/\/(.*?)\//im)[1] });
                line = p.exec(rs);
            }
        }

        //document.body.innerHTML = _getHtml();
        var container = document.querySelectorAll('div.aside')[0];
        var div = document.createElement('div');
        div.innerHTML = _getHtml();
        container.insertBefore(div, container.childNodes[0]);
        
        document.getElementById('_ebook4douban_btn').onclick = _toggle;
        //document.getElementById('tablerm').prepend(_getHtml());
    }
    
	function _request() {
		var ops = {
			'url': _extLinkTpl.process({ 'key': encodeURIComponent(_title) }),
			'method': 'GET'
		};
		var workerPool = google.gears.factory.create('beta.workerpool');

		workerPool.onmessage = function(a, b, message) {
			_analyse(message.body);
		};

		var childWorkerId = workerPool.createWorkerFromUrl('http://ajaxproxy.appspot.com/gears/gears_proxy.js');
		workerPool.sendMessage(ops, childWorkerId);
	}

	function _start() {
		var nav = document.getElementById('nav').getElementsByTagName('a');
		var txt = '';
		for (var i = 0; i < nav.length; i++) {
			if (nav[i].className == 'now') {
				txt = nav[i].getElementsByTagName('span')[0].textContent;
			}
		}

		if (txt == '读书') {
			_title = document.getElementsByTagName('h1')[0].textContent;
	        if (_title != '') {
				_request();
			}
		}
	}

	_start();
})();