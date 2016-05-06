angular.module('angularfireSlackApp')
  .controller('ChannelsCtrl', function ($rootScope, $window, $http, $state, $firebaseArray, Auth, Users, profile, channels, FirebaseUrl) {

    var channelsCtrl = this;
    var usersRef = new Firebase(FirebaseUrl + 'users');
    var usersArray = $firebaseArray(usersRef);

    channelsCtrl.profile = profile;
    channelsCtrl.channels = channels;

    channelsCtrl.getDisplayName = Users.getDisplayName;
    channelsCtrl.getGravatar = Users.getGravatar;


    channelsCtrl.users = Users.all;

    var channelsRef = new Firebase(FirebaseUrl + 'channels');
    var channelsArray = $firebaseArray(channelsRef);
    //channelsCtrl.draftChannelId;


    var currentUserRef = usersRef.child(Auth.$getAuth().uid);
    currentUserRef.once('value', function(snap) {
      channelsCtrl.draftsId = snap.val().private_channel;
    });


    Users.setOnline(channelsCtrl.profile.$id);

    channelsCtrl.newChannel = {
      name: 'New Group'
    };


    channelsCtrl.toggleNav = function () {
      navbarCollapsed = !navbarCollapsed;
    }
    channelsCtrl.isSlackChannel = function (channelId) {
      //console.log(channelId);
      if (channelsArray.$getRecord(channelId)) {
        return channelsArray.$getRecord(channelId).is_slack;
      }
      return false;
    };
    var currentChannel;
    channelsCtrl.isFirstChannel = function (name) {
      if (currentChannel != name) {
        currentChannel = name;
        return true;
      }
      return false;
      //channelsCtrl.getTeamName(channelsCtrl.channels[$index].$id);
    }
    channelsCtrl.getChannelName = function (channelId) {

      if (channelsArray.$getRecord(channelId)) {
        return channelsArray.$getRecord(channelId).name;
      } else {
        return 'error';
      }
    };

    channelsCtrl.getTeamId = function (channelId) {

      if (channelsArray.$getRecord(channelId) && channelsArray.$getRecord(channelId).team_id) {
        return channelsArray.$getRecord(channelId).team_id;
      } else {
        return "";
      }
    };
    channelsCtrl.getTeamName = function (channelId) {

      if (channelsArray.$getRecord(channelId) && channelsArray.$getRecord(channelId).team_name) {
        return channelsArray.$getRecord(channelId).team_name;
      } else {
        return "Groups";
      }
    };

    channelsCtrl.createChannel = function () {
      channelsArray.$add({name: channelsCtrl.newChannel.name}).then(function (ref) {
        $state.go('channels.home', {channelId: ref.key()});
        usersRef.child(channelsCtrl.profile.$id).child('channels').child(ref.key()).update({joined: (new Date).getTime()});
      });
    };

    channelsCtrl.addTeam = function () {
      $window.location.href = $rootScope.api_base_endpoint +
        "login?uid=" + Auth.$getAuth().uid +
        "&redirect_uri=" + $rootScope.api_base_endpoint + "callback";
    }

    channelsCtrl.logout = function () {
      channelsCtrl.profile.online = null;
      channelsCtrl.profile.$save().then(function () {
        Auth.$unauth();
        $state.go('home');
      });
    };

    channelsCtrl.goToNote = function (pid, note) {
      $state.go('channels.note', {
        noteId: note.$id,
        channelId: pid
      });
    }
  });
