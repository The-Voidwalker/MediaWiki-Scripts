// for getting all the articles created by a set of users

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
  
  function addFromCat() {
    var val = catInput.getField().value;
    alert("Added users from category: " + val);
  }
  
  function makeList() {
    if( limitSelect.getField().value === '0' && !confirm("You have set the limit to all. Do you wish to procede? (This could take very long time)") )
      return submit.setDisabled(false);
    text.html('<p id="patience-plz">Fetching list, please be patient (this may take a while).</p>');
  }
}
