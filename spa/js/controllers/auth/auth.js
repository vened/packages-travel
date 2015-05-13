angular.module('innaApp.controllers')
	.controller('AuthCtrl', [
		'$scope',
		'$timeout',
		'$location',
		'aviaHelper',
		'innaAppApiEvents',
		'AuthDataProvider',
		'innaApp.Urls',
		'modelAuth',
		'$route',
		function ($scope, $timeout, $location, aviaHelper, Events, AuthDataProvider, app, modelAuth, $route) {

			/**
			 * партнерка WL
			 */
			var partner = window.partners ? window.partners.getPartner() : null;


			/*Private*/
			var setUserInfo = function (data, needInitLastUserAfterLoginCheck) {
				if (data && data["Email"]) {
					Raven.setUserContext({
						email: data["Email"],
						id   : data["Email"],
						data : data
					});
				}

				$scope.safeApply(function () {
					$scope.$root.user = new modelAuth(data);

					if ($scope.$root.user.isAgency() && !$scope.user.raw.AgencyActive) {
						$scope.logout();
					}

					//проверяем, нужно ли перезагрузить страницу
					if ($scope.reloadChecker) {
						if (needInitLastUserAfterLoginCheck) {//флаг, говорит, что нужно проинициализировать последнего пользователя
							$scope.reloadChecker.saveLastUser();
						}
						$scope.reloadChecker.checkReloadPage();
					}
				});
			}

			/*Methods*/
			$scope.close = function () {
				utils.scrollFix(true)
				$scope.isLoginPopupOpened = false;
				$scope.display = $scope.DISPLAY_SIGNIN;
			};

			$scope.logout = function (silent) {
				var wasLoggedUser = $scope.$root.user;

				$scope.$root.user = null;

				if (!silent) {
					AuthDataProvider.logout(onLogoutCompleteOrError, onLogoutCompleteOrError);

					function onLogoutCompleteOrError() {
						$scope.$emit(Events.AUTH_SIGN_OUT, wasLoggedUser);
					}
				}
			};

			$scope.regOpenClick = function () {
				//================analytics========================
				//Нажатие на ссылку Регистрация/Вход
				track.registrationOpen();
				//================analytics========================
				$scope.open();
			}

			$scope.open = function () {
				utils.scrollFix()
				$scope.isLoginPopupOpened = true;
			};

			//setInterval(function(){
			//    if(!$scope.$root.user){
			//        //$scope.open();
			//        $('.header__user-nav-reg').trigger('click');
			//    }
			//}, 500)

			/**
			 * задача IN-4485
			 * Костыль для спутника, если пользователь не залогинен, показываем ему форму логина всегда и везде
			 */
			if (partner != null && partner.name == 'sputnik') {
				$scope.$root.$watch('user', function (data) {
					console.log('user auth', data);
					if (!data) {
						$scope.open();
					}
				});
			}
			/**
			 * задача - IN-4485
			 * Если у нас партнер спутник, скрываем форму регистрации
			 */
			if (partner != null && partner.name == 'sputnik') {
				$scope.partnerSputnik = true;
			}
			else {
				$scope.partnerSputnik = false;
			}


			$scope.signInWith = function (method) {

				var brokerWindow = window.open(AuthDataProvider.socialBrockerURL(method), "SocialBroker", "width=500,height=500,resizable=yes,scrollbars=no,status=no");

				brokerWindow.focus();

				var socialBrokerListener = $('#social-broker-listener');

				var interval = setInterval(function () {
					var cookieCloser = localStorage.getItem('closeSocialBroker');

					//console.log('cookieCloser', cookieCloser);

					if (cookieCloser) {
						localStorage.setItem('closeSocialBroker', 0);

						login();
					}
				}, 100);

				var login = function () {
					AuthDataProvider.recognize(function (data) {
						console.log('auth success:', method);

						//analytics
						trackLogin(method);

						setUserInfo(data);
						$scope.close();
					}, function (err, data) {
						console.log('auth err:', err, data);
					});

					clearInterval(interval);

					socialBrokerListener.off('inna.Auth.SocialBroker.Result', login);
				};

				function trackLogin(method) {
					switch (method) {
						case 'facebook':
							track.loginFbSuccess();
							break;
						case 'google':
							track.loginGmailSuccess();
							break;
						case 'vkontakte':
							track.loginVkSuccess();
							break;
						case 'twitter':
							track.loginOkSuccess();
							break;
						case 'odnoklassniki':
							track.loginTwSuccess();
							break;
					}
				}

				socialBrokerListener.on('inna.Auth.SocialBroker.Result', login);

				return false;
			};

			$scope.showProfile = function ($event) {
				if ($scope.$root.user) {
					//console.log('user.Type:', $scope.$root.user.getType());
					switch ($scope.$root.user.getType()) {
						case 2:
						{//B2B = 2, b2b.inna.ru
							window.location = $scope.B2B_HOST;
							$event.preventDefault();
							return;
						}
						case 4:
						{//Partner = 4, partner.inna.ru
							window.location = $scope.b2bPartnerHost;
							$event.preventDefault();
							return;
						}
					}

				}

				$scope.open();
				$scope.display = $scope.DISPLAY_PROFILE;
			};

			$scope.forgotten = function () {
				$scope.display = $scope.DISPLAY_FORGOTTEN;
			};

			$scope.goToSignIn = function () {
				$scope.display = $scope.DISPLAY_SIGNIN;
			};

			/*Properties*/
			$scope.restoreToken = ($location.path() == app.URL_AUTH_RESTORE) && $location.search().token;
			$scope.signUpToken = ($location.path() == app.URL_AUTH_SIGNUP) && $location.search().token;

			$scope.DISPLAY_SIGNIN = 1;
			$scope.DISPLAY_FORGOTTEN = 2;
			$scope.DISPLAY_SIGNUP = 3;
			$scope.DISPLAY_PROFILE = 4;

			$scope.isLoginPopupOpened = false;
			
			$scope.display = $scope.DISPLAY_SIGNIN;

			if ($scope.restoreToken) {
				$scope.display = $scope.DISPLAY_FORGOTTEN;
				$scope.open();
			} else if ($scope.signUpToken) {
				$scope.display = $scope.DISPLAY_SIGNUP;
				$scope.open();
			}

			$scope.recognize = function (needInitLastUserAfterLoginCheck) {
				AuthDataProvider.recognize(function (data) {
						setUserInfo(data, needInitLastUserAfterLoginCheck);
					},
					function (err) {
						$scope.safeApply(function () {
							//выходим "по-тихому", без запросов на сервер и генерации события логаута
							$scope.logout(true);

							//проверяем, нужно ли перезагрузить страницу
							if ($scope.reloadChecker) {
								$scope.reloadChecker.checkReloadPage();
							}
						});
					});
			}

			$scope.B2B_HOST = window.DEV && window.DEV_B2B_HOST || app_main.b2bHost;
			$scope.b2bPartnerHost = app_main.b2bPartnerHost;

			/**
			 * говнокод, для правильного редиректа на b2b спутника
			 */
			if (partner != null && partner.name == 'sputnik') {
				$scope.B2B_HOST = $scope.B2B_HOST.replace("b2b", "b2b.sputnik");
			}

			
			/*EventListeners*/
			$scope.$on(Events.AUTH_SIGN_IN, function (event, data) {
				$scope.safeApply(function () {
					setUserInfo(data);
					$scope.close();

					$scope.reloadChecker.saveLastUser();

					if ($scope.$root.user) {
						//console.log('user.Type:', $scope.$root.user.getType());
						switch ($scope.$root.user.getType()) {
							case 2:
							{//B2B = 2, b2b.inna.ru
								window.location = $scope.B2B_HOST;
								break;
							}
							case 4:
							{//Partner = 4, partner.inna.ru
								window.location = $scope.b2bPartnerHost;
								break;
							}
						}

					}
				});
			});

			$scope.$on(Events.AUTH_SIGN_OUT, function (event, userRaw) {
				var user = new modelAuth(userRaw.raw);

				if (user.isAgency() && !user.raw.AgencyActive) {
					$scope.baloon.showErr('Агентство неактивно', 'Вход не возможен', function () {
						window.location = '/';
					});
				} else if (user.isAgency()) {

					window.location = '/';
				}
			});

			/*Initial*/
			$scope.recognize(true);

			//поддержка залогиненности из нескольких вкладок
			function reloadChecker() {
				var self = this;

				self.lastLoginUser = null;

				//events
				self.init = function () {
					$(window).on('focus', function () {
						//тут проверяем авторизацию
						//и если она изменилась - то перезагружаем страницу
						$scope.recognize();
					});
				};

				self.getCurrentUser = function () {
					return ($scope.$root.user && $scope.$root.user.raw) ? $scope.$root.user.raw.Email : null;
				}

				self.saveLastUser = function (curUser) {
					if (curUser == null) {
						curUser = self.getCurrentUser();
					}
					self.lastLoginUser = curUser;
				};

				self.destroy = function () {
					$(window).off('focus');
				}

				self.checkReloadPage = function () {
					var curUser = self.getCurrentUser();
					//console.log('checkReloadPage, curUser: ' + curUser + ' lastLoginUser: ' + self.lastLoginUser);
					//состояние залогиненности изменилось - тригерим событие
					if (self.lastLoginUser != curUser) {
						//решрешим страницу
						$route.reload();
					}
					self.saveLastUser(curUser);
				};

				self.init();
			}

			$scope.reloadChecker = new reloadChecker();


			$scope.$on('$destroy', function () {
				reloadChecker.destroy();
			});
		}
	]);