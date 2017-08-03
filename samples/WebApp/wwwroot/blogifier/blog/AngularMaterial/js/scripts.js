angular.module('angularMaterialApp', ['ngMaterial', 'ui.router', 'ngAnimate'])

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
            url: '/category/:category/:page',
            component: 'postsList',
            resolve: {
                config: ['$stateParams', function ($stateParams) {
                    return {
                        type: 'category',
                        category: $stateParams.category,
                        page: $stateParams.page,
                        url: '/blogifier/api/public/posts/category/' + $stateParams.category + '?page={{page }}'
                    }
                }]
            },
            params: {
                page: {
                    value: '1'
                }
            }
        });
        $stateProvider.state('authorcategory', {
            url: '/authorcategory/:author/:category/:page',
            component: 'postsList',
            resolve: {
                config: ['$stateParams', function ($stateParams) {
                    return {
                        type: 'authorcategory',
                        author: $stateParams.author,
                        category: $stateParams.category,
                        page: $stateParams.page,
                        url: '/blogifier/api/public/posts/authorcategory/' + $stateParams.author + '/' + $stateParams.category + '?page={{page }}'
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

    .controller('angularMaterialAppController', ['$log', '$scope', '$rootScope', '$mdSidenav', '$state', '$stateParams', '$transitions', '$http', '$mdMedia', function ($log, $scope, $rootScope, $mdSidenav, $state, $stateParams, $transitions, $http, $mdMedia) {

        $rootScope.blogSettings = {};
        $scope.$mdMedia = $mdMedia;
        var $window = $(window);

        $scope.blogsearch = false;
        $scope.categoryMenuVisible = false;
        $scope.selectedCategoryNavItemIndex = -1;

        $transitions.onStart({}, function () {
            $window.scrollTop(0);
            $('#load-progress').show();
            $scope.toggleCategoryMenu(false);
            $scope.selectedCategoryNavItemIndex = -1;
        });

        $scope.toggleCategoryMenu = function(bShow) {
            $scope.categoryMenuVisible = bShow;
            if (bShow) {
                setTimeout(function () {
                    // sometimes there is a bug where the tabs don't get the appropriate size, so trigger a resize
                    $('md-pagination-wrapper').trigger('resize');
                }, 100);
            }
        }

        function updateSelectedCategoryIndex(slug) {
            if ($rootScope.categories) {
                for (var catIndex = 0; catIndex < $rootScope.categories.length; catIndex++) {
                    if (slug == $rootScope.categories[catIndex].slug) {                       
                        $scope.selectedCategoryNavItemIndex = catIndex;
                        break;
                    }
                }
            }
            else {
                // categories may not have loaded yet, so try again in a bit
                setTimeout(function () {
                    updateSelectedCategoryIndex(slug);
                    $scope.$apply();
                }, 100);
            }
        };

        $transitions.onEnter({ to: 'authorcategory' }, function (trans) {
            $scope.toggleCategoryMenu(true);
            updateSelectedCategoryIndex(trans.params().slug);
        });

        $transitions.onEnter({ to: 'category' }, function (trans) {
            $scope.toggleCategoryMenu(true);
            updateSelectedCategoryIndex(trans.params().slug);
        });

        $scope.$on('loadComplete', function () {
            $('#load-progress').hide();
        });

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
            $scope.navigate(targetState, pObj);
            $mdSidenav(sidenavId).close();
        };

        $scope.menuNavigate = function (menuId, targetState, pObj) {
            $scope.navigate(targetState, pObj);
        }

        $scope.navigate = function (targetState, pObj) {
            $state.go(targetState, pObj);
        }

        $window.on('scroll', function () {
            $scope.$apply(function () {
                $scope.scrollY = $window.scrollTop();
            });
        });

        $scope.scrollToTop = function () {
            $("html, body").animate({ scrollTop: 0 }, "slow");
        };

        $scope.loadCategories = function (author) {

            var url = author ? '/blogifier/api/public/categories/' + author : '/blogifier/api/public/categories';

            $http({
                method: 'GET',
                url: url
            }).then(function successCallback(response) {
                $rootScope.categories = response.data;  
            }, function errorCallback(response) {

            });
        };

        var $header = $('.blog-header h1');
        $header.textillate({
            in: {
                effect: 'fadeInLeftBig',
                reverse: true,
                callback: function () {
                    $('.blog-header hr').animate({ width: '70%', opacity: 1 }, 'slow');
                    setTimeout(function () {
                        $('.blog-description').animate({ opacity: 1 }, 'slow');
                    }, 1000);
                }
            }
        });

        $scope.loadCategories($rootScope.blogSettings.author);

        if (!window.location.hash) {
            $state.go('home', { page: 1 });
        }
    }])

    .component('postsList', {
        bindings: {
            config: '<'
        },
        templateUrl: '/blogifier/blog/AngularMaterial/templates/posts-list.tpl.html',
        controller: ['$http', '$element', '$scope', '$rootScope', function ($http, $element, $scope, $rootScope) {
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
                                ctrl.featuredPosts = response.data.posts.slice(0, 2);
                                ctrl.posts = response.data.posts.slice(2);
                                break;
                            default:
                                ctrl.posts = response.data.posts;
                                break;
                        }

                        switch (ctrl.config.type) {
                            case 'authorcategory':
                            case 'category':
                                if ($rootScope.categories) {
                                    var categoryName = '';
                                    for (var catCount = 0; catCount < $rootScope.categories.length; catCount++) {
                                        var cat = $rootScope.categories[catCount];
                                        if (cat.slug == ctrl.config.category) {
                                            categoryName = cat.title;
                                            break;
                                        }
                                    }
                                    if (categoryName) {
                                        ctrl.header = 'Showing posts in category: ' + categoryName;
                                    }
                                }                                
                                break;
                            case 'search':
                                ctrl.header = 'Showing search results for: ' + ctrl.config.slug;
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
            $window.on('scroll', function () {
                var $moreElement = $('#show-more-posts');
                if (ctrl.state == 'done' && $moreElement.length) {
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
        controller: ['$http', '$sce', '$scope', '$rootScope', function ($http, $sce, $scope, $rootScope) {
            this.state = 'init';
            var ctrl = this;

            var loadPost = function (url) {
                $http({
                    method: 'GET',
                    url: url
                }).then(function successCallback(response) {
                    if (response.data) {
                        ctrl.post = response.data.blogPost;
                        var categories = [];
                        if (response.data.blogCategories) {
                            for (var i = 0; i < response.data.blogCategories.length; i++) {
                                var cat = response.data.blogCategories[i];
                                categories.push({
                                    text: cat.text,
                                    slug: cat.value
                                });
                            }
                        }
                        ctrl.categories = categories;
                        ctrl.state = 'done';
                        $scope.$emit('loadComplete');
                    }
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