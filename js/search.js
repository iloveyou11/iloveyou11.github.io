// function initSearch() {
//     var keyInput = $('#keywords'),
//         back = $('#back'),
//         searchContainer = $('#search-container'),
//         searchResult = $('#search-result'),
//         searchTpl = $('#search-tpl').html(),
//         JSON_DATA = '/content.json?v=' + (+new Date()),
//         searchData;

//     function loadData(success) {
//         if (!searchData) {
//             var xhr = new XMLHttpRequest();
//             xhr.open('GET', JSON_DATA, true);
//             xhr.onload = function() {
//                 if (this.status >= 200 && this.status < 300) {
//                     var res = JSON.parse(this.response || this.responseText);
//                     searchData = res instanceof Array ? res : res.posts;
//                     success(searchData);
//                 } else {
//                     console.error(this.statusText);
//                 }
//             };
//             xhr.onerror = function() {
//                 console.error(this.statusText);
//             };
//             xhr.send();
//         } else {
//             success(searchData);
//         }
//     }

//     function tpl(html, data) {
//         return html.replace(/\{\w+\}/g, function(str) {
//             var prop = str.replace(/\{|\}/g, '');
//             return data[prop] || '';
//         });
//     }

//     function render(data) {
//         var html = '';
//         if (data.length) {
//             html = data.map(function(post) {
//                 return tpl(searchTpl, {
//                     title: post.title,
//                     url: (window.mihoConfig.root + '/' + post.path)
//                 });
//             }).join('');
//         } else {
//             html = '<li class="search-result-item-tips"><p>No Result found!</p></li>';
//         }
//         searchResult.html(html);
//         containerDisplay(true);
//     }

//     function containerDisplay(status) {
//         if (status) {
//             searchContainer.addClass('search-container-show')
//         } else {
//             searchContainer.removeClass('search-container-show')
//         }
//     }

//     function search(e) {
//         var keywords = this.value.trim().toLowerCase();
//         if (!keywords) {
//             containerDisplay(false);
//             return;
//         }

//         loadData(function(items) {
//             var results = [];
//             items.forEach(function(item) {
//                 if (item.title.toLowerCase().indexOf(keywords) > -1 || item.text.toLowerCase().indexOf(keywords) > -1) {
//                     results.push(item);
//                 }
//             });
//             render(results);
//         });

//         e.preventDefault();
//     }

//     keyInput.bind('input propertychange', search);
// };


var searchFunc = function(path, search_id, content_id) {
    'use strict';
    var BTN = "<i id='local-search-close'>x</i>";
    $.ajax({
        url: path,
        dataType: "xml",
        success: function(xmlResponse) {
            // get the contents from search data
            var datas = $("entry", xmlResponse).map(function() {
                return {
                    title: $("title", this).text(),
                    content: $("content", this).text(),
                    url: $("url", this).text()
                };
            }).get();

            var $input = document.getElementById(search_id);
            var $resultContent = document.getElementById(content_id);

            $input.addEventListener('input', function() {
                var str = '<ul class=\"search-result-list\">';
                var keywords = this.value.trim().toLowerCase().split(/[\s\-]+/);
                $resultContent.innerHTML = "";
                if (this.value.trim().length <= 0) {
                    return;
                }
                // perform local searching
                datas.forEach(function(data) {
                    var isMatch = true;
                    var content_index = [];
                    if (!data.title || data.title.trim() === '') {
                        data.title = "Untitled";
                    }
                    var data_title = data.title.trim().toLowerCase();
                    var data_content = data.content.trim().replace(/<[^>]+>/g, "").toLowerCase();
                    var data_url = data.url;
                    var index_title = -1;
                    var index_content = -1;
                    var first_occur = -1;
                    // only match artiles with not empty contents
                    if (data_content !== '') {
                        keywords.forEach(function(keyword, i) {
                            index_title = data_title.indexOf(keyword);
                            index_content = data_content.indexOf(keyword);

                            if (index_title < 0 && index_content < 0) {
                                isMatch = false;
                            } else {
                                if (index_content < 0) {
                                    index_content = 0;
                                }
                                if (i == 0) {
                                    first_occur = index_content;
                                }
                                // content_index.push({index_content:index_content, keyword_len:keyword_len});
                            }
                        });
                    } else {
                        isMatch = false;
                    }
                    // show search results
                    if (isMatch) {
                        str += "<li><a href='" + data_url + "' class='search-result-title'>" + data_title + "</a>";
                        var content = data.content.trim().replace(/<[^>]+>/g, "");
                        if (first_occur >= 0) {
                            // cut out 100 characters
                            var start = first_occur - 20;
                            var end = first_occur + 80;

                            if (start < 0) {
                                start = 0;
                            }

                            if (start == 0) {
                                end = 100;
                            }

                            if (end > content.length) {
                                end = content.length;
                            }

                            var match_content = content.substr(start, end);

                            // highlight all keywords
                            keywords.forEach(function(keyword) {
                                var regS = new RegExp(keyword, "gi");
                                match_content = match_content.replace(regS, "<em class=\"search-keyword\">" + keyword + "</em>");
                            });

                            str += "<p class=\"search-result\">" + match_content + "...</p>"
                        }
                        str += "</li>";
                    }
                });
                str += "</ul>";
                if (str.indexOf('<li>') === -1) {
                    return $resultContent.innerHTML = BTN + "<ul><span class='local-search-empty'>没有找到内容，更换下搜索词试试吧~<span></ul>";
                }
                $resultContent.innerHTML = BTN + str;
            });
        }
    });
    $(document).on('click', '#local-search-close', function() {
        $('#local-search-input').val('');
        $('#local-search-result').html('');
    });
}

// 采用https://github.com/barretlee/hexo-search-plugin-snippets/blob/master/snippets/search.js