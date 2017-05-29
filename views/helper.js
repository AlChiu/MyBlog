/*jslint node: true */
'use string';
exports.ssubstring = function(post, start, finish){
	var theString = post.substring(start, finish);
	return theString;
};