﻿angular.module('angularMaterialApp', ['ngMaterial', 'ui.router', 'ngAnimate'])

    .filter('unsafe', ['$sce', function ($sce) {
        return $sce.trustAsHtml;
    }])

    .config(['$mdIconProvider', '$stateProvider', function ($mdIconProvider, $stateProvider) {

        var shareIconPath = '/blogifier/blog/AngularMaterial/images/share/';

        $mdIconProvider
            .icon('Facebook', shareIconPath + 'facebook.svg', 24)
            .icon('Google', shareIconPath + 'google.svg', 24)
            .icon('Twitter', shareIconPath + 'twitter.svg', 24)
            .icon('Github', shareIconPath + 'github.svg', 24)
            .icon('Instagram', shareIconPath + 'instagram.svg', 24)
            .icon('LinkedIn', shareIconPath + 'linkedin.svg', 24);

        $stateProvider.state('home', {
            url: '/home/:page',
            component: 'postsList',
            resolve: {
                config: ['$stateParams', function ($stateParams) {
                    return {
                        type: 'home',
                        page: $stateParams.page,
                        url: '/blogifier/api/public/posts?page={{page}}'
                    }
                }]
            }
        });
        $stateProvider.state('post', {
            url: '/post/:slug',
            component: 'post',
            resolve: {
                config: ['$stateParams', function ($stateParams) {
                    return {
                        type: 'post',
                        slug: $stateParams.slug,
                        url: '/blogifier/api/public/posts/post/' + $stateParams.slug
                    }
                }]
            }
        });
        $stateProvider.state('category', {
            url: '/category/:slug/:page',
            component: 'postsList',
            resolve: {
                config: ['$stateParams', function ($stateParams) {
                    return {
                        type: 'category',
                        page: $stateParams.page,
                        slug: $stateParams.slug,
                        url: '/blogifier/api/public/posts/category/' + $stateParams.slug + '?page={{page}}'
                    }
                }]
            },
            params: {
                page: {
                    value: '1'
                }
            }
        });
        $stateProvider.state('author', {
            url: '/author/:slug/:page',
            component: 'postsList',
            resolve: {
                config: ['$stateParams', function ($stateParams) {
                    return {
                        type: 'author',
                        page: $stateParams.page,
                        slug: $stateParams.slug,
                        url: '/blogifier/api/public/posts/author/' + $stateParams.slug + '?page={{page}}'
                    }
                }]
            },
            params: {
                page: {
                    value: '1'
                }
            }
        });
        $stateProvider.state('search', {
            url: '/search/:page/:slug',
            component: 'postsList',
            resolve: {
                config: ['$stateParams', function ($stateParams) {
                    return {
                        type: 'search',
                        page: $stateParams.page,
                        slug: $stateParams.slug,
                        url: '/blogifier/api/public/posts/search/' + $stateParams.slug + '?page={{page}}'
                    }
                }]
            },
            params: {
                page: {
                    value: '1'
                }
            }
        });
    }])

    .controller('angularMaterialAppController', ['$log', '$scope', '$rootScope', '$mdSidenav', '$state', '$transitions', '$http', '$mdMedia', function ($log, $scope, $rootScope, $mdSidenav, $state, $transitions, $http, $mdMedia) {

        $rootScope.blogSettings = {};
        $scope.$mdMedia = $mdMedia;
        var $window = $(window);

        $transitions.onStart({}, function () {
            $window.scrollTop(0);
            $('#load-progress').show();
        });
        $scope.$on('loadComplete', function () {
            $('#load-progress').hide();
        });

        $scope.blogsearch = false;
        $scope.showSearch = function () {
            $scope.blogsearch = true;
            setTimeout(function () {
                $('#term').val('').focus();
            }, 100);
        }
        $('#term').keydown(function (evt) {
            if (evt.which == 13) {
                var query = $(this).val();                
                $state.go("search", { page: '1', slug: query });
                $scope.blogsearch = false;
                evt.preventDefault();
                evt.stopPropagation();
                $mdSidenav('left-menu').close();
            }
        });

        $scope.profileLogOut = function () {
            $("#frmLogOut").submit();
        };
        $scope.openSidenav = function (id) {
            $mdSidenav(id).toggle();
        };

        $scope.sidenavNavigate = function (sidenavId, targetState, pObj) {
            $state.go(targetState, pObj);
            $mdSidenav(sidenavId).close();
        };

        $window.on('scroll', function () {
            $scope.$apply(function () {
                $scope.scrollY = $window.scrollTop();
            });
        });

        $scope.scrollToTop = function () {
            $("html, body").animate({ scrollTop: 0 }, "slow");
        };

        $scope.loadCategories = function (author) {

            var url = author ? '/blogifier/api/public/' + author + '/categories' : '/blogifier/api/public/categories';

            $http({
                method: 'GET',
                url: url
            }).then(function successCallback(response) {
                $scope.categories = response.data;
            }, function errorCallback(response) {

            });
        };

        $scope.loadCategories();

        if (!window.location.hash) {
            $state.go('home', { page: 1 });
        }
    }])

    .component('postsList', {
        bindings: {
            config: '<'
        },
        templateUrl: '/blogifier/blog/AngularMaterial/templates/posts-list.tpl.html',
        controller: ['$http', '$element', '$scope', function ($http, $element, $scope) {
            this.state = 'init';
            var ctrl = this;

            $element.addClass('layout-column flex');

            var loadPosts = function (url) {
                $http({
                    method: 'GET',
                    url: url
                }).then(function successCallback(response) {
                    if (ctrl.posts) {
                        // posts added using 'show more posts'
                        for (var i = 0; i < response.data.posts.length; i++) {
                            ctrl.posts.push(response.data.posts[i]);
                        }
                    }
                    else {
                        // new posts
                        switch (ctrl.config.type) {
                            case 'home':
                            case 'author':
                                // set up featured posts
                                ctrl.featuredPosts = response.data.posts.slice(0, 3);
                                ctrl.posts = response.data.posts.slice(3);
                                break;
                            default:
                                ctrl.posts = response.data.posts;
                                break;
                        }

                        switch (ctrl.config.type) {
                            case 'category':
                                ctrl.header = 'Posts in category: ' + $('[data-categorySlug="' + ctrl.config.slug + '"]').text();
                                break;
                            case 'search':
                                ctrl.header = 'Search results for: ' + ctrl.config.slug;
                                break;
                            default:
                                ctrl.header = undefined;
                                break;
                        }
                    }
                    ctrl.pager = response.data.pager;

                    if (ctrl.pager && ctrl.pager.showOlder) {
                        ctrl.moreUrl = ctrl.config.url.split('{{page}}').join(ctrl.pager.older);
                    }
                    else {
                        ctrl.moreUrl = undefined;
                    }

                    ctrl.state = 'done';
                    $scope.$emit('loadComplete');
                }, function errorCallback(response) {
                    ctrl.state = 'error';
                    $scope.$emit('loadComplete');
                });
            }

            this.$onInit = function () {
                var url = ctrl.config.url.split('{{page}}').join(ctrl.config.page);
                loadPosts(url);
            }

            this.showMore = function () {
                if (ctrl.moreUrl) {
                    ctrl.state = 'more';
                    loadPosts(ctrl.moreUrl);
                }
            }

            var $window = $(window);
            var $moreElement = $('#show-more-posts-div');
            $window.on('scroll', function () {
                if (ctrl.state == 'done') {
                    var bottomOfScreen = $window.scrollTop() + $window.height();
                    var topOfMoreElement = $moreElement.offset().top;

                    if (bottomOfScreen > topOfMoreElement) {
                        ctrl.showMore();
                    }
                }
            });
        }],
        controllerAs: 'postsListCtrl'
    })

    .component('postListItemFeatured', {
        bindings: {
            post: '<'
        },
        templateUrl: '/blogifier/blog/AngularMaterial/templates/post-list-item-featured.tpl.html',
        controller: function () {

        },
        controllerAs: 'postListItemCtrl'
    })

    .component('postListItem', {
        bindings: {
            post: '<'
        },
        templateUrl: '/blogifier/blog/AngularMaterial/templates/post-list-item.tpl.html',
        controller: function () {

        },
        controllerAs: 'postListItemCtrl'
    })

    .component('post', {
        bindings: {
            config: '<'
        },
        templateUrl: '/blogifier/blog/AngularMaterial/templates/post.tpl.html',
        controller: ['$http', '$sce', '$scope', function ($http, $sce, $scope) {
            this.state = 'init';
            var ctrl = this;

            var loadPost = function (url) {
                $http({
                    method: 'GET',
                    url: url
                }).then(function successCallback(response) {
                    ctrl.post = response.data;

                    if (ctrl.post && ctrl.post.postCategories) {
                        var categories = [];
                        for (var i = 0; i < ctrl.post.postCategories.length; i++) {
                            var catId = ctrl.post.postCategories[i].categoryId;
                            var $catElement = $('[data-categoryId="' + catId + '"]');
                            var catText = $catElement.text();
                            var catSlug = $catElement.attr('data-categorySlug');
                            categories.push({
                                text: catText,
                                slug: catSlug
                            });
                        }
                        ctrl.categories = categories;
                    }

                    ctrl.state = 'done';
                    $scope.$emit('loadComplete');
                }, function errorCallback(response) {
                    ctrl.state = 'error';
                    $scope.$emit('loadComplete');
                });
            }

            this.$onInit = function () {
                var url = ctrl.config.url;
                loadPost(url);
            }
        }],
        controllerAs: 'postCtrl'
    })

    .directive('disqusThread', ['$stateParams', '$http', '$compile', '$rootScope', function ($stateParams, $http, $compile, $rootScope) {
        return {
            restrict: 'E',
            link: function (scope, element) {
                var template = '<div id="disqus_thread"></div>';
                template += '<script>';
                template += 'var disqus_identifier = "' + $stateParams.slug + '";';
                template += 'var disqus_url = window.location.protocol + "//" + window.location.host + "/' + $rootScope.blogSettings.blogRoute + $stateParams.slug + '";';
                if (typeof (DISQUS) != "undefined") {
                    template += 'DISQUS.reset({';
                    template += 'reload: true,';
                    template += 'config: function () {';
                    template += 'this.page.identifier = disqus_identifier;';
                    template += 'this.page.url = disqus_url;';
                    template += '}});';
                }
                template += '</script>';
                
                element.append($compile(template)(scope));
            }
        }
    }])

    //.directive('menuToggle', ['$mdUtil', '$animateCss', '$$rAF', function ($mdUtil, $animateCss, $$rAF) {
    .directive('menuToggle', ['$rootScope', function ($rootScope) {
        return {
            scope: {
                label: "@",
                target: "@"
            },
            templateUrl: '/blogifier/blog/AngularMaterial/templates/menu-toggle.tpl.html',
            link: function ($scope, $element) {
                $scope.isOpen = false;
                $scope.toggle = function () {
                    $scope.isOpen = !$scope.isOpen;

                    var $div = $('#' + $scope.target);
                    $div.css('visibility', $scope.isOpen ? 'visible' : 'hidden');
                    $div.attr('aria-hidden', $scope.isOpen ? 'false' : 'true');

                    var targetHeight = $scope.isOpen ? $div[0].scrollHeight : 0;
                    $div.animate({ 'height': targetHeight + 'px' }, 'slow');
                };     

                $scope.$watch('target', function (newValue, oldValue) {
                    if (oldValue) {
                        $('#' + oldValue).removeClass('menu-toggle-list');
                        $('#' + newValue).addClass('menu-toggle-list');
                    }
                });
            }
        };
    }])