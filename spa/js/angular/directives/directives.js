﻿﻿
'use strict';

/* Directives */

innaAppDirectives.
    directive('appVersion', ['version', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    }]);

innaAppDirectives.directive('priceFormat', ['$filter', function ($filter) {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;


            ctrl.$formatters.unshift(function (a) {
                return $filter('price')(ctrl.$modelValue)
            });


            ctrl.$parsers.unshift(function (viewValue) {
                var plainNumber = viewValue.replace(/[^\d|\-+|\.+]/g, '');
                elem.val($filter('price')(plainNumber));
                return plainNumber;
            });
        }
    };
}]);

innaAppDirectives.
    directive('datePicker', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs, ngModelCtrl) {
                var minDate = new Date();
                minDate.setDate(minDate.getDate());

                var ngModel = $parse(attrs.ngModel);
                element.datepicker({
                    minDate: minDate,
                    onSelect: function (dateText) {
                        scope.$apply(function (scope) {
                            // Change binded variable
                            ngModel.assign(scope, dateText);
                        });
                    }
                });

                $(window).resize(function () {
                    element.datepicker('hide');
                    $('.Calendar-input').blur();
                });
            }
        };
    }]);

innaAppDirectives.
    directive('autoComplete', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs, ngModelCtrl) {
                var ngModel = $parse(attrs.ngModel);
                //var ngHidModel = $parse(attrs.ngHidModel);
                var ngIdModel = $parse(attrs.ngIdModel);
                var ngUrlModel = $parse(attrs.ngUrlModel);
                var getUrl = eval(attrs.ngGetUrl);

                element.autocomplete({
                    source: getUrl,
                    minLength: 1,
                    select: function (event, ui) {
                        scope.$apply(function (scope) {
                            // Change binded variable
                            ngModel.assign(scope, ui.item.name);
                            //ngHidModel.assign(scope, ui.item.id);
                            ngIdModel.assign(scope, ui.item.id);
                            ngUrlModel.assign(scope, ui.item.url);
                        });

                        return false;
                    }
                })
                .focus(function () {
                    $(this).autocomplete("search", "");
                }).data("ui-autocomplete")._renderItem = function (ul, item) {
                    return $("<li>")
                        .append("<a>(" + item.id + ")  " + item.name + "</a>")
                        .appendTo(ul);
                };
            }
        };
    }]);

innaAppDirectives.
    directive('autoCompleteDirectory', ['$parse', 'cache', 'urlHelper', function ($parse, cache, urlHelper) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs, ngModelCtrl) {
                var ngModel = $parse(attrs.ngModel);
                //var ngHidModel = $parse(attrs.ngHidModel);
                var ngIdModel = $parse(attrs.ngIdModel);
                var ngUrlModel = $parse(attrs.ngUrlModel);
                var getUrl = eval(attrs.ngGetUrl);

                element.autocomplete({
                    source: getUrl,
                    minLength: 1,
                    select: function (event, ui) {
                        scope.$apply(function (scope) {
                            //получаем то, что будет ключом в урле
                            var urlKey = urlHelper.getUrlFromData(ui.item);

                            // Change binded variable
                            ngModel.assign(scope, ui.item.Name);
                            //ngHidModel.assign(scope, ui.item.Id);
                            ngIdModel.assign(scope, ui.item.Id);
                            ngUrlModel.assign(scope, urlKey);
                        });

                        return false;
                    }
                })
                .focus(function () {
                    $(this).autocomplete("search", "");
                }).data("ui-autocomplete")._renderItem = function (ul, item) {
                    var code = "";
                    if (item.CodeIata != null && item.CodeIata.length > 0)
                        code = ' ' + item.CodeIata + ' ';
                    return $("<li>")
                        .append("<a>(" + item.Id + ")  " + code + item.Name + "</a>")
                        .appendTo(ul);
                };
            }
        };
    }]);

innaAppDirectives.directive('appSlider', ['$timeout', function ($timeout) {
    return {
        link: function ($scope, element, attrs) {
            //console.log('appSlider');
            $scope.$on('sliderDataLoaded', function () {
                //console.log('sliderDataLoaded');
                $timeout(function () { // You might need this timeout to be sure its run after DOM render.
                    //jq script
                    var $banners = $('.Offer-card-banners > .offer-card-banner-item'),
                        length = $banners.length,
                        $dotsContainer = $('.Banner-dots'),
                        currentI = 0,
                        $dots,
                        animate = false;

                    if (length > 1) {
                        $banners.each(function () {
                            $dotsContainer.append('<li class="dot" />');
                        });

                        $dots = $dotsContainer.children();

                        $banners.eq(currentI).css('zIndex', 2);
                        $dots = $dotsContainer.children();
                        $dots.eq(currentI).addClass('active');

                        $dotsContainer.on('click', ':not(.active)', function (evt) {
                            if (animate) {
                                return;
                            }

                            var index = $dots.index(evt.target);

                            scroll(currentI, index)
                        });

                        setInterval($.proxy(function () {
                            var next = currentI + 1;

                            if (next === length) {
                                next = 0;
                            }

                            scroll(currentI, next);
                        }, this), 7000);
                    }

                    function scroll(fromI, toI) {
                        if (animate) {
                            return;
                        }
                        var $from = $banners.eq(fromI);
                        var $fromInfo = $from.find('.info-container');
                        var fromInfoWidth = $fromInfo.width();
                        var $to = $banners.eq(toI);
                        var $toInfo = $to.find('.info-container');
                        var toInfoWidth = $toInfo.width();
                        var $fromImg = $from.find('.img');

                        animate = true;
                        $dots
                            .removeClass('active')
                            .eq(toI)
                            .addClass('active');
                        $banners.css('zIndex', 0);
                        $to.css('zIndex', 1);
                        $fromImg.css('width', $fromImg.width());
                        $from
                            .css('zIndex', 2)
                            .animate({
                                'width': 0
                            }, {
                                duration: 1000,
                                ease: 'linear',
                                queue: false,
                                complete: function () {
                                    $to.css('zIndex', 2);
                                    $from.css({
                                        'width': '100%',
                                        'zIndex': 0
                                    });

                                    currentI = toI;
                                    animate = false
                                }
                            });

                        if ($fromInfo.length && $toInfo.length) {

                            $fromInfo
                                .css('width', fromInfoWidth)
                                .animate({
                                    'left': -fromInfoWidth
                                }, {
                                    duration: 1000,
                                    ease: 'linear',
                                    queue: false,
                                    complete: function () {
                                        $fromInfo.css({
                                            'left': 0,
                                            'width': '100%'
                                        });
                                    }
                                });

                            $toInfo
                                .css('left', toInfoWidth)
                                .animate({
                                    'left': 0
                                }, {
                                    duration: 1000,
                                    ease: 'linear',
                                    queue: false,
                                    complete: function () {
                                        $toInfo.css({
                                            'width': '100%'
                                        });
                                    }
                                });
                        }
                    }

                    function updateBannerSize() {
                        var w = $(window).width();
                        var h = $('.Offer-card-banners').height();

                        $banners.each(function (i, banner) {
                            var $banner = $(banner);
                            var $img = $banner.find('.img');
                            var naturalWidth = $img[0].naturalWidth;
                            var naturalHeight = $img[0].naturalHeight;

                            var scaleH = w / naturalWidth;
                            var scaleV = h / naturalHeight;
                            var scale = scaleH > scaleV ? scaleH : scaleV;

                            $img.css({
                                width: scale * naturalWidth,
                                height: scale * naturalHeight
                            });

                        })
                    }

                    $(window).on('resize', updateBannerSize);


                    $timeout(function () {
                        updateBannerSize();
                    }, 500, false)

                    $scope.$on('$destroy', function () {
                        $dotsContainer.off();
                        $(window).off('resize');
                    });
                }, 0, false);
            });
        }
    };
}]);


innaAppDirectives.directive('tooltip', [function () {
    return {
        link: function ($scope, element, attrs) {
            //console.log('jqUITooltip');
            var $to = $(element);
            $to.tooltip({ position: { my: 'center top+22', at: 'center bottom' } });
            //$to.tooltip("open");
            $to.tooltip("disable");

            $scope.$on('$destroy', function () {
                $to.off();
            });
        }
    };
}]);

innaAppDirectives.directive('tooltipTitle', [function () {
    return {
        link: function ($scope, element, attrs) {
            var $to = $(element);
            $to.tooltip({
                position: {
                    my: "center top+10", at: 'center bottom'
                }
            });

            $scope.$on('$destroy', function () {
                $to.off();
            });
        }
    };
}]);

innaAppDirectives.directive('maskedInput', ['$parse', function ($parse) {
    return {
        link: function ($scope, element, attrs) {
            var m = attrs.mask;
            var ngModel = $parse(attrs.ngModel);
            element.mask(m, {
                completed: function () {
                    var val = element.val();
                    $scope.$apply(function ($scope) {
                        ngModel.assign($scope, val);
                    })
                }
            });
        }
    };
}]);

innaAppDirectives.directive('phoneInput', ['$parse', function ($parse) {
    return {
        link: function ($scope, element, attrs) {
            var $elem = $(element);

            $elem.on('keypress', function (event) {
                var theEvent = event || window.event;
                var key = theEvent.keyCode || theEvent.which;

                //console.log('phoneInput, key: ' + key);
                //48-57 - цифры
                //43 +

                var plusEntered = $elem.val() == '+' || $elem.val().substring(0, 1) == '+';

                if (!plusEntered) {
                    //плюс не введен, даем ввести, или дописываем сами
                    if (key != 43)
                    {
                        $elem.val("+");
                        event.preventDefault();
                        return false;
                    }
                }
                else {
                    //введен плюс, даем вводить только цифры
                    if (!(key >= 48 && key <= 57)) {
                        event.preventDefault();
                        return false;
                    }
                }
            });

            $scope.$on('$destroy', function () {
                $elem.off();
            });
        }
    };
}]);

innaAppDirectives.directive('digitsInput', ['$parse', function ($parse) {
    return {
        link: function ($scope, element, attrs) {
            var $elem = $(element);
            $elem.on('keypress', function (event) {
                var theEvent = event || window.event;
                var key = theEvent.keyCode || theEvent.which;

                //введен плюс, даем вводить только цифры
                if (!(key >= 48 && key <= 57)) {
                    event.preventDefault();
                    return false;
                }
            });

            $scope.$on('$destroy', function () {
                $elem.off();
            });
        }
    };
}]);

innaAppDirectives.directive('upperLatin', ['$filter', function ($filter) {
    return {
        require: 'ngModel',
        link: function ($scope, element, attrs, ngModel) {

            var ruLetters = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'];
            var latLetters = ['A', 'B', 'V', 'G', 'D', 'E', 'E', 'ZH', 'Z', 'I', 'I', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'F', 'KH', 'TS', 'CH', 'SH', 'SHCH', '', 'Y', '', 'E', 'IU', 'IA'];

            var capitalize = function (inputValue) {
                if (inputValue == null) return;

                var capitalized = inputValue.toUpperCase();

                var letters = [];
                _.each(capitalized, function (l) {
                    var index = ruLetters.indexOf(l);
                    if (index > -1)
                    {
                        l = latLetters[index];
                    }
                    letters.push(l);
                });

                capitalized = letters.join('');

                if (capitalized !== inputValue) {
                    ngModel.$setViewValue(capitalized);
                    ngModel.$render();
                }
                return capitalized;
            }

            ngModel.$parsers.push(capitalize);
            capitalize($scope[attrs.ngModel]);// capitalize initial value
        }
    };
}]);

innaAppDirectives.directive('toUpper', ['$filter', function ($filter) {
    return {
        require: 'ngModel',
        link: function ($scope, element, attrs, ngModel) {

            var capitalize = function (inputValue) {
                if (inputValue == null) return;

                var capitalized = inputValue.toUpperCase();

                if (capitalized !== inputValue) {
                    ngModel.$setViewValue(capitalized);
                    ngModel.$render();
                }
                return capitalized;
            }

            ngModel.$parsers.push(capitalize);
            capitalize($scope[attrs.ngModel]);// capitalize initial value
        }
    };
}]);

innaAppDirectives.directive('validateSimple', [function () {
    return {
        require: 'ngModel',
        scope: {
            validate: '&',
            key: '@'
        },
        link: function ($scope, element, attrs, ngModel) {
            function validate(isUserAction) {
                var type = null;
                if (isUserAction)
                    type = 'userAction';

                $scope.validate({ key: $scope.key, value: ngModel.$modelValue });
            };

            element.on('blur', function () {
                $scope.$apply(function () {
                    validate(true);
                });
            }).on('keypress', function (event) {
                var theEvent = event || window.event;
                var key = theEvent.keyCode || theEvent.which;
                if (key == 13) {//enter
                    $scope.$apply(function () {
                        validate(true);
                    });
                }
            }).on('click', function (event) {
                var val = ngModel.$modelValue;

                if (val != null && val.length > 0)
                {
                    $(this).select();
                }
            });

            $scope.$on('$destroy', function () {
                element.off();
            });
        }
    };
}]);

innaAppDirectives.directive('validateEventsDir', ['$rootScope', '$parse', function ($rootScope, $parse) {
    return {
        scope: {
            ngValidationModel: '=',
            validateType: '=',
            dependsOn: '=',
            validate: '&',
            supressSelectOnValue: '='
        },
        link: function ($scope, element, attrs) {
            var isInitDone = false;
            var eid = 'dir_inp_' + _.uniqueId();
            var $elem = $(element);

            function validate(isUserAction) {
                var type = null;
                if (isUserAction)
                    type = 'userAction';

                $scope.validate({ item: $scope.ngValidationModel, type: type });
            };

            $elem.on('blur', function () {
                $scope.$apply(function () {
                    validate(true);
                });
            //}).on('change', function () {
            //    validate();
            }).on('keypress', function (event) {
                var theEvent = event || window.event;
                var key = theEvent.keyCode || theEvent.which;
                if (key == 13) {//enter
                    $scope.$apply(function () {
                        validate(true);
                    });
                }
            }).on('click', function (event) {
                var val = $scope.ngValidationModel.value;

                if (val != null && val.length > 0 && ($scope.supressSelectOnValue == null || val != $scope.supressSelectOnValue))//+7 для телефона
                {
                    $(this).select();
                }
            });


            //обновляем раз в 300мс
            var validateThrottled = _.debounce(function (isUserAction) {
                applyValidateDelayed(isUserAction);
            }, 200);

            var applyValidateDelayed = function (isUserAction) {
                $scope.$apply(function () {
                    validate(isUserAction);
                });

            };

            //когда придет модель - проставим аттрибут id элементу
            function updateAttrId(model) {
                if (!isInitDone && model != null)
                {
                    //проставляем уникальный id элементу
                    $elem.attr("id", eid);
                    isInitDone = true;

                    //заполняем поля в модели
                    if ($scope.ngValidationModel != null &&
                        $scope.ngValidationModel.validationType == null &&
                        $scope.ngValidationModel.id == null) {

                        //console.log('key: %s, validationType: %s, value: %s',  $scope.ngValidationModel.key, $scope.ngValidationModel.validationType, $scope.ngValidationModel.value)
                        $scope.ngValidationModel.validationType = $scope.validateType;
                        $scope.ngValidationModel.id = eid;
                        //валидация зависит от поля
                        $scope.ngValidationModel.dependsOnField = $scope.dependsOn;
                    }
                }
            }

            //мониторим изменения ngModel
            $scope.$watch('ngValidationModel.value', function (newVal, oldVal) {
                updateAttrId(newVal);
                //console.log('validateEventsDir watch: val: ' + newVal);

                //validateThrottled();
            });

            $scope.$on('$destroy', function () {
                $elem.off();
            });
        }
    };
}]);

//innaAppDirectives.directive('onTouch', function () {
//    return {
//        restrict: 'A',
//        link: function (scope, elm, attrs) {
//            var ontouchFn = scope.$eval(attrs.onTouch);
//            elm.bind('touchstart', function (evt) {
//                scope.$apply(function () {
//                    ontouchFn.call(scope, evt.which);
//                });
//            });
//            elm.bind('click', function (evt) {
//                scope.$apply(function () {
//                    ontouchFn.call(scope, evt.which);
//                });
//            });
//        }
//    };
//});
