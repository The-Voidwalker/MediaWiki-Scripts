// Script designed to find all pages created by a large set of users. You can add a whole category of users in at once.
// To activate, go to [[Special:CreatedArticles]]

if( mw.config.get('wgNamespaceNumber') === -1 && /Special:[Cc]reated[Aa]rticles/.test(mw.config.get('wgPageName')) ) {
  mw.loader.using( ['oojs-ui', 'mediawiki.util'] ).then( function() {
    createInterface();
  } );
}

function createInterface() {
  $('#firstHeading').text( mw.config.get('wgPageName') );
  text = $('#mw-content-text');
  text.html(''); // Blank slate
  text.append('<p>Enter a list of usernames in the box below, or add them from a category (any "User:" prefix is stripped when submitted). Default limit is 50.</p>');
  var catInput = new OO.ui.ActionFieldLayout( new OO.ui.TextInputWidget({ placeholder: 'Enter a category name' }), new OO.ui.ButtonWidget({ label: 'Add' }), { align: 'top' } ), // align top so button is attached to input widget
    nameInput = new OO.ui.MultilineTextInputWidget({ placeholder: 'Enter a list of usernames separated by a newline', autosize: true }),
    limitSelect = new OO.ui.FieldLayout( new OO.ui.DropdownInputWidget({ options: [{ data: 10, label: '10' }, {data: 25, label: '25'}, {data: 50, label: '50'}, {data: 100, label: '100'}, {data: 250, label: '250'}, {data: 500, label: '500'}, {data: 0, label: 'all'}], value: 50 }), { label: 'Limit:', align: 'right' } );
    submit = new OO.ui.ButtonWidget({ label: 'Submit' });
  catInput.$button.click(function() {
    if(catInput.getField().value.length === 0)
      return alert("Please enter a category");
    addFromCat();
    catInput.getField().setValue(''); // Cat added, prevent duplication
  });
  nameInput.$element.css('margin-top', '1em'); // spacing
  text.append(catInput.$element);
  text.append(nameInput.$element.css('margin-top', '1 em'));
  text.append(limitSelect.$element);
  text.append(submit.$element.click(function(){submit.setDisabled(true); makeList();}));
  
  function addFromCat(cont) {
    var val = catInput.getField().value;
    var query = {
      action: 'query',
      format: 'json',
      list: 'categorymembers',
      cmtitle: val,
      cmprop: 'title',
      cmnamespace: 2,
      cmlimit: 500,
    };
    if( cont ) {
      query.continue = cont.continue;
      query.cmcontinue = cont.cmcontinue;
    }
    $.getJSON(mw.util.wikiScript('api'), query).done(function(data) {
      var pages = data.query.categorymembers, users = [];
      for( var i = 0; i < pages.length; i++ ) {
        users.push(pages[i].title.slice(pages[i].title.indexOf(':') + 1));
      }
      nameInput.setValue(nameInput.value + (nameInput.value.length === 0 ? '' : '\n') + users.join('\n'));
      if( data.continue ) {
        addFromCat( data.continue );
      } else {
        alert("Added users from category: " + val);
      }
    });
  }
  
  function makeList(cont, users, limit) {
    if( !users ) {
      if( limitSelect.getField().value === '0' && !confirm("You have set the limit to all. Do you wish to procede? (This could take very long time)") )
        return submit.setDisabled(false);
      users = nameInput.value.split('\n');
      users.reverse();
      limit = limitSelect.getField().value === '0' ? Infinity : limitSelect.getField().value;
      text.html('<p id="patience-plz">Fetching list, please be patient (this may take a while).</p><pre id="ca-list"></pre>');
    }
    var query = {
      action: 'query',
      format: 'json',
      list: 'usercontribs',
      uclimit: 500,
      ucshow: 'new',
      ucprop: 'title',
      ucnamespace: 0,
    };
    if( cont ) {
      query.ucuser = cont.user;
      query.continue = cont.continue;
      query.uccontinue = cont.uccontnue;
    } else {
      query.ucuser = users.pop();
    }
    $.getJSON( mw.util.wikiScript('api'), query).done(function(data) {
      var tribs = data.query.usercontribs, titles = [];
      for( var i = 0; i < tribs.length && limit > 0; i++ ) {
        $('#ca-list').append(tribs[i].title + '\n');
        limit--;
      }
      if( limit > 0 && data.query.continue ) {
        data.query.continue.user = tribs[0].user;
        makeList(data.query.continue, users, limit);
      } else if ( limit > 0 && users.length > 0 ) {
        makeList(null, users, limit);
      } else {
      	$('#patience-plz').remove();
      }
    } );
  }
}
