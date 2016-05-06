angular.module('angularfireSlackApp')
  .controller('AuthCtrl', function (FirebaseUrl, Auth, $state, $stateParams) {
    var authCtrl = this;
    var usersRef = new Firebase(FirebaseUrl + 'users');
    authCtrl.user = {
      email: '',
      password: ''
    };

    authCtrl.login = function () {
      Auth.$authWithPassword(authCtrl.user).then(function (auth) {
        $state.go('home');
        if (Auth.$getAuth()) {
          var userRef = usersRef.child(Auth.$getAuth().uid);
          var slackToken = $stateParams.slack_token;
          userRef.update({slack_token: slackToken});

          window.Intercom("boot", {
            app_id: fke30fr8,
            name: "Jane Doe", // Full name
            email: "customer@example.com", // Email address
            created_at: 1312182000 // Signup date as a Unix timestamp
          });

        } else {
          // TODO LOG ERROR, go to right tsate
        }
      }, function (error) {
        authCtrl.error = error;
      });
    };

    authCtrl.register = function () {


      Auth.$createUser(authCtrl.user).then(function (user) {
        authCtrl.login();
      }, function (error) {
        authCtrl.error = error;
      });
    };

    authCtrl.authorizeSlack = function () {
      location.href = 'https://slack.com/oauth/authorize?client_id=2171299541.26487815974&scope=channels:write';
    };
  });
