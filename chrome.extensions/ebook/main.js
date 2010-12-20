(function(){
	String.prototype.process = function(o) {
		return this.replace(/\$\{([^\}]+)\}/g, function(a, b) {
			return o ? o[b] : '';
		});
	};
	
	function $(selector){
		return document.querySelectorAll(selector);
	}

    var _books = [],
        _isbn = '', _title = '', _link = '',
        _extLinkTpl = 'http://www.google.com/cse?cx=004798099194550741737%3Aq_g80ujebkq&ie=UTF-8&q=${key}&sa=Search',
        _itemTpl = ['<li>',
                        '<a href="${link}" target="_blank">${title}</a>',
                        '<br />',
                        '来自：${website}',
                        '</li>'].join('');
						
	function onLoad(res){
		if(!res){
			return;
		}
		
        var p = /<ol.*?<\/ol>/im;
        var r = res.match(p);
        if (r) {
            var rs = r[0];
            p = /<li([^\$]|$)*?<a([^\$]|$)*?href=['"](.+?)["']([^\$]|$)*?>(([^\$]|$)*?)<\/a>([^\$]|$)*?<\/div>/img;
            var line = p.exec(rs);
            while (line) {
                _books.push({ 'link': line[3].replace(/\/url\?q=/ig, ''), 'title': line[5].replace(/<.*?>/img, ''), 'website': line[3].match(/http:\/\/(.*?)\//im)[1] });
                line = p.exec(rs);
            }
        }
		
		var pd = document.querySelectorAll('div.aside')[0];
		var nd = document.createElement('div');
		nd.className = 'indent';
		nd.innerHTML = _getHtml();
		pd.insertBefore(nd, pd.firstChild);
		
		$('#_ebook_toggle')[0].addEventListener('click', _ebook_toggle);
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
        s.push('<div style="display:block;margin-bottom:8px;padding:4px 8px;background:#dfc;border-radius:4px;"><a href="' + _link + '" target="_blank">去Google搜索更多结果</a></div>');
        var l = _books.length;
        if (l > 0) {
            s.push('<ul class="bs">');
            for (var i = 0; i < 3 && i < l; i++) {
                s.push(_itemTpl.process(_books[i]));
            }
            s.push('<span id="_ebook_more" style="display:none">');
            while (i < l) {
                s.push(_itemTpl.process(_books[i]));
                i++;
            }
            s.push('</span>');
            if (l > 3) {
                s.push('<a id="_ebook_toggle" href="javascript:void(0)">显示更多...</a>');
            }
            s.push('</ul>');
        }
        s.push('</div>');
        return s.join('');
    }

	_title = $('h1 span')[0];
	_title = _title ? _title.innerText : null;
	if(_title){
		chrome.extension.sendRequest({'url': _extLinkTpl.process({ 'key': encodeURIComponent(_title) })}, onLoad);
	}
	
	function _ebook_toggle(evt){ var o = this; var m = document.getElementById("_ebook_more"); if(this.showing){ m.style.display="none"; o.innerHTML = "显示更多..."; }else{ m.style.display=""; o.innerHTML = "收起"; } this.showing = !this.showing; }
	_ebook_toggle.showing = false;
	
})();
