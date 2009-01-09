/// <reference path="jquery-1.2.6-vsdoc.js" />

// ==UserScript==
// @name			VeryCD_Douban
// @namespace		VeryCD_Douban
// @version			v0.11
// @include			http://www.douban.com/subject/*
// @author			xushengs@gmail.com
// 2009-01-09 Adds Ajax to get download info from VeryCD.com.
//
// ==/UserScript==

String.prototype.process = function(o) {
    return this.replace(/\$\{([^\}]+)\}/g, function(a, b) {
        return o[b];
    });
};

if (typeof unsafeWindow.jQuery !== "undefined") {
    var jQuery = unsafeWindow.jQuery;
    var $ = jQuery;
}

var Douban4HUST = new function() {
    var _records = [];
    var _title = '', _link = '';
    var _host = 'http://www.verycd.com';
    var _extLinkPrefix = 'http://www.verycd.com/search/folders/';
    var _errorCover = 'http://statics.verycd.com/images/spacer-75x75.jpg';
    var _cataLinks = '';
    var _itemTpl = ['<div class="ul" style="margin-bottom:4px;"/>',
                    '<div class="ll">',
		                '<a href="${link}" target="_blank"><img class="pil" alt="${title}" src="${cover}" onerror="${blank}" /></a>',
	                '</div>',
	                '<div style="padding-left:60px">',
		                '<a href="${link}" target="_blank">${title}</a><br>',
		                '<div class="pl ll">${info}</div><br>',
	                '</div>',
	                '<div class="clear" />'].join('');

    // internal object
    function Record() {
        this.title = '';
        this.cover = '';
        this.link = '';
        this.info = '';
        this.blank = _errorCover;
    }

    // analysis
    function _analyse(res) {
        res = res.responseText;
        // get category information
        var p = /<p\s+id="tags\-list">[^$]*?<\/p>/im;
        var r = res.match(p);
        var cs = '';
        if (r) {
            p = /<a\s+.*?<\/a>/img;
            cs = r[0];
            var cata = p.exec(cs);
            var chtml = [];
            while (cata) {
                chtml.push(cata[0].replace(/href="(.*?)"/, 'href="' + _host + '$1" target="_blank"'));
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

        $('#tablerm').prepend(_getHtml());
        //document.body.innerHTML = _getHtml();
    }

    // gernerate html
    function _getHtml() {
        _link = _extLinkPrefix + encodeURIComponent(_title);
        var s = [];
        var l = _records.length;
        s.push('<h2>VeryCD上有下载的?·  ·  ·  ·  ·  · </h2>');
        s.push('<div class="indent">');
        s.push(['<h4 style="margin-bottom:2px;"><a href="', _link, '" target="_blank">全部(', l > 9 ? '10+' : l, ')</a> ', _cataLinks, '</h4>'].join(''));
        if (l > 0) {
            s.push('<ul class="bs">');
            for (var i = 0; i < l; i++) {
                s.push(_itemTpl.process(_records[i]));
            }
            s.push('</ul>');
        }
        s.push('</div></br>');
        return s.join('');
    }

    // send a request
    function _request() {
        setTimeout(function() {
            GM_xmlhttpRequest({
                method: 'GET',
                url: _extLinkPrefix + encodeURIComponent(_title),
                //url: "verycd.htm",
                headers: {
                    'User-agent': 'Mozilla/4.0 (compatible) VeryCD4Douban'
                },
                onload: _analyse
            })
        }, 500);
    }

    // start to collect info
    function _start() {
        var _tab = $('#nav a.now span').text();
        if (_tab == '音乐' || _tab == '电影') {
            _title = $('h1').text().split(' ')[0];
            _request();
        }
    }

    // when dom ready, go!
    $(document).ready(_start);
} ();