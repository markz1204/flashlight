(function ($) {
  "use strict";

  /**====== SET ME =====**/
  /**====== SET ME =====**/
  /**====== SET ME =====**/
  // Set the configuration for your app
  // TODO: Replace with your project's config object
  var config = {
    apiKey: "AIzaSyASnn48RV96HOxCsD83TnDF1CCaKYiVmI0",
    authDomain: "elasticsearch-2f7ed.firebaseapp.com",
    databaseURL: "https://elasticsearch-2f7ed.firebaseio.com",
    storageBucket: "elasticsearch-2f7ed.appspot.com"
  };

  // TODO: Replace this with the path to your ElasticSearch queue
  // TODO: This is monitored by your app.js node script on the server
  // TODO: And this should match your seed/security_rules.json
  var PATH = "search";
  /**====== /SET ME =====**/
  /**====== /SET ME =====**/
  /**====== /SET ME =====**/

  // Initialize connection using our project credentials
  firebase.initializeApp(config);

  // Get a reference to the database service
  var database = firebase.database();

  // handle form submits
  $('form').on('submit', function(e) {
    e.preventDefault();
    var $form = $(this);
    var term = $form.find('[name="term"]').val();
    var words = $form.find('[name="words"]').is(':checked');
    if( term ) {
      doSearch($form.find('[name="index"]').val(), $form.find('[name="type"]:checked').val(), makeTerm(term, words));
    }
    else {
      $('#results').text('');
    }
  });

  // display search results
  function doSearch(index, type, query) {
    var ref = database.ref().child(PATH);
    var key = ref.child('request').push({ index: index, type: type, query: query }).key;

    console.log('search', key, { index: index, type: type, query: query });
    ref.child('response/'+key).on('value', showResults);
  }

  function showResults(snap) {
    if( !snap.exists() ) { return; } // wait until we get data
    var dat = snap.val();
    snap.ref.off('value', showResults);
    snap.ref.remove();
    var $pair = $('#results')
        .text(JSON.stringify(dat, null, 2))
        .add( $('#total').text(dat.total) )
        .removeClass('error zero');
    if( dat.error ) {
      $pair.addClass('error');
    }
    else if( dat.total < 1 ) {
      $pair.addClass('zero');
    }
  }

  function makeTerm(term, matchWholeWords) {
    if( !matchWholeWords ) {
      if( !term.match(/^\*/) ) { term = '*'+term; }
      if( !term.match(/\*$/) ) { term += '*'; }
    }
    return term;
  }

  // display raw data for reference
  database.ref().on('value', setRawData);
  function setRawData(snap) {
    $('#raw').text(JSON.stringify(snap.val(), null, 2));
  }
})(jQuery);
