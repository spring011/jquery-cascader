'use strict';

var jQuery = jQuery;
(function($){
    $.fn.cascader = function(options, update){

        var _this = this,searchtxt = _this.find('.searchtxt'),dlist = _this.find('.dlist').eq(0),searchdlist = _this.find('.searchdlist'),curArr = [],labelshow = _this.find('.labelshow'),level = 0,initData = false,selJson=[],searchArr = [],searActiveArr = [],searchArr_value=[],focusState=false;

        var defaults = {
            data:[],
            changeOnSelect:false,
            selectedData: [],
            catalogStr: '',
            selectFn:function(){}
        };
        var opts = $.extend(defaults,options);
        if (update) {
            initData = false;
        }

        init();
        function init() {
            if (opts.catalogStr) {
                setLabelshowValue();
            }
        }

        labelshow.bind('click',function(){
            if(!focusState){
                searchtxt.trigger('focus');
                focusState = true;
            }
        });

        searchtxt.bind('focus',function(){
            if(!initData){
                _this.find('.dlist_ul').remove();
                initMenu();
                popOpen(dlist);
                createSearchArr(opts.data);
                initData = true;
            }else if(searchdlist.hasClass('hid')){
                popOpen(dlist);
            }

        }).bind('blur',function(){
            focusState = false;
        }).bind('keyup',function(){
            var serchstr = $(this).val();
            popClose();
            labelshow.addClass('hid');
            if(serchstr.length > 0){
                createSearchBox(serchstr);
            }else{
                popClose();
            }
        });

        dlist.delegate('li.item','click',function(){
            var parent_index = $(this).parent().index();
            var value = $(this).attr('data-value');
            $(this).addClass('on').siblings().removeClass('on');
            level = parent_index;
            getArray(opts.data,value);
        });

        searchdlist.delegate('li.item2','click',function(){
            var searStr = ($(this).text()).split('/'),litxt = dlist.find('.dlist_ul').eq(0),len = searStr.length;

            litxt.nextAll().remove();

            createSearchdlist(opts.data,searStr[0]);

            for(var i = 1; i<len-1; i++){
                createSearchdlist(searActiveArr,searStr[i]);
            }
            dlist.find('.dlist_ul').each(function(i){
                var jqElArr = $(this).find('li');
                highlighting(jqElArr,searStr[i]);
                if(i == len-1){
                    getValue();
                    labelshow.removeClass('hid');
                    searchtxt.val('');
                    popClose();
                }
            });

        });
        function setLabelshowValue() {
            searchtxt.attr('placeholder','');
            labelshow.html(opts.catalogStr);
        }
        function highlighting(jqElArr,highStr){
            jqElArr.each(function(){
                var curtxt = $(this).attr('data-label');
                if(highStr == curtxt){
                    var selectedItem = $(this);
                    $(this).addClass('on').siblings().removeClass('on');
                    scrollToOpened(selectedItem);
                }
            });

        }

        function scrollToOpened(selectedItem){
            var listUl = selectedItem.parents('ul');
            if(selectedItem.size()>0){
                var scrollTop = listUl.scrollTop(),top = selectedItem.position().top + scrollTop;
                if(scrollTop < top){
                    top = top -(listUl.height() - selectedItem.height())/2;
                    listUl.scrollTop(top);
                }
            }
        }

        function createSearchdlist(data,label){
            for(var i in data){
                if(data[i].label == label){
                    searActiveArr = data[i].children;
                }
            }
            createUl(searActiveArr);

        }

        var htmlClickHandler = function(e){
            if(dlist.hasClass('hid') && searchdlist.hasClass('hid')) return;
            var cascader = $(e.target).parents('.cascaderbox');
            if(cascader.size() == 0){
                popClose();
                if(labelshow.hasClass('hid')){
                    labelshow.removeClass('hid');
                    searchtxt.val('');
                }
            }
        };

        function getArray(data,value){
            for(var i in data){
                if(data[i].value == value){
                    curArr = data[i].children;
                    createEl();
                    break;
                }else{
                    getArray(data[i].children,value);
                }
            }
        }

        function createEl(){
            if(curArr){
                /*  点击非最后一个子级 */
                _this.find('.dlist_ul').eq(level).nextAll().remove();
                createUl(curArr);
                popOpen(dlist);
                if(opts.changeOnSelect){ /* 选择即改变,可选择任意级 */
                    getValue();
                }

            }else{
                /* 点击最后一个子级 */
                _this.find('.dlist_ul').eq(level).nextAll().remove();
                getValue();
                popClose();
            }
        }

        function createUl(data, currentValue){
            var arr = data, liArr = [];
            var ul = $('<ul class="dlist_ul"></ul>');
            $.each(arr,function(i,data){
                var lastClass = '';
                var currentClass = '';
                var cIcon = '';

                if(!data.children){
                    lastClass = 'lastchild';
                }
                if(data.children){
                    cIcon = '<i class="fa fa-angle-right"></i>';
                }
                if(data.value == currentValue) {
                    currentClass = ' on';
                }
                var liStr = '<li data-label="'+data.label+'" data-value="'+data.value+'" data-href="'+data.href+'" class="item '+lastClass+currentClass+'">'+data.label+cIcon+'</li>';
                liArr.push(liStr);
            });
            ul.append(liArr.join(''));
            dlist.append(ul);
            return ul;
        }

        function getValue(){
            selJson = []; /* 最终选项数组 */
            dlist.find('li.on').each(function(){
                var label = $(this).attr('data-label'),
                    value = $(this).attr('data-value'),
                    href = $(this).attr('data-href');
                selJson.push({"value":value,"label":label,"href":href});

            });

            var selectedStr = selJsonToStr(selJson);

            searchtxt.attr('placeholder','');
            labelshow.html(selectedStr);
            opts.selectFn(selJson);
        }

        function selJsonToStr(arr){
            var listArr = [];
            $.each(arr,function(i,data){
                var label = data.label;
                listArr.push(label);
            });
            var str = listArr.join(' / ');
            return str;
        }

        function createSearchArr(data,label){
            if(!label){
                label = '';
            }
            for(var i=0;i<data.length;i++){
                var str = label + '' + data[i].label + "/";
                if(data[i].children){
                    curArr = data[i].children;
                    createSearchArr(curArr,str);
                }else{
                    str = str.substring(0,str.lastIndexOf("/"));
                    searchArr.push(str);
                    searchArr_value.push(data[i].value);
                }
            }
        }

        function createSearchBox(label){
            var liArr = [];
            var ul = $('<ul class="dlist_ul dlist_search"></ul>');
            $.each(searchArr,function(i,data){
                if(data.indexOf(label) != -1){
                    var value = searchArr_value[i];
                    liArr.push('<li data-value="'+value+'" class="item2">'+data+'</li>');
                }
            });

            if(liArr.length != 0){
                searchdlist.empty();
                ul.append(liArr.join(''));
                searchdlist.append(ul);
                popOpen(searchdlist);
            }else{
                searchdlist.empty();
                ul.append('<li class="nosearch">无匹配数据</li>');
                searchdlist.append(ul);
                popOpen(searchdlist);
            }
        }

        function popClose(){
            _this.removeClass('open');
            _this.find('.dlist').addClass('hid');
        }

        function popOpen(el){
            _this.addClass('open');
            el.removeClass('hid');
        }

        $('html').bind('click',htmlClickHandler);

        function initMenu() {
            if (opts.selectedData && opts.selectedData.length > 0) {
                let parentValue = '';
                $.each(opts.selectedData, function(index, item) {
                    if (index == 0) {
                        createUl(opts.data, item.value);
                    }else{
                        initGetArray(opts.data, parentValue, item.value);
                    }
                    parentValue = item.value;
                });
            }else{
                createUl(opts.data);
            }
        }
        function initCreateEl(currentValue) {
            if(curArr){
                createUl(curArr, currentValue);
            }
        }
        function initGetArray(data,parenValue,currentValue){
            if (!data || !parenValue) return;
            for(var i in data){
                if(data[i].value == parenValue){
                    curArr = data[i].children;
                    initCreateEl(currentValue);
                    break;
                }else{
                    initGetArray(data[i].children,parenValue,currentValue);
                }
            }
        }
    };
})(jQuery);