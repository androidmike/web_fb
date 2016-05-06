angular.module('angularfireSlackApp')
  .controller('ProfileCtrl', function($state, md5, auth, profile){
    var profileCtrl = this;

    profileCtrl.profile = profile;

    profileCtrl.updateProfile = function(){
      console.log("Update Profile");
      //profileCtrl.profile.emailHash = md5.createHash(auth.password.email);
      profileCtrl.profile.$save().then(function(){
        $state.go('channels.home');
      });
    };
  });
