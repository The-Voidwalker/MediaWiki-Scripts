function agu (more){
	var data = {
		action: 'query',
		format: 'json',
		list: 'globalallusers',
		agulimit: 'max',
		aguprop: 'existslocally|lockinfo',
		aguexcludegroup: 'steward|cvt|sysadmin|global-ipblock-exempt'
	};
	if (more && more.continue) {
		data.continue = more.continue;
		data.agufrom = more.agufrom;
	}
	$.getJSON(
		mw.util.wikiScript('api'),
		data
	).success(function(data){
		var users = data.query.globalallusers;
		for (var i = 0; i < users.length; i++) {
			var user = users[i];
			if (user.existslocally === undefined && user.locked === undefined)
				$('#bodyContent').after('<p>' + user.name + '</p>');
		}
		if (data.continue) {
			agu(data.continue);
		}
	});
}

agu(null);
