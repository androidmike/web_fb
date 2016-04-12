angular.module('angularfireSlackApp')
  .controller('ChannelsCtrl', function ($state, $firebaseArray, Auth, Users, profile, channels, FirebaseUrl) {

    var channelsCtrl = this;

    var usersRef = new Firebase(FirebaseUrl + 'users');
    var usersArray = $firebaseArray(usersRef);

    channelsCtrl.profile = profile;
    channelsCtrl.channels = channels;

    channelsCtrl.getDisplayName = Users.getDisplayName;
    channelsCtrl.getGravatar = Users.getGravatar;


    channelsCtrl.users = Users.all;

    Users.setOnline(channelsCtrl.profile.$id);

    channelsCtrl.newChannel = {
      name: 'New Group'
    };


    var channelsRef = new Firebase(FirebaseUrl + 'channels');
  var   channelsArray = $firebaseArray(channelsRef);

    channelsCtrl.isSlackChannel = function (channelId) {
      //console.log(channelId);
      if (channelsArray.$getRecord(channelId)) {
        return channelsArray.$getRecord(channelId).is_slack;
      }
      return false;
    };
    channelsCtrl.getChannelName = function (channelId) {

      if (channelsArray.$getRecord(channelId)) {
        return channelsArray.$getRecord(channelId).name;
      } else {
        return 'error';
      }
    };
    channelsCtrl.getDisplayName = function (channelId) {

      if (channelsArray.$getRecord(channelId)) {
        return channelsArray.$getRecord(channelId).name;
      } else {
        //debugger;
        return 'error';
      }
    };

    channelsCtrl.createChannel = function () {
      channelsArray.$add({name: channelsCtrl.newChannel.name}).then(function (ref) {
        $state.go('channels.home', {channelId: ref.key()});
        usersRef.child(channelsCtrl.profile.$id).child('channels').child(ref.key()).update({joined: (new Date).getTime()});
      });
    };

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
