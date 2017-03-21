$(document).ready(function()
{
	var scriptPath = mw.config.get('wgScriptPath');
	if(mw.config.get("wgCanonicalSpecialPageName") == "Contributions")
	{
		$("ul.mw-contributions-list").before("<div style='display:inline-block;' id='revdelCP'>Revision deletion: <input type='button' id='revdelSelectAll' value='Select all'><input type='button' id='revdelSelectNone' value='Select none'>\
<span style='white-space:nowrap;'><input type='checkbox' id='revdelContent' name='revdelOptions' value='content'> delete content</span> \
<span style='white-space:nowrap;'><input type='checkbox' id='revdelName' name='revdelOptions' value='userName'> delete user name</span> \
<span style='white-space:nowrap;'><input type='checkbox' id='revdelComment' name='revdelOptions' value='editSummary'> delete edit summary</span> \
<span style='white-space:nowrap;'><input type='checkbox' id='undelContent' name='revdelOptions' value='content'> undelete content</span> \
<span style='white-space:nowrap;'><input type='checkbox' id='undelName' name='revdelOptions' value='userName'> undelete user name</span> \
<span style='white-space:nowrap;'><input type='checkbox' id='undelComment' name='revdelOptions' value='editSummary'> undelete edit summary</span> \
<br/><select id='wpRevDeleteReasonList'><option value='other'>Other reason</option></select><input name='wpReason' size='60' id='wpReason' maxlength='100'>\
<input type='button' class='revdelSubmit' id='revdelSubmit' value='Revdel selected entries'> <input type='button' class='revdelSubmit' id='oversightSubmit' value='Oversight selected entries'></div>");
		$("ul.mw-contributions-list .mw-revdelundel-link").each(function(ind,el){
			var revId = /ids=(\d+)/.exec($(this).children("a").attr("href"))[1];
			var pageTitle = /target=([^&]+)/.exec($(this).children("a").attr("href"))[1];
			el.innerHTML = "<input type='checkbox' name='"+decodeURIComponent(pageTitle)+"' class='revdelIds' value='"+revId+"'>";
		});
		$("ul.mw-contributions-list").after("</form>");
		
		//load canned summaries
		$.get( scriptPath + "/index.php?title=MediaWiki:Revdelete-reason-dropdown&action=raw",function(data)
		{
			reasons = data.replace(/\*\* ([^\*]+)/g, '<option value="$1">$1</option>');
			reasons = reasons.replace(/\* ([^<]+)([^\*]+)/g, '<optgroup label="$1">$2</optgroup>');
			$('#wpRevDeleteReasonList').append(reasons);
		});
		
		//attach handlers
		$("#revdelSelectAll").click(
			function()
			{
				$('input.revdelIds').each(function()
				{
					$(this).prop("checked", true);
				})
			}
		);
		$("#revdelSelectNone").click(
			function()
			{
				$('input.revdelIds').each(function()
				{
					$(this).prop("checked", false);
				})
			}
		);
		$("#revdelSubmit").click(
			function()
			{
				//figure out which revisions and pages we're working on.
				var revCount = 0;
				var numTitles = 0;
				var pageTitles = {};
				$("input.revdelIds:checked").each(function(ind)
				{
					revCount = ind + 1;
					if(ind > 49)
					{
						alert("You can't do more than 50 revdels at once! Canceling...");
						return false;
					}
					if(typeof pageTitles[$(this).attr("name")] == "undefined")
					{
						pageTitles[$(this).attr("name")] = $(this).val();
						numTitles++;
					}
					else
					{
						pageTitles[$(this).attr("name")] = pageTitles[$(this).attr("name")] + "|" + $(this).val();
					}
				});
				if(numTitles == 0)
				{
					alert("You didn't select any revisions to delete!");
					return false;
				}
				var confirmString = "You are attempting to modify " + revCount + " revisions.\n\nThe following revision attributes will be changed:\n";
				
				//figure out what we're doing to each revision. This is pretty clunky, but whatever.
				var deleteString = "";
				var revealString = "";
				var typeString = "revdel";
				
				if($("#revdelContent").prop("checked") == $("#undelContent").prop("checked"))
				{
					confirmString = confirmString + "-Content visibility won't change.\n";
				}
				else if($("#revdelContent").prop("checked"))
				{
					deleteString = "content";
					confirmString = confirmString + "-Content will be deleted.\n";
				}
				else
				{
					revealString = "content";
					confirmString = confirmString + "-Content will be revealed.\n";
				}
				if($("#revdelComment").prop("checked") == $("#undelComment").prop("checked"))
				{
					confirmString = confirmString + "-Edit summary visibility won't change.\n";
				}
				else if($("#revdelComment").prop("checked"))
				{
					if(deleteString != "")
					{
						deleteString = deleteString + "|";
					}
					deleteString = deleteString + "comment";
					confirmString = confirmString + "-Edit summary will be deleted.\n";
				}
				else
				{
					if(revealString != "")
					{
						revealString = revealString + "|";
					}
					revealString = revealString + "comment";
					confirmString = confirmString + "-Edit summary will be revealed.\n";
				}
				if($("#revdelName").prop("checked") == $("#undelName").prop("checked"))
				{
					confirmString = confirmString + "-User name visibility won't change.\n";
				}
				else if($("#revdelName").prop("checked"))
				{
					if(deleteString != "")
					{
						deleteString = deleteString + "|";
					}
					deleteString = deleteString + "user";
					confirmString = confirmString + "-User name will be deleted.\n";
				}
				else
				{
					if(revealString != "")
					{
						revealString = revealString + "|";
					}
					revealString = revealString + "user";
					confirmString = confirmString + "-User name will be revealed.\n";
				}
				if(deleteString == "" && revealString == "")
				{
					alert("You didn't select any properties of the revisions to change!");
					return false;
				}
				
				var summary = "";
				
				//construct the revdel summary
				if($("#wpRevDeleteReasonList").val() == "other")
				{
					if($("#wpReason").val() == "")
					{
						alert("You didn't select or write in an edit summary for the logs!");
						return false;
					}
					summary = $("#wpReason").val();
				}
				else
				{
					summary = $("#wpRevDeleteReasonList").val();
					if($("#wpReason").val() != "")
					{
						summary = summary + ": " +  $("#wpReason").val();
					}
				}
				confirmString = confirmString + "\nYour revdel summary is: "+ summary +"\n\nAre you sure you want to do this?";
				
				if(confirm(confirmString))
				{
					var numCompleted = 0;
					for (title in pageTitles)
					{
						var ajaxData;
						ajaxData = {action:"revisiondelete",type:"revision",ids:pageTitles[title],reason:summary,token: mw.user.tokens.get( 'editToken' )};
						if(deleteString != "")
						{
							ajaxData.hide=deleteString;
						}
						if(revealString != "")
						{
							ajaxData.show=revealString;
						}
						$.post( scriptPath + '/api.php/', ajaxData,function()
						{
							numCompleted++;
							if(numCompleted == numTitles)
							{
								alert("modified " + revCount + " revision(s) successfully!");
								return false;
							}
						});
					}
				}
				return false;
			}
		)
		$("#oversightSubmit").click(
			function()
			{
				//figure out which revisions and pages we're working on.
				var revCount = 0;
				var numTitles = 0;
				var pageTitles = {};
				$("input.revdelIds:checked").each(function(ind)
				{
					revCount = ind + 1;
					if(ind > 49)
					{
						alert("You can't do more than 50 revdels at once! Canceling...");
						return false;
					}
					if(typeof pageTitles[$(this).attr("name")] == "undefined")
					{
						pageTitles[$(this).attr("name")] = $(this).val();
						numTitles++;
					}
					else
					{
						pageTitles[$(this).attr("name")] = pageTitles[$(this).attr("name")] + "|" + $(this).val();
					}
				});
				if(numTitles == 0)
				{
					alert("You didn't select any revisions to delete!");
					return false;
				}
				var confirmString = "You are attempting to modify " + revCount + " revisions.\n\nThe following revision attributes will be changed:\n";
				
				//figure out what we're doing to each revision. This is pretty clunky, but whatever.
				var deleteString = "";
				var oversighting = -1;
				
				if($("#revdelContent").prop("checked") == $("#undelContent").prop("checked"))
				{
					confirmString = confirmString + "-Content visibility won't change.\n";
				}
				else if($("#revdelContent").prop("checked"))
				{
					deleteString = "content";
					confirmString = confirmString + "-Content will be oversighted.\n";
					oversighting = 1;
				}
				else
				{
					if(oversighting == 1)
					{
						alert("we can't oversight and un-oversight edits at the same time!");
						return false;
					}
					deleteString = "content";
					confirmString = confirmString + "-Content will be returned to normal (admin-only) revision deletion.\n";
					oversighting = 0;
				}
				if($("#revdelComment").prop("checked") == $("#undelComment").prop("checked"))
				{
					confirmString = confirmString + "-Edit summary visibility won't change.\n";
				}
				else if($("#revdelComment").prop("checked"))
				{
					if(oversighting == 0)
					{
						alert("we can't oversight and un-oversight edits at the same time!");
						return false;
					}
					if(deleteString != "")
					{
						deleteString = deleteString + "|";
					}
					deleteString = deleteString + "comment";
					confirmString = confirmString + "-Edit summary will be oversighted.\n";
					oversighting = 1;
				}
				else
				{
					if(oversighting == 1)
					{
						alert("we can't oversight and un-oversight edits at the same time!");
						return false;
					}
					if(deleteString != "")
					{
						deleteString = deleteString + "|";
					}
					deleteString = deleteString + "comment";
					confirmString = confirmString + "-Edit summary will be returned to normal (admin-only) revision deletion.\n";
					oversighting = 0;
				}
				if($("#revdelName").prop("checked") == $("#undelName").prop("checked"))
				{
					confirmString = confirmString + "-User name visibility won't change.\n";
				}
				else if($("#revdelName").prop("checked"))
				{
					if(oversighting == 0)
					{
						alert("we can't oversight and un-oversight edits at the same time!");
						return false;
					}
					if(deleteString != "")
					{
						deleteString = deleteString + "|";
					}
					deleteString = deleteString + "user";
					confirmString = confirmString + "-User name will be oversighted.\n";
					oversighting = 1;
				}
				else
				{
					if(oversighting == 1)
					{
						alert("we can't oversight and un-oversight edits at the same time!");
						return false;
					}
					if(deleteString != "")
					{
						deleteString = deleteString + "|";
					}
					deleteString = deleteString + "user";
					confirmString = confirmString + "-User name will be returned to normal (admin-only) revision deletion.\n";
					oversighting = 0;
				}
				if(deleteString == "")
				{
					alert("You didn't select any properties of the revisions to change!");
					return false;
				}
				
				var summary = "";
				
				//construct the revdel summary
				if($("#wpRevDeleteReasonList").val() == "other")
				{
					if($("#wpReason").val() == "")
					{
						alert("You didn't select or write in an edit summary for the logs!");
						return false;
					}
					summary = $("#wpReason").val();
				}
				else
				{
					summary = $("#wpRevDeleteReasonList").val();
					if($("#wpReason").val() != "")
					{
						summary = summary + ": " +  $("#wpReason").val();
					}
				}
				confirmString = confirmString + "\nYour oversight summary is: "+ summary +"\n\nAre you sure you want to do this?";
				
				if(confirm(confirmString))
				{
					var numCompleted = 0;
					for (title in pageTitles)
					{
						var ajaxData;
						ajaxData = {action:"revisiondelete",type:"revision",ids:pageTitles[title],reason:summary,token: mw.user.tokens.get( 'editToken' ),hide:deleteString};
						if(oversighting == 1)
						{
							ajaxData.suppress = "yes";
						}
						else if(oversighting == 0)
						{
							ajaxData.suppress = "no";
						}
						else
						{
							alert("Something went wrong, so we're going to abort without doing anything.");
						}
						$.post( scriptPath + '/api.php/', ajaxData,function()
						{
							numCompleted++;
							if(numCompleted == numTitles)
							{
								alert("modified " + revCount + " revision(s) successfully!");
								return false;
							}
						});
					}
				}
				return false;
			}
		)
	}
});
