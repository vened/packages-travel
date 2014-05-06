angular.module('innaApp.services')
    .factory('AjaxHelper', [
        function(){
            var ajax = {};
            var cache = {};

            function doAjax(options) {
                return $.ajax(options);
            }

            function buildOptions(url, data, method, async) {
                return {
                    url: url,
                    type: method,
                    dataType: 'json',
                    traditional: true,
                    data: data,
                    xhrFields: { withCredentials: true },
                    crossDomain: true,
                    async: typeof async !== 'undefined' ? async : true,

                    eol: null
                }
            }

            ajax.get = function (url, data, success, error, async) {
                var request = doAjax(buildOptions(url, data, 'GET', async));

                request.done(success || angular.noop).fail(error || angular.noop);

                return request;
            };

            ajax.post = function (url, data, success, error, async) {
                var request = doAjax(buildOptions(url, data, 'POST', async));

                request.done(success || angular.noop).fail(error || angular.noop);

                return request;
            };

            ajax.getDebounced = function (url, data, success, error, async) {
                if(cache[url]) {
                    cache[url].abort();
                }

                var req = ajax.get(url, data, success, error, async).always(function(){
                    delete cache[url];
                });

                cache[url] = req;

                return req;
            };

            ajax.postDebaunced = function (url, data, success, error, async) {
                if(cache[url]) {
                    cache[url].abort();
                }

                var req = ajax.post(url, data, success, error, async).always(function(){
                    delete cache[url];
                });

                cache[url] = req;

                return req;
            };

            return ajax;
        }
    ])