//Script to add sysop to a user on one click
//To do: add toggles for different skins
if( mw.config.get("wgRelevantUserName") ) {
	var username = mw.config.get("wgRelevantUserName");
	$.getJSON(
	//Get user's group membership
    mw.util.wikiScript('api'),
    {
        format: 'json',
        action: 'query',
        list: 'users',
        usprop: 'groups',
        ususers: username
    }
	).done( function ( data ) {
    try {
    	if(data.query.users[0].groups.indexOf('sysop') >= 0) {/* Do nothing */}
    	else {
			var link = mw.util.addPortletLink(
	    		'p-cactions',
	    		'#',
	    		'Grant Admin',
		    	'pt-grantadminlink',
			 	'Grant admin privleges to this user'
			);
		
			$(link).click(function() {
				checkAndPromote(username);
			});
    	}
    }
    catch ( e ) {
        console.log( "Content request error: " + e.message );
        console.log( "Content request response: " + JSON.stringify( data ) );
    }
	} ).fail( function () {
    	console.log( "While getting the userlist, there was an AJAX error." );
	} );
}

function checkAndPromote(username) {
	$.getJSON(
	//Get user's group membership again
    mw.util.wikiScript('api'),
    {
        format: 'json',
        action: 'query',
        list: 'users',
        usprop: 'groups',
        ususers: username
    }
	).done( function ( data ) {
    try {
    	if(data.query.users[0].groups.indexOf('sysop') >= 0) {/* Do nothing */}
    	else {
    		check = confirm("Do you want to give " + username + " administrator privleges on this wiki?");
			if (check) {
				grantAdmin(username);
				alertUser(username);
				alert(username + " is now an administrator");
			}
    	}
    }
    catch ( e ) {
        console.log( "Content request error: " + e.message );
        console.log( "Content request response: " + JSON.stringify( data ) );
    }
	} ).fail( function () {
    	console.log( "While getting the userlist, there was an AJAX error." );
	} );
}

function grantAdmin(username) {
$.getJSON(
	//Get userrights token
    mw.util.wikiScript('api'),
    {
        format: 'json',
        action: 'query',
        meta: 'tokens',
        type: 'userrights'
    }
).done( function ( data ) {
    try {
    	var rightsToken = data.query.tokens.userrightstoken;
    	//Grant admin
    	$.ajax( {
	        url: mw.util.wikiScript( 'api' ),
    	    type: 'POST',
        	dataType: 'json',
        	data: {
	            format: 'json',
	            action: 'userrights',
	            user: username,
	            add: 'sysop',
	            reason: '+sysop',
	            token: rightsToken,
	        }
	    } ).done(console.log( "Granted sysop to: " + username )
	    ).fail( function ( e, data ){
	    	console.log( e.message );
	    	console.log( JSON.stringify( data ) );
	    });
    }
    catch ( e ) {
        console.log( "Content request error: " + e.message );
        console.log( "Content request response: " + JSON.stringify( data ) );
    }
} ).fail( function () {
    console.log( "While getting the userlist, there was an AJAX error." );
} );
}

function alertUser(username) {
	//If page already exists
	$.ajax( {
	    url: mw.util.wikiScript( 'api' ),
    	type: 'POST',
        dataType: 'json',
        data: {
	        format: 'json',
	        action: 'edit',
            title: 'User talk:' + username,
            summary: 'Admin granted',
            nocreate: 1,
            appendtext: '\n\n{{subst:' + 'Admin granted}}',
            token: mw.user.tokens.get( 'csrfToken' )
        }
    } ).done( function (data) {
    	//console.log(data);
    }).fail( function ( e, data ){
    	console.log( e.message );
    	console.log( JSON.stringify( data ) );
    });
    
    //If pages does not exist
    $.ajax( {
	    url: mw.util.wikiScript( 'api' ),
    	type: 'POST',
        dataType: 'json',
        data: {
	        format: 'json',
	        action: 'edit',
            title: 'User talk:' + username,
            summary: 'Admin granted',
            createonly: 1,
            text: '{{subst:' + 'Admin granted}}',
            token: mw.user.tokens.get( 'csrfToken' )
        }
    } ).done( function (data) {
    	//console.log(data);
    }).fail( function ( e, data ){
    	console.log( e.message );
    	console.log( JSON.stringify( data ) );
    });
}
