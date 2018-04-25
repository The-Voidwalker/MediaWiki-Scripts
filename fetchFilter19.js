function fetch(cont, userlist, idlist) {
	var query = {
		action: 'query',
		format: 'json',
		list: 'abuselog',
		aflfilter: 19,
		aflprop: 'ids|user',
		afllimit: 500,
	},
	users = [],
	ids = [];
	if( cont ) {
		query.continue = cont.continue;
		query.aflstart = cont.aflstart;
		users = users.concat(userlist);
		ids = ids.concat(idlist);
	}
	$.getJSON( mw.util.wikiScript('api'), query ).done( function( data ) {
		var logs = data.query.abuselog;
		for(var i = 0; i < logs.length; i++) {
			var log = logs[i];
			if(!users.includes(log.user)) {
				users.push(log.user);
				ids.push(log.id);
			}
		}
		if( data.continue ) {
			fetch( data.continue, users, ids );
		} else {
			createDisplay(users, ids);
		}
	} );
}

function createDisplay(userlist, logids) {
	text = $('#mw-content-text');
	text.html('<table class="wikitable"><thead><tr><th>User</th><th>Log</th></tr></thead><tbody id="ca-list"></tbody></table>');
	for(var i = 0; i < userlist.length; i++) {
		$('#ca-list').append('<tr><td><a href="/wiki/Special:CentralAuth/' + userlist[i] + '">' + userlist[i] + 
		'</a></td><td><a href="/wiki/Special:AbuseLog/' + logids[i] + '">AbuseLog/' + logids[i] + '</a></td></tr>');
	}
	$('table').tablesorter(); // Woo fancy!
}

mw.loader.using(['mediawiki.util', 'jquery.tablesorter']).then(function() {
	fetch();
});
