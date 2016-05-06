angular.module('angularfireSlackApp')
  .controller('MessagesCtrl', function ($state, $http, $firebaseArray, FirebaseUrl, Auth, profile, channelName, channelId, messages, notes) {

    var workspaceCtrl = this;
    workspaceCtrl.messages = messages;
    workspaceCtrl.channelName = channelName;
    workspaceCtrl.channelId = channelId;
    workspaceCtrl.message = '';
    workspaceCtrl.note = '';
    workspaceCtrl.notes = notes;
    workspaceCtrl.slackToken = '';

    var channelsRef = new Firebase(FirebaseUrl + 'channels');
    channelArray = $firebaseArray(channelsRef);

    workspaceCtrl.updateScroll = function () {
      //if (!scrolled) {
      ////debugger;
      //var element = document.getElementById('chat-container');
      ////if (element != null) {
      //  element.scrollTop = element.scrollHeight;
      //}
      ////}
    }

    workspaceCtrl.getChannelName = function (channelId) {
      console.log(channelId);
      return channelArray.$getRecord(channelId).name;
    };

    workspaceCtrl.shareLink = function () {
      //$scope.$window.clipboardData.setData("Text", location.href);
      alert("Link copied to clipboard!");
    }

    workspaceCtrl.createNote = function () {
      workspaceCtrl.note = "New note";

      if (workspaceCtrl.note.length > 0) {
        workspaceCtrl.notes.$add({
          uid: profile.$id,
          body: workspaceCtrl.note,
          channelId: workspaceCtrl.channelId,
          timestamp: Firebase.ServerValue.TIMESTAMP
        }).then(function (ref) {
          var noteId = ref.key();
          workspaceCtrl.note = '';
          workspaceCtrl.goToNote(workspaceCtrl.channelId, noteId);
          var ref = new Firebase(FirebaseUrl + 'users');
          var userRef = ref.child(Auth.$getAuth().uid);
          //workspaceCtrl.slackToken = userRef.

          userRef.on("child_added", function (snapshot) {
            if (snapshot.key() == 'slack_token') {
              workspaceCtrl.slackToken = snapshot.val();

              // Get token with code
              $http({
                method: 'POST',
                url: 'https://slack.com/api/chat.postMessage?as_user=true&token=' + workspaceCtrl.slackToken,
                headers: {
                  'Content-Type': undefined
                },
              }).then(function successCallback(response) {
                // this callback will be called asynchronously
                // when the response is available
                if (response.data.ok) {
                  debugger;
                }
              }, function errorCallback(response) {
                debugger;
                // called asynchronously if an error occurs
                // or server returns response with an error status.
              });

            }
          }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
          });


        });
      }
    };


    workspaceCtrl.sendMessage = function () {
      if (workspaceCtrl.message.length > 0) {
        workspaceCtrl.messages.$add({
          uid: profile.$id,
          body: workspaceCtrl.message,
          timestamp: Firebase.ServerValue.TIMESTAMP
        }).then(function () {
          workspaceCtrl.message = '';
        });
      }
    };

    workspaceCtrl.init = function () {
      var elem = document.querySelector('.grid');
      var msnry = new Masonry(elem, {
        // options
        itemSelector: '.grid-item',
        columnWidth: 250
      });

    }


    workspaceCtrl.goToNote = function (pid, note) {

      $state.go('channels.note', {
        noteId: note,
        channelId: pid
      });
    }

    workspaceCtrl.convertTime = function (seconds) {
      debugger;
        var seconds = Math.floor((new Date() - date) / 1000);

        var interval = Math.floor(seconds / 31536000);

        if (interval > 1) {
          return interval + " years";
        }
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
          return interval + " months";
        }
        interval = Math.floor(seconds / 86400);
        if (interval > 1) {
          return interval + " days";
        }
        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
          return interval + " hours";
        }
        interval = Math.floor(seconds / 60);
        if (interval > 1) {
          return interval + " minutes";
        }
        return Math.floor(seconds) + " seconds";
    }

    workspaceCtrl.isPinnedSlackNote = function (note) {
      debugger;
      return note.type == 'slack_pinned_message';
    }
  });
