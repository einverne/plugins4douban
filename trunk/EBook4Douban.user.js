/// <reference path="jquery-1.2.6-vsdoc.js" />

// ==UserScript==
// @name			EBook_Douban
// @namespace		EBook_Douban
// @version			v0.1.2
// @include			http://www.douban.com/subject/*
// @author			xushengs@gmail.com
// @modified        2009-08-18
// @creation        2009-01-10
// @description     get e-book downloading information from google.com.
//
// ==/UserScript==

String.prototype.process = function(o) {
    return this.replace(/\$\{([^\}]+)\}/g, function(a, b) {
        return o ? o[b] : '';
    });
};

if (typeof unsafeWindow.jQuery !== "undefined") {
    var jQuery = unsafeWindow.jQuery;
    var $ = jQuery;
}

var EBook4Douban = new function() {
    var _books = [],
        _isbn = '', _title = '', _link = '',
        _extLinkTpl = 'http://www.google.com/cse?cx=004798099194550741737%3Aq_g80ujebkq&ie=UTF-8&q=${key}&sa=Search',
        _itemTpl = ['<li>',
                        '<a href="${link}" target="_blank">${title}</a>',
                        '<br />',
                        '来自：${website}',
                        '</li>'].join('');

    // analysis
    function _analyse(res) {
        var p = /<ol.*?<\/ol>/im;
        var r = res.responseText.match(p);
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
        var dp = $($('div.aside')[0]);
        dp && dp.prepend(_getHtml());
    }

    // gernerate html
    function _getHtml() {
        var _link = _extLinkTpl.process({ 'key': encodeURIComponent(_title) });
        var s = [];
        s.push('<script type="text/javascript">');
        s.push('var showing = false;');
        s.push('function _ebook_toggle(o){ var m = document.getElementById("_ebook_more"); if(showing){ m.style.display="none"; o.innerHTML = "显示更多..."; }else{ m.style.display=""; o.innerHTML = "收起"; } showing = !showing; }');
        s.push('</script>');
        s.push('<h2>哪里有这本书的电子版?  ·  ·  ·  ·  ·  · </h2>');
        s.push('<div class="indent">');
        s.push('<h4 style="margin-bottom: 0px;"><a href="' + _link + '" target="_blank">去Google搜索更多结果</a></h4>');
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
                s.push('<a href="javascript:void(0)" onclick="_ebook_toggle(this)">显示更多...</a>');
            }
            s.push('</ul>');
        }
        s.push('</div></br>');
        return s.join('');
    }

    // send a request
    function _request() {
        /*
        $.ajax({
        type: 'GET',
        url: "ebook.htm",
        dataType: 'html',
        cache: false,
        success: _analyse
        });
        */
        setTimeout(function() {
            GM_xmlhttpRequest({
                method: 'GET',
                url: _extLinkTpl.process({ 'key': encodeURIComponent(_title) }),
                headers: {
                    'User-agent': 'Mozilla/4.0 (compatible) EBook4Douban'
                },
                onload: _analyse
            })
        }, 500);
    }

    // start to collect info
    function _start() {
        if ($('#nav a.now span').text() == '读书') {
            _title = $('h1').text();
            _request();
        }
    }

    // when dom ready, go!
    $(document).ready(_start);
} ();
