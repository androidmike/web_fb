angular.module('angularfireSlackApp')
  .controller('NoteCtrl', function ($state, profile, channelName, noteId, channelId, messages, notes, title, fileUrl, thumb) {
    var firepad;
    var noteCtrl = this;
    noteCtrl.noteId = noteId;
    noteCtrl.messages = messages;
    noteCtrl.channelName = channelName;
    noteCtrl.channelId = channelId;
    noteCtrl.message = '';
    noteCtrl.note = '';
    noteCtrl.thumb = thumb;
    noteCtrl.fileUrl = fileUrl;
    noteCtrl.notes = notes;
    noteCtrl.profile = profile;
    noteCtrl.title = title;
    noteCtrl.showTitleChangeButton = false;

    var userPresenceRef = new Firebase('https://pingpad.firebaseio.com/userPresence/' + noteCtrl.noteId);
    var firepadRef = new Firebase('https://pingpad.firebaseio.com/notes/' + noteCtrl.noteId);
    var summaryRef = new Firebase('https://pingpad.firebaseio.com/channelNotes/' + noteCtrl.channelId + '/' + noteCtrl.noteId);

    var notificationRef = new Firebase('https://pingpad.firebaseio.com/slackNotifications/' + noteCtrl.channelId + '/' + noteCtrl.noteId);

    noteCtrl.goToChannel = function() {

      $state.go('channels.home', {
        channelId: channelId
      });
    };

    noteCtrl.changeTitle = function () {
      debugger;
      var newTitle = document.getElementById('title_text').innerText;
      if (newTitle === 0) {

        newTitle = '';
      }
      noteCtrl.title = newTitle;
      //newTitle.innerHtml = newTitle;
      summaryRef.update({title: newTitle});
    };
    noteCtrl.addTask = function () {
      //firepad.insertEntity('img', {
      //  src: 'http://cdn.dashburst.com/wp-content/uploads/2013/01/Grumpy-Cat.jpg',
      //  width: 100
      //});
    };

    noteCtrl.init = function () {

      //// Initialize Firebase.
      //// Create CodeMirror (with lineWrapping on).
      var codeMirror = CodeMirror(document.getElementById('firepad'), {lineWrapping: true});

      var authData = firepadRef.getAuth();
      // Create a random ID to use as our user ID (we must give this to firepad and FirepadUserList).
      var userId = authData.uid;

      //// Create Firepad (with rich text features and our desired userId).
      firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
        {richTextToolbar: true, richTextShortcuts: true, userId: userId});

      //// Create FirepadUserList (with our desired userId).
      //var firepadUserList = FirepadUserList.fromDiv(firepadRef.child('users'),
      //  document.getElementById('userlist'), userId, noteCtrl.profile.displayName);

      $('[contenteditable]').on('focus', function() {
        var $this = $(this);
        $this.data('before', $this.html());
        return $this;
      }).on('blur keyup paste', function() {
        var $this = $(this);
        if ($this.data('before') !== $this.html()) {
          $this.data('before', $this.html());
          $this.trigger('change');
        }
        return $this;
      });
      $('[contenteditable]').on('change', function() {
        noteCtrl.changeTitle();
      });
      //// Initialize contents.
      firepad.on('ready', function () {
        if (firepad.isHistoryEmpty()) {
          firepadRef.child('channel_notes').child(channelId).child(noteId).once("value", function (r) {

            }
          );
          //firepad.setText(firepadRef.child('channel_notes').child(channelId).child(noteId).$body);
        }
        //
      });
      firepad.on('synced', function (isSynced) {
        // isSynced will be false immediately after the user edits the pad,
        // and true when their edit has been saved to Firebase.

        var wrapper = document.createElement('html');
        wrapper.innerHTML = firepad.getHtml();
        var tasks = wrapper.getElementsByClassName("firepad-unchecked");

        for (var i = 0; i < tasks.length; i++) {
          // Clean up everything

          // List all incomplete tasks
          // Create a node for each incomplete task
          // "/task/task-ID--"channel-id"

          // Create a node for each complete task
          // "/task/task-ID--"channel-id"

          console.log(tasks[i].innerText);
        }
        var txt = firepad.getText();
        //$('.firepad-unchecked').text( $str1.find('p').eq(1).text() );
        summaryRef.update({text: txt, last_user_synced: profile.$id});

        //notificationRef.child("latest_user").update({time: new Date().getTime()/1000, displayName: profile.displayName, uid: profile.$id});

        notificationRef.update({latest_user_time: new Date().getTime()/1000, latest_user_display_name: profile.displayName, latest_uid: profile.$id});

        var uid = profile.$id;

        //userPresenceRef.child("typing").child(profile.$id).update({last_seen : (new Date().getTime()/1000)});
      });

    };
  });
