$(document).ready(function() {
    //determinate keypresses
    $("body").keyup(function(e) {
        //check for every highlighted cell
        if ($("td.ui-state-highlight").not('.ui-cell-editing').length == 1) {
            var metaKeys = [
                "Backspace",
                "Capslock",
                "Escape",
                "Shift",
                "Alt",
                "Control",
                "Home",
                "End",
                "F1",
                "F2",
                "F3",
                "F4",
                "F5",
                "F6",
                "F7",
                "F8",
                "F9",
                "F10",
                "F11",
                "F12",
                "OS",
                "Tab",
                "Insert",
                "Delete",
                "PageDown",
                "PageUp"
            ];
            var cell = $("td.ui-state-highlight").not('.ui-cell-editing');
            if (e.key == 'F2') {
                cell.click();
            } else if (e.key == 'ArrowRight') {
                if (cell.prev().length == 1) {
                    cell.removeClass('ui-state-highlight');
                    cell.prev().addClass('ui-state-highlight');
                }
            } else if (e.key == 'ArrowLeft') {
				if (cell.next().length == 1) {
                    cell.removeClass('ui-state-highlight');
                    cell.next().addClass('ui-state-highlight');
                }
            } else if (e.key == 'ArrowDown' || e.key == 'Enter') {
                if (cell.parent().next().length == 1) {
                    cell.removeClass('ui-state-highlight');
                    cell.parent().next().find('td').eq(cell.index()).addClass('ui-state-highlight');
                }
            } else if (e.key == 'ArrowUp') {
                if (cell.parent().prev().length == 1) {
                    cell.removeClass('ui-state-highlight');
                    cell.parent().prev().find('td').eq(cell.index()).addClass('ui-state-highlight');
                }
            } else if ( metaKeys.indexOf( e.key) == -1) {
                cell.click();
                cell.find('input').val(e.key);
            }

        }
    });

    fixCells();

    $("body").delegate(".ui-editable-column", "click", function(e) {
        $('.ui-editable-column').not(this).removeClass('ui-state-highlight');
		fixCells();
    });

    $("body").delegate("td.ui-state-highlight", "keyup", function(e) {
        //console.log(e);
        if (e.key == 'Escape') {
            //TODO : i dont like this manner
            $('body').click();
            $(this).addClass('ui-state-highlight');
        }
    });

});


/*
 fix cells function , it should call after add table
*/

    function fixCells() {
		$('.ui-cell-editor-output').attrchange({
			trackValues: true,
			/* Default to false, if set to true the event object is
					updated with old and new value.*/
			callback: function(event) {
				if (event.newValue == 'display: block;') {
					//console.log($(this).parent().parent());
					//$(this).parent().parent().removeClass('ui-state-highlight');

					$(this).parent().parent().addClass('ui-state-highlight');
					//if ($(this).parent().parent().parent().next().length==1) {
					//    $(this).parent().parent().removeClass('ui-state-highlight');
					//    $(this).parent().parent().parent().next().find('td').eq($(this).index()).click();
					//}
				}
			}
		});
	}
/*
A simple jQuery function that can add listeners on attribute change.
http://meetselva.github.io/attrchange/

About License:
Copyright (C) 2013-2014 Selvakumar Arumugam
You may use attrchange plugin under the terms of the MIT Licese.
https://github.com/meetselva/attrchange/blob/master/MIT-License.txt
 */
(function($) {
    function isDOMAttrModifiedSupported() {
        var p = document.createElement('p');
        var flag = false;

        if (p.addEventListener) {
            p.addEventListener('DOMAttrModified', function() {
                flag = true
            }, false);
        } else if (p.attachEvent) {
            p.attachEvent('onDOMAttrModified', function() {
                flag = true
            });
        } else {
            return false;
        }
        p.setAttribute('id', 'target');
        return flag;
    }

    function checkAttributes(chkAttr, e) {
        if (chkAttr) {
            var attributes = this.data('attr-old-value');

            if (e.attributeName.indexOf('style') >= 0) {
                if (!attributes['style'])
                    attributes['style'] = {}; //initialize
                var keys = e.attributeName.split('.');
                e.attributeName = keys[0];
                e.oldValue = attributes['style'][keys[1]]; //old value
                e.newValue = keys[1] + ':' + this.prop("style")[$.camelCase(keys[1])]; //new value
                attributes['style'][keys[1]] = e.newValue;
            } else {
                e.oldValue = attributes[e.attributeName];
                e.newValue = this.attr(e.attributeName);
                attributes[e.attributeName] = e.newValue;
            }

            this.data('attr-old-value', attributes); //update the old value object
        }
    }

    //initialize Mutation Observer
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    $.fn.attrchange = function(a, b) {
        if (typeof a == 'object') { //core
            var cfg = {
                trackValues: false,
                callback: $.noop
            };
            //backward compatibility
            if (typeof a === "function") {
                cfg.callback = a;
            } else {
                $.extend(cfg, a);
            }

            if (cfg.trackValues) { //get attributes old value
                this.each(function(i, el) {
                    var attributes = {};
                    for (var attr, i = 0, attrs = el.attributes, l = attrs.length; i < l; i++) {
                        attr = attrs.item(i);
                        attributes[attr.nodeName] = attr.value;
                    }
                    $(this).data('attr-old-value', attributes);
                });
            }

            if (MutationObserver) { //Modern Browsers supporting MutationObserver
                var mOptions = {
                    subtree: false,
                    attributes: true,
                    attributeOldValue: cfg.trackValues
                };
                var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(e) {
                        var _this = e.target;
                        //get new value if trackValues is true
                        if (cfg.trackValues) {
                            e.newValue = $(_this).attr(e.attributeName);
                        }
                        if ($(_this).data('attrchange-status') === 'connected') { //execute if connected
                            cfg.callback.call(_this, e);
                        }
                    });
                });

                return this.data('attrchange-method', 'Mutation Observer').data('attrchange-status', 'connected')
                    .data('attrchange-obs', observer).each(function() {
                        observer.observe(this, mOptions);
                    });
            } else if (isDOMAttrModifiedSupported()) { //Opera
                //Good old Mutation Events
                return this.data('attrchange-method', 'DOMAttrModified').data('attrchange-status', 'connected').on('DOMAttrModified', function(event) {
                    if (event.originalEvent) {
                        event = event.originalEvent;
                    } //jQuery normalization is not required
                    event.attributeName = event.attrName; //property names to be consistent with MutationObserver
                    event.oldValue = event.prevValue; //property names to be consistent with MutationObserver
                    if ($(this).data('attrchange-status') === 'connected') { //disconnected logically
                        cfg.callback.call(this, event);
                    }
                });
            } else if ('onpropertychange' in document.body) { //works only in IE
                return this.data('attrchange-method', 'propertychange').data('attrchange-status', 'connected').on('propertychange', function(e) {
                    e.attributeName = window.event.propertyName;
                    //to set the attr old value
                    checkAttributes.call($(this), cfg.trackValues, e);
                    if ($(this).data('attrchange-status') === 'connected') { //disconnected logically
                        cfg.callback.call(this, e);
                    }
                });
            }
            return this;
        } else if (typeof a == 'string' && $.fn.attrchange.hasOwnProperty('extensions') &&
            $.fn.attrchange['extensions'].hasOwnProperty(a)) { //extensions/options
            return $.fn.attrchange['extensions'][a].call(this, b);
        }
    }
})(jQuery);
