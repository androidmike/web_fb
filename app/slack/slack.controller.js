angular.module('angularfireSlackApp')
  .controller('SlackCtrl', function ($http, $state, $firebaseArray, Auth, FirebaseUrl) {
    var ref = new Firebase(FirebaseUrl + 'users');
    var channelsRef = new Firebase(FirebaseUrl + 'channels');
    var slackIndexRef = new Firebase(FirebaseUrl + 'slackUidIndex');
    var channelNotesRef = new Firebase(FirebaseUrl + 'channelNotes');
    var userRef;
    // is logged in
    if (Auth.$getAuth()) {
      userRef = ref.child(Auth.$getAuth().uid);
    }

    //debugger;
    var slackCtrl = this;
    slackCtrl.import = function (teamName) {
      debugger;
      $http({
        method: 'POST',
        url: "https://slack.com/api/channels.list?token=" + slackCtrl.token,
        headers: {
          'Content-Type': undefined
        },
      }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        if (response.data.ok) {
          var channels = response.data.channels;
          var slackChannelId;
          // Run full import of names

          for (i = 0; i < channels.length; i++) {
            slackChannelId = channels[i].id;
            var channelId = slackCtrl.team_id + '_' + slackChannelId;
            var teamId = slackCtrl.team_id;

            slackCtrl.fetchPins(slackChannelId, teamId);
            channelsRef.child(channelId).update({
              name: channels[i].name,
              is_slack: true,
              members_slack_uid: channels[i].members,
              team_name: teamName
            });
            userRef.child("channels").child(channelId).update({
              //is_slack: true,
              synced: (new Date().getTime())
              //name: channels[i].name
            });

          }

        }
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        //debugger;
      });

    }
    slackCtrl.fetchPins = function (slackChannelId, teamId) {
      //debugger;
      var channelId = teamId + '_' + slackChannelId;
      $http({
        method: 'POST',
        url: "https://slack.com/api/pins.list?token=" + slackCtrl.token + "&channel=" + slackChannelId,
        headers: {
          'Content-Type': undefined
        },
      }).then(function successCallback(response) {
        // this callback will be called asynchronously
        if (response.data.ok) {
          //debugger;
          var pins = response.data.items;
          for (var i in pins) {
            if (pins[i].type == 'message') {
              var channelNotes = channelNotesRef.child(channelId).child(pins[i].created).update({
                uid: Auth.$getAuth().uid,
                body: pins[i].message.text,
                channelId: channelId,
                imported: new Date().getTime(),
                type: 'slack_pinned_message',
                title: pins[i].message.text,
                timestamp: Firebase.ServerValue.TIMESTAMP
              });
            } else if (pins[i].type == 'file') {
              debugger;
              var channelNotes = channelNotesRef.child(channelId).child(pins[i].created).update({
                uid: Auth.$getAuth().uid,
                body: pins[i].file.permalink_public,
                channelId: channelId,
                imported: new Date().getTime(),
                type: 'slack_pinned_file',
                title: pins[i].file.title,
                file_url: pins[i].file.permalink_public,
                timestamp: Firebase.ServerValue.TIMESTAMP
              });
            }
          }
        }
      }, function errorCallback(response) {
      });

    }
    slackCtrl.init = function () {
      var params = window.location.search.replace("?", "");
      var code = getUrlVars()["code"];

      function getUrlVars() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
          function (m, key, value) {
            vars[key] = value;
          });
        return vars;
      }

      // Get token with code
      $http({
        method: 'POST',
        url: 'https://slack.com/api/oauth.access?client_id=2171299541.26487815974&client_secret=97560e509518e36b87d75ac9e5165701&code=' + code,
        headers: {
          'Content-Type': undefined
        },
      }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        if (response.data.ok) {

          slackCtrl.token = response.data.access_token;
          slackCtrl.incomingWebHook = response.data.incoming_webhook;
          slackCtrl.bot = response.data.bot;


          // now we have token, find out who the person is:

          if (!Auth.$getAuth()) {
            // Create an account
            $state.transitionTo('register', {slack_token: response.data.access_token});
          } else {
            slackCtrl.onLoggedIn(userRef);
          }

        }
      }, function errorCallback(response) {
        //debugger;
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });

    }

    slackCtrl.onLoggedIn = function (userRef) {
      //debugger;
      //slackCtrl.incomingWebHook.channel_id, configuration_url, url
      userRef.update({slack_token: slackCtrl.token});


      $http({
        method: 'POST',
        url: 'https://slack.com/api/auth.test?token=' + slackCtrl.token,
        headers: {
          'Content-Type': undefined
        },
      }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        if (response.data.ok) {
          userRef.update({slack_user_id: response.data.user_id});
          userRef.update({slack_team_id: response.data.team_id});
          userRef.update({slack_user_name: response.data.user});
          userRef.update({slack_team_name: response.data.team});
          slackIndexRef.child(response.data.user_id).update({uid: Auth.$getAuth().uid});

          slackCtrl.team_id = response.data.team_id;
          slackCtrl.team_name = response.data.team_name;
          slackCtrl.import(response.data.team);
          $state.go('home');
        }
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });


      // Go to a different state

    }
  });
