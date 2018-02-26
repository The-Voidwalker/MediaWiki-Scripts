// Not technically for use in MW but.....
// Use: Using GitHub raw text of a file, paste the script into dev tools.
// Then, with a list of wiki names (including the -wiki suffix) separated by the "|" character
// Run find("list")
function find(wikitxt) {
  var text = $('pre').innerText;
  var wikis = [];
  var included = [];
  if(wikitxt.lastIndexOf("|") + 1 != wikitxt.length)
    wikitxt += "|"
  while(wikitxt.indexOf("|") >= 0) {
    wikis.push(wikitxt.slice(0,wikitxt.indexOf("|")));
    wikitxt = wikitxt.slice(wikitxt.indexOf("|") + 1);
  }
  for(var i = 0; i < wikis.length; i++) {
    if(text.indexOf("'" + wikis[i] + "'") >= 0)
    included.push(wikis[i]);
  }
  return included;
}
