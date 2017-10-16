// Unfinished, end design is to have the script delete the pages.

function getImportTitles(cont, entries) {
	var query = {
		action: 'query',
		format: 'json',
		list: 'logevents',
		leprop: 'title',
		leuser: 'Sony',
		letype: 'import',
		lelimit: 500
	};
	if(!cont)
		entries = [];
	else {
		query.continue = cont.continue;
		query.lecontinue = cont.lecontinue;
	}
	$.getJSON(mw.util.wikiScript('api'), query).done(function(data){
		var events = data.query.logevents;
		for(var i = 0; i < events.length; i++) {
			entries.push(events[i].title);
		}
		if( data.continue ) {
			getImportTitles(data.continue, entries);
		} else {
			console.log(entries.join('\n'));
		}
	});
}

getImportTitles();
