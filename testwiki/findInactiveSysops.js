//This script automates the process of finding inactive sysops.
//Warning: the script will replace the contents of the page you are currently viewing when you click the link at the top right of the page.
//Output is in the format of "[[User:Example|Example]] || [[Special:PermanentLink/1234|timestamp]] || [[Special:Log/Example|timestamp]]"
var scriptActivationLink = mw.util.addPortletLink(
    'sidebar',
    '#',
    'Find Inactive Sysops',
    'pt-testscript',
    'Replaces the contents of the current page with a list of inactive sysops',
    null,
    '#pt-adminlinks'
);

$( scriptActivationLink ).click( function () {
	var doThis = confirm('Do you want to run the script?');
	if( doThis ){
		$.getJSON(
			//Get userlist
            mw.util.wikiScript('api'),
            {
                format: 'json',
                action: 'query',
                list: 'allusers',
                augroup: 'sysop',
                aulimit: 50, //Set limit to 50 as there are no more than 50 sysops
            }
        ).done( function ( data ) {
            try {
            	var users = data.query.allusers;
            	var userlist = [];
            	users.forEach(function(object){
            		userlist.push(object.name);
            	});
            	filterUsers(userlist);
            }
        catch ( e ) {
            console.log( "Content request error: " + e.message );
            console.log( "Content request response: " + JSON.stringify( data ) );
        }
    } ).fail( function () {
        console.log( "While getting the userlist, there was an AJAX error." );
    } );
}
} );

function filterUsers (userlist){
	var userstring = userlist.toString();
	var exempt = ["MacFan4000","Mbrt","Void","FuzzyBot","Test Wiki message delivery","Abuse filter"];
	for (i = 0; i < exempt.length; i++){
		userstring = userstring.replace(exempt[i]+",","");
	}
	var reducedList = userstring.split(",");
	var tribsData;
	var logsData;
	//Visual output onto the page you activate the script on
	$("#mw-content-text").replaceWith("The following users are inactive:" + "<ul id=\"inactiveList\" style=\"list-style-type:none;list-style-image:none;\"></ul>");
	for (x = 0; x < reducedList.length; x++){
		$.getJSON(
		//Get contribs and log entries
            mw.util.wikiScript('api'),
            {
                format: 'json',
                action: 'query',
                list: 'logevents|usercontribs',
                leprop: 'timestamp',
                ledir: 'older',
                leuser: reducedList[x],
                lelimit: 1, //We only need the most recent log action/edit
                uclimit: 1,
                ucuser: reducedList[x],
                ucdir: 'older',
                ucprop: 'timestamp|ids'
            }
        ).done( function ( data ) {
            try {
            	tribsData = data.query.usercontribs;
            	logsData = data.query.logevents;
            	var activeLogs, activeTribs, active;
            	var tribsInfo;

            	if(typeof(logsData[0].timestamp) != "undefined") {
            		activeLogs = compareDates( logsData[0].timestamp, "logs" );
            	}
            	else {
            		activeLogs = false;
            	}
            	if( typeof(tribsData[0]) != "undefined" ) {
            		tribsInfo = (tribsData[0].revid+"|"+tribsData[0].timestamp);
            		activeTribs = compareDates( tribsInfo, "tribs" );
            	}
            	else {
            		activeTribs = false;
            	}
            	if( activeLogs === false && activeTribs === false ) {
            		var user = tribsData[0].user;
            		console.log(user + " is inactive");
            		listInactiveUsers( user, tribsData, logsData );
            	}
            }
        catch ( e ) {
            console.log( "Content request error: " + e.message );
            console.log( "Content request response: " + JSON.stringify( data ) );
        }
    } ).fail(/*console.log( "While getting the userlist, there was an AJAX error." )*/);
	}
}
function compareDates ( data, dataType ){
	//Gets current date in yyyymmdd
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth() + 1; //January is 0!
	var yyyy = today.getFullYear();
	//Set back 1 month
	mm -= 1;
	if (mm < 0){
		mm += 12;
		yyyy -= 1;
	}
	
	if(dd<10) {
    	dd='0'+dd;
	} 

	if(mm<10) {
	    mm='0'+mm;
	} 
	today = ''+yyyy+mm+dd; //This is a string

	var date;
	var isActive;
	if( dataType === "logs" ){
		date = data.slice(0,data.indexOf('T'));
		date = date.replace("-","");
	}
	else if( dataType === "tribs" ){
		date = data.slice(data.indexOf('|') + 1, data.indexOf('T'));
		date = date.replace("-","");
	}
	if (date < today){
		isActive = false;
	}
	else{
		isActive = true;
	}
	return isActive;
}

function listInactiveUsers( userName, tribsArray, logsArray ){
	var userLink = "[[User:<a href=\"https://publictestwiki.com/wiki/Special:Contribs/" + userName + "\">" + userName + "</a>|" + userName + "]]";
	var tribsInfo = tribsArray[0].timestamp;
	tribsInfo = tribsInfo.slice(0, tribsInfo.indexOf("T"));
	tribsInfo = tribsArray[0].revid + "|" + tribsInfo;
	var logsInfo = logsArray[0].timestamp;
	logsInfo = logsInfo.slice(0, logsInfo.indexOf("T"));
	tribsInfo = "[[Special:PermanentLink/" + tribsInfo + "]]";
	logsInfo = "[[Special:Log/" + userName + "|" + logsInfo + "]]";
	$("#inactiveList").append( "<li>" + userLink + " || " + tribsInfo + " || " + logsInfo + "</li>" );
}
