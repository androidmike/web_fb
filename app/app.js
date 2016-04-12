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
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'home/home.html',
        resolve: {
          requireNoAuth: function ($state, Auth) {
            return Auth.$requireAuth().then(function (auth) {
              $state.go('channels');
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
          //requireNoAuth: function ($state, Auth) {
          //  return Auth.$requireAuth().then(function (auth) {
          //   //$state.go('');
          //    });
          //  }, function (error) {
          //    //$state.go('home');
          //  });
          //},

          //profile: function (Users, Auth) {
          //  return Auth.$requireAuth().then(function (auth) {
          //    return Users.getProfile(auth.uid).$loaded();
          //  });
          //}
        }
      })
      .state('channels', {
        url: '/channels',
        controller: 'ChannelsCtrl as channelsCtrl',
        templateUrl: 'channels/index.html',
        resolve: {
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
        templateUrl: 'channels/workspace.html',
        controller: 'MessagesCtrl as messagesCtrl',
        resolve: {
          messages: function ($stateParams, Messages) {
            return Messages.forChannel($stateParams.channelId).$loaded();
          },
          channelName: function ($stateParams, Channels) {
            return '#' + Channels.$getRecord($stateParams.channelId).name;
          },
          channelId: function ($stateParams) {
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
            return Channels.$getRecord($stateParams.channelId).name;
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
          }
        }
      })

      .state('channels.direct', {
        url: '/{uid}/messages/direct',
        templateUrl: 'channels/workspace.html',
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
      });

    $urlRouterProvider.otherwise('/');
  })
  .constant('FirebaseUrl', 'https://pingpad.firebaseio.com/');
