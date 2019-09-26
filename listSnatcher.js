list = [];
$('.mw-userlink').each(function(i,e) {
    list.push(e.text);
});
list.join('\n');
