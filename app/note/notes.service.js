angular.module('angularfireSlackApp')
  .factory('Notes', function($firebaseArray, FirebaseUrl){
    var channelNotesRef = new Firebase(FirebaseUrl+'channelNotes');
    var userNotesRef = new Firebase(FirebaseUrl+'userNotes')

    return {
      forChannel: function(channelId){
        return $firebaseArray(channelNotesRef.child(channelId));
      },
      forUsers: function(uid1, uid2){
        var path = uid1 < uid2 ? uid1+'/'+uid2 : uid2+'/'+uid1;

        return $firebaseArray(userNotesRef.child(path));
      }
    };
  });
