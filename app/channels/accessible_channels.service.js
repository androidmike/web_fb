angular.module('angularfireSlackApp')
  .factory('AccessibleChannels', function (Auth, $firebaseArray, FirebaseUrl) {
    var ref = new Firebase(FirebaseUrl + 'users').child(Auth.$getAuth().uid).child("channels");
    var channels = $firebaseArray(ref);
    return channels;
  });
