'use strict';

/**
 * @ngdoc overview
 * @name angularfireSlackApp
 * @description
 * # angularfireSlackApp
 *
 * Main module of the application.
 */

angular
  .module('angularfireSlackApp', [
    'firebase',
    'angular-md5',
    'ui.router'
  ])
  .run(function($rootScope) {
    $rootScope.$on("$stateChangeError", console.log.bind(console));
    $rootScope.RUN_LOCAL = false;
    $rootScope.api_base_endpoint = $rootScope.RUN_LOCAL ? "http://0.0.0.0:8080/": "https://stone-ground-88022.appspot.com/";
    //$rootScope.api_base_endpoint = "https://stone-ground-88022.appspot.com/";
  })
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'home/home.html',
        resolve: {
          requireNoAuth: function ($state, Auth) {
            return Auth.$requireAuth().then(function (auth) {
              $state.go('channels.home', {channelId: 0});
            }, function (error) {
              return;
            });
          }
        }
      })
      .state('login', {
        url: '/login',
        controller: 'AuthCtrl as authCtrl',
        templateUrl: 'auth/login.html',
        resolve: {
          requireNoAuth: function ($state, Auth) {
            return Auth.$requireAuth().then(function (auth) {
              $state.go('home');
            }, function (error) {
              return;
            });
          }
        }
      })
      .state('register', {
        url: '/register',
        controller: 'AuthCtrl as authCtrl',
        params: { auth_type: 'default', auth_token: null},
        templateUrl: 'auth/register.html',
        resolve: {
          requireNoAuth: function ($state, Auth) {
            return Auth.$requireAuth().then(function (auth) {
              $state.go('home');
            }, function (error) {
              return;
            });
          }
        },

      })
      .state('profile', {
        url: '/profile',
        //controller: 'ProfileCtrl as profileCtrl',
        controller: 'ProfileCtrl as profileCtrl',
        templateUrl: 'users/profile.html',
        resolve: {
          auth: function ($state, Users, Auth) {
            return Auth.$requireAuth().catch(function () {
              $state.go('home');
            });
          },
          profile: function (Users, Auth) {
            return Auth.$requireAuth().then(function (auth) {
              return Users.getProfile(auth.uid).$loaded();
            });
          }
        }
      })
      .state('slack', {
        url: '/slack',
        controller: 'SlackCtrl as slackCtrl',
        templateUrl: 'slack/callback.html',
        resolve: {
        }
      })
      .state('slack_error', {
        url: '/slack_error',
        controller: 'SlackCtrl as slackCtrl',
        templateUrl: 'slack/auth_error.html',
        resolve: {
        }
      })
      .state('channels', {
        url: '/channels',
        controller: 'ChannelsCtrl as channelsCtrl',
        templateUrl: 'channels/index.html',
        resolve: {
          auth: function ($state, Users, Auth) {
            return Auth.$requireAuth().catch(function () {
              $state.go('home');
            });
          },
          channels: function (AccessibleChannels) {
            return AccessibleChannels.$loaded();
          },
          profile: function ($state, Auth, Users) {

            return Auth.$requireAuth().then(function (auth) {
              return Users.getProfile(auth.uid).$loaded().then(function (profile) {
                if (profile.displayName) {
                  return profile;
                } else {
                  $state.go('profile');
                }
              });
            }, function (error) {
              $state.go('home');
            });
          },
          channelId: function(AccessibleChannels) {
            console.log(AccessibleChannels.$loaded());
            return AccessibleChannels.$loaded()[0];
          }
        }
      })

      .state('channels.create', {
        url: '/create',
        templateUrl: 'channels/create.html',
        controller: 'ChannelsCtrl as channelsCtrl'
      })

      .state('channels.home', {
        url: '/{channelId}',
        templateUrl: 'channels/note-listing.html',
        controller: 'MessagesCtrl as messagesCtrl',
        resolve: {
          messages: function ($stateParams, Messages) {
            return Messages.forChannel($stateParams.channelId).$loaded();
          },
          channelName: function ($stateParams, Channels) {
            //return '#' + Channels.$getRecord($stateParams.channelId).name;
            return "";
          },
          channelId: function ($stateParams) {
            //console.log("$stateParams.channelId");
            //console.log($stateParams.channelId);
            return $stateParams.channelId;
          },
          notes: function ($stateParams, Notes) {
            return Notes.forChannel($stateParams.channelId).$loaded();
          }
        }
      })

      .state('channels.note', {
        url: '/{channelId}/note/{noteId}',
        templateUrl: 'note/note.html',
        controller: 'NoteCtrl as noteCtrl',
        resolve: {
          messages: function ($stateParams, Messages) {
            return Messages.forChannel($stateParams.channelId).$loaded();
          },
          channelName: function ($stateParams, Channels) {
            //return '#' + Channels.$getRecord($stateParams.channelId).name;
            return "";
          },
          channelId: function ($stateParams) {
            return $stateParams.channelId;
          },
          notes: function ($stateParams, Notes) {
            return Notes.forChannel($stateParams.channelId).$loaded();
          },
          noteId: function ($stateParams) {
            return $stateParams.noteId;
          },
          title: function ($stateParams, notes) {
            var title = notes.$getRecord($stateParams.noteId).title;
            if (!title) {
              title = "New Note";

            }
            return title;
          },
          fileUrl: function ($stateParams, notes) {

            var fileUrl = notes.$getRecord($stateParams.noteId).file_url;

            return fileUrl;
          },
          thumb: function ($stateParams, notes) {

            var fileUrl = notes.$getRecord($stateParams.noteId).thumb_80;

            return fileUrl;
          }
        }
      })

      .state('channels.direct', {
        url: '/{uid}/messages/direct',
        templateUrl: 'channels/note-listing.html',
        controller: 'MessagesCtrl as messagesCtrl',
        resolve: {
          messages: function ($stateParams, Messages, profile) {
            return Messages.forUsers($stateParams.uid, profile.$id).$loaded();
          },
          channelName: function ($stateParams, Users) {
            return Users.all.$loaded().then(function () {
              return '@' + Users.getDisplayName($stateParams.uid);
            });
          }
        }
      })

    $urlRouterProvider.otherwise('/');
  })
  .constant('FirebaseUrl', 'https://pingpad.firebaseio.com/');

