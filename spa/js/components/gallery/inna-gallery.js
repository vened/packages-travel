angular.module('innaApp.directives')
    .directive('innaGallery', ['$templateCache', function($templateCache){
        return {
            template: $templateCache.get('components/gallery/templ/gallery.html'),
            scope: {
                urls: '=innaGalleryPicList'
            },
            controller: [
                '$scope',
                function ($scope) {
                    var MAX_WIDTH = 960,
                        MAX_HEIGHT = 480,
                        MIN_WIDTH = 800,
                        MIN_LENGTH = 2;

                    /*Models*/
                    function PicList(){
                        this.list = [];
                        this.current = null;
                        this.plan = null;
                    }

                    PicList.PLAN_Z = 'Z';
                    PicList.PLAN_Y = 'Y';

                    PicList.prototype.setCurrent = function(pic){
                        this.current = pic;
                    };

                    PicList.prototype.isCurrent = function(pic) {
                        return this.current == pic;
                    };

                    PicList.prototype.next = function(){
                        var index = this.list.indexOf(this.current) + 1;

                        if(index >= this.list.length) index = 0;

                        this.setCurrent(this.list[index]);
                    };

                    PicList.prototype.prev = function(){
                        var index = this.list.indexOf(this.current) - 1;

                        if(index < 0) index = this.list.length - 1;

                        this.setCurrent(this.list[index]);
                    };

                    $scope.pics = new PicList();

                    $scope.isFullWL = window.partners ? window.partners.isFullWL() : false;

                    /**
                     *
                     * @returns {*}
                     */
                    $scope.getViewportStyle = function(){
                        if(!$scope.pics.current) return {};

                        var style = {
                            backgroundImage: 'url(~)'.split('~').join($scope.pics.current.src)
                        }

                        if($scope.pics.plan == PicList.PLAN_Z) {
                            style.width = MAX_WIDTH;
                            style.height = MAX_HEIGHT;
                        } else if ($scope.pics.plan == PicList.PLAN_Y) {
                            style.width = $scope.pics.current.width;
                            style.height = $scope.pics.current.height;
                        } else {
                            return {};
                        }

                        return style;
                    };

                    /*Watchers*/
                    $scope.$watch('urls', function(val){
                        var loaded = new $.Deferred();
                        var BaseUrl = val.BaseUrl;

                        function buildPicList(sizeName, Fn){
                            var deffereds = [];

                            $scope.pics.list = [];

                            $scope.urls[sizeName].forEach(function(pic, _index){
                                var deferred = new $.Deferred();

                                deffereds.push(deferred.promise());

                                var newPic = new Image();

                                newPic.onload = function(){
                                    if(Fn(newPic)) {
                                        $scope.pics.list.push(newPic);
                                    }

                                    deferred.resolve();
                                };

                                newPic.onerror = function(){
                                    deferred.resolve();
                                };

                                newPic.src = (BaseUrl + pic);

                                newPic.__order = _index;
                            });

                            return deffereds;
                        }

                        function planZ(){
                            return buildPicList('LargePhotos', function(pic){
                                var isHorizontal = (pic.width >= pic.height);
                                var largeEnough = (pic.width > MIN_WIDTH);

                                return isHorizontal && largeEnough;
                            });
                        }

                        function planY(){
                            return buildPicList('MediumPhotos', function(pic){
                                var isHorizontal = (pic.width > pic.height); // exactly GT, not GE
                                var smallEnough = pic.height < MAX_HEIGHT;

                                return isHorizontal && smallEnough;
                            });
                        }

                        $.when.apply($, planZ()).then(function(){
                            if($scope.pics.list.length >= MIN_LENGTH) {
                                loaded.resolveWith(null, [PicList.PLAN_Z]);
                            } else {
                                $.whenAll(planY()).then(function(){
                                    loaded.resolveWith(null, [PicList.PLAN_Y]);
                                });
                            }
                        });

                        $.when(loaded).then(function(plan){
                            $scope.pics.list.sort(function(p1, p2){
                                return p1.__order - p2.__order;
                            });

                            // TODO : what is the fuck ?
                            $scope.pics.list.splice(13, $scope.pics.list.length - 13);

                            $scope.$apply(function(){
                                try{
                                    $scope.pics.setCurrent($scope.pics.list[0]);
                                    $scope.pics.plan = plan;
                                } catch(e) {}
                            });
                        });
                    });
                }
            ]
        }
    }]);