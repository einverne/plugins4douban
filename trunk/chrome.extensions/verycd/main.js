(function(){
	function $(selector){
		return document.querySelectorAll(selector);
	}
	
	String.prototype.process = function(o) {
		return this.replace(/\$\{([^\}]+)\}/g, function(a, b) {
			return (o && o[b]) ? o[b] : '';
		});
	};	
	
    var _records = [], _title = '', _link = '', _total = 0,
        _host = 'http://www.verycd.com',
        _extLinkPrefix = 'http://www.verycd.com/search/folders?kw=',
        _errorCover = 'http://statics.verycd.com/images/spacer-75x75.jpg',
        _cataLinks = '',
        _itemTpl = ['<div class="ul" style="margin-bottom:4px;">',
                    '<div class="ll">',
		                '<a href="${link}" target="_blank"><img class="pil" width="48" height="48" alt="${title}" src="${cover}" onerror="this.src=\'${blank}\'" /></a>',
	                '</div>',
	                '<div style="padding-left:60px">',
		                '<a href="${link}" target="_blank">${title}</a><br>',
		                '<div class="pl ll">${info}</div><br>',
	                '</div>',
	                '<div class="clear"></div></div>'].join('');

    // internal object
    function Record() {
        this.title = '[标题解析失败]';
        this.cover = '';
        this.link = '';
        this.info = '';
        this.mark = '';
        this.blank = _errorCover;
    }
		
	function onLoad(res) {
		if(!res){
			return;
		}
		
        // get category information
        var p = /<div\s+class="left_class_ambit">[^$]*?<\/div>/im;
        var r = res.match(p);
        var cs = '';
        if (r) {
			//<a href="#" onclick="setCF('catalog:音乐');onButtonClick();submit();">音乐(104)</a>
            p = /<a\s+.*?\((\d+)\).*?<\/a>/img;
            cs = r[0];
            var cata = p.exec(cs);
            var chtml = [];
            while (cata) {
                chtml.push(cata[0].replace(/href="(?:.*?)"\s+.*?onclick=".*'(.*?)'.*?"/i, function(m, a){ return 'href="' + _extLinkPrefix + encodeURIComponent(_title) + '&cf=' + encodeURIComponent(a) + '" target="_blank"';}));
                _total += parseInt(cata[1]);
                cata = p.exec(cs);
            }
            _cataLinks = chtml.join(' ');
        }

        // get detail
        p = /<table\s+id="results\-container"[^$]*?<\/table>/im;
        r = res.match(p);
        if (r) {
            cs = r[0];
            // parse a row
            p = /<tr\s+.*?\s*class="entry"[^$]*?<\/tr>/img;
            var tr = p.exec(cs);
            while (tr) {
                var record = new Record();
                var rt = tr[0];
                // get page url, image url
                var pt = /<a\s+.*?href="(.*?)".*?img.*?\s+src="(.*?)".*?<\/a>/im;
                var ls = rt.match(pt);
                if (ls) {
                    record.link = ls[1];
                    record.cover = ls[2];
                }
                // get title
                pt = /<h3><a.*?>(.*?)<\/a>(.*?)<\/h3>/im;
                ls = rt.match(pt);
                if (ls) {
                    record.title = ls[1];
                    record.mark = ls[2];
                }
                // get size
                pt = /<\/a><br\s*\/>([^$]*?)<\/td>/im;
                ls = rt.match(pt);
                if (ls) {
                    record.info = ls[1];
                }
                // save to list
                _records.push(record);

                tr = p.exec(cs);
            }
        }
		
		var pd = document.querySelectorAll('div.aside')[0];
		var nd = document.createElement('div');
		//nd.className = 'indent';
		var html = _getHtml();
		nd.innerHTML = html;
		pd.insertBefore(nd, pd.firstChild)
		
		$('#_verycd_toggle')[0].addEventListener('click', _verycd_toggle);
	};
		
    // gernerate html
    function _getHtml() {
        _link = _extLinkPrefix + encodeURIComponent(_title);
        var s = [];
        var l = _records.length;
        //s.push('<script type="text/javascript">');
        //s.push('var showing = false;');
        //s.push('function _verycd_toggle(o){ var m = document.getElementById("_verycd_more"); if(showing){ m.style.display="none"; o.innerHTML = "显示更多..."; }else{ m.style.display=""; o.innerHTML = "收起"; } showing = !showing; }');
        //s.push('</script>');
        s.push('<h2>VeryCD上有下载的?·  ·  ·  ·  ·  · </h2>');
        s.push('<div class="indent">');
        s.push(['<div style="margin-bottom:8px;padding:4px 8px;background:#dfc;border-radius:4px;"><a href="', _link, '" target="_blank">全部(', _total, ')</a> ', _cataLinks, '</div>'].join(''));
        if (l > 0) {
            s.push('<ul class="bs">');
            for (var i = 0; i < 3; i++) {
                s.push(_itemTpl.process(_records[i]));
            }
            s.push('<span id="_verycd_more" style="display:none">');
            while (i < l) {
                s.push(_itemTpl.process(_records[i]));
                i++;
            }
            s.push('</span>');
            s.push('<a id="_verycd_toggle" href="javascript:void(0)">显示更多...</a>');
            s.push('</ul>');
        }
        s.push('</div>');
        return s.join('');
    }

	_title = $('h1 span')[0];
	_title = _title ? _title.innerText : null;	
	switch(document.domain){
		case 'movie.douban.com':
			_title = _title.split(' ')[0];
			break;
	}
	if (_title != '') {
		chrome.extension.sendRequest({'url': _extLinkPrefix + encodeURIComponent(_title)}, onLoad);
	}
	
	function _verycd_toggle(evt){ var o = this; var m = document.getElementById("_verycd_more"); if(this.showing){ m.style.display="none"; o.innerHTML = "显示更多..."; }else{ m.style.display=""; o.innerHTML = "收起"; } this.showing = !this.showing; }
	_verycd_toggle.showing = false;
	//window._verycd_toggle = _verycd_toggle;
})();
