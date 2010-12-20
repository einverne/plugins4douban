// ==UserScript==
// @name			VeryCD_Douban
// @namespace		VeryCD_Douban
// @version			v0.1.1
// @include			http://www.douban.com/subject/*
// @author			xushengs@gmail.com
// @modified        2009-08-17
// @creation        2009-04-27
// @description     get downloading information from VeryCD.com.
// @include         http://www.douban.com/subject/*
// ==/UserScript==

(function() {
    String.prototype.process = function(o) {
        return this.replace(/\$\{([^\}]+)\}/g,
		function(a, b) {
		    return o ? o[b] : '';
		});
    };

    var _records = [], _title = '', _link = '', _total = 0,
        _host = 'http://www.verycd.com',
        _extLinkPrefix = 'http://www.verycd.com/search/folders/',
        _errorCover = 'http://statics.verycd.com/images/spacer-75x75.jpg',
        _cataLinks = '',
        _itemTpl = ['<div class="ul" style="margin-bottom:4px;"/>',
                    '<div class="ll">',
		                '<a href="${link}" target="_blank"><img class="pil" alt="${title}" src="${cover}" onerror="this.src=\'${blank}\'" /></a>',
	                '</div>',
	                '<div style="padding-left:60px">',
		                '<a href="${link}" target="_blank">${title}</a><br>',
		                '<div class="pl ll">${info}</div><br>',
	                '</div>',
	                '<div class="clear" />'].join('');

    // internal object
    function Record() {
        with (this) {
            title = '[标题解析失败]';
            cover = '';
            link = '';
            info = '';
            blank = _errorCover;
        }
    }

    var _showing = false;
    function _toggle(o) {
        var m = document.getElementById("_verycd4douban_more");
        if (_showing) {
            m.style.display = "none";
            this.innerHTML = "显示更多...";
        } else {
            m.style.display = "";
            this.innerHTML = "收起";
        }
        _showing = !_showing;
    }

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
        s.push('<div class="indent" style="margin-bottom:0">');
        s.push(['<div style="margin-bottom:2px;"><a href="', _link, '" target="_blank">全部(', _total, ')</a> ', _cataLinks, '</div>'].join(''));
        if (l > 0) {
            //s.push('<ul class="bs">');
            for (var i = 0; i < 3 && i < l; i++) {
                s.push(_itemTpl.process(_records[i]));
            }
            s.push('<div id="_verycd4douban_more" style="display:none">');
            while (i < l) {
                s.push(_itemTpl.process(_records[i]));
                i++;
            }
            s.push('</div>');
            //s.push('</ul>');
        }
        s.push('</div>');
        if (l > 3) {
            s.push('<div style="clear:all;margin:0 0 40px;padding:4px 0 0;border-top:1px dashed #ddd;"><a id="_verycd4douban_btn" href="javascript:void(0)">显示更多...</a></div>');
        }
        return s.join('');
    }

    // analysis
    function _analyse(res) {
        res = res;
        // get category information
        var p = /<ul\s+class="classIndex">[^$]*?<\/ul>/im;
        var r = res.match(p);
        var cs = '';
        if (r) {
            p = /<a\s+.*?\((\d+)\).*?<\/a>/img;
            cs = r[0];
            var cata = p.exec(cs);
            var chtml = [];
            while (cata) {
                chtml.push(cata[0].replace(/href="(.*?)"/, 'href="' + _host + '$1" target="_blank"'));
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
                var pt = /<a\s+.*?href="(.*?)".*?img\s+.*?src="(.*?)".*?<\/a>/im;
                var ls = rt.match(pt);
                if (ls) {
                    record.link = ls[1];
                    record.cover = ls[2];
                }
                // get title
                pt = /<h3><a.*?>(.*?)<\/a><\/h3>/im;
                ls = rt.match(pt);
                if (ls) {
                    record.title = ls[1];
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

        var container = document.querySelectorAll('div.aside')[0];
        var div = document.createElement('div');
        div.innerHTML = _getHtml();
        container.insertBefore(div, container.childNodes[0]);

        document.getElementById('_verycd4douban_btn').onclick = _toggle;
        //$('#tablerm').prepend(_getHtml());
    }

    // send a request
    function _request() {
        var ops = {
            'url': _extLinkPrefix + encodeURIComponent(_title),
            'method': 'GET'
        };
        var workerPool = google.gears.factory.create('beta.workerpool');

        workerPool.onmessage = function(a, b, message) {
            _analyse(message.body);
        };

        var childWorkerId = workerPool.createWorkerFromUrl('http://ajaxproxy.appspot.com/gears/gears_proxy.js');
        workerPool.sendMessage(ops, childWorkerId);
    }

    // start to collect info
    function _start() {
        var nav = document.getElementById('nav').getElementsByTagName('a');
        var txt = '';
        for (var i = 0; i < nav.length; i++) {
            if (nav[i].className == 'now') {
                txt = nav[i].getElementsByTagName('span')[0].textContent;
            }
        }
        switch (txt) {
            case '音乐':
                _title = document.getElementsByTagName('h1')[0].textContent;
                break;
            case '电影':
                _title = document.getElementsByTagName('h1')[0].textContent.split(' ')[0];
                break;
        }
        if (_title != '') {
            _request();
        }
    }

    _start();
})();