'use strict';

innaAppConponents.directive('btnTop', [function () {
    return {
        restrict: 'E',
        replace: true,
        template: "<span " +
            "ng-click='goToTop()' " +
            "ng-style='goToTopStyle' " +
            "class='button button-scroll-to-top'>" +
            "<span class='icon-sprite-arrow-top'></span>Наверх</span>",
        link: function ($scope, $element, attrs) {

            /**
             * листаем страницу наверх
             */
            $scope.goToTop = function () {
                window.scrollTo(0, 0);
            };


            function showGoToTop() {
                $scope.safeApply(function () {
                    $scope.goToTopShow = true;
                })
            }


            function hideGoToTop() {
                $scope.safeApply(function () {
                    $scope.goToTopShow = false;
                })
            }

            var footerEl = document.querySelector(".footer");

            function GoToTopBtn() {
                var footerTop = utils.getCoords(footerEl).top;
                var windowHeight = utils.getScrollTop() + window.innerHeight;
                if (windowHeight > 900) {
                    showGoToTop();
                } else {
                    hideGoToTop();
                }
                var wr = windowHeight - footerTop;
                if (wr > 5) {
                    $scope.safeApply(function () {
                        $scope.goToTopStyle = {
                            'bottom': wr + 'px',
                            'transition': 'bottom 0s'
                        };
                    })
                } else {
                    $scope.safeApply(function () {
                        $scope.goToTopStyle = {
                            'bottom': '0px',
                            'transition': 'bottom .1s'
                        };
                    })
                }
            }


            document.addEventListener('scroll', GoToTopBtn);
            document.addEventListener('resize', function(){
                console.log('adxasdxasx sacdscx')
            });

            setTimeout(GoToTopBtn, 0);


            $scope.$on('$destroy', function () {
            });
        }
    };
}]);