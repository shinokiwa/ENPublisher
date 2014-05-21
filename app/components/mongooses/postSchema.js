var Schema = require('mongoose').Schema;
var libxmljs = require('libxmljs');
var url = require ('url');

var PostSchema = module.exports = new Schema({
	url : {
		type : String,
		index : {
			unique : true
		}
	},
	guid : {
		type : String,
		index : {
			unique : true
		}
	},
	title : String,
	content : String,
	created : Date,
	updated : Date,
	deleted : Date,
	published : Date,
	updateSequenceNum : Number,
	tags : [ {
		guid : String,
		name : String
	} ],
}, {
	_id : true
});

PostSchema.path('title').set(function(val) {
	var title;
	var split = val.split('#');
	if (split.length == 1 || split[1].length < 1) {
		title = split[0].trim();
		this.url = encodeURIComponent(split[0].trim());
	} else {
		title = split[0].trim();
		this.url = split[1].trim();
	}

	return title;
});

PostSchema.path('url').set(function(val) {
	return val.trim();
});

var siteDomain;
PostSchema.static('setSiteDomain', function(domain) {
	siteDomain = domain;
});
PostSchema.virtual('contentHTML').get(function() {
	var result = '';
	if (this.content) {
		var xmlDoc = libxmljs.parseXmlString(this.content);

		var links = xmlDoc.find('//a');
		for ( var i in links) {
			var link = url.parse(links[i].attr('href').value());
			if (link.protocol == 'evernote:') {
				var guid = link.pathname.split('/')[4];
				links[i].attr({
					href : '/id/'+guid,
					target : '_self'
				});
			} else if (link.hostname != siteDomain) {
				links[i].attr({
					target : '_blank'
				});
			}
		}

		var medias = xmlDoc.find('//en-media');
		for ( var i in medias) {
			var hash = medias[i].attr('hash').remove().value();
			var mime = medias[i].attr('type').remove().value().split('/');
			var value = '/resources/' + this.guid + '/' + hash + '.' + mime[1];
			if (mime[0] == 'image') {
				medias[i].name('img').attr({
					src : value
				});
			} else {
				medias[i].name('a').attr({
					href : value
				});
			}
		}

		var crypts = xmlDoc.find('//en-crypt');
		for ( var i in crypts) {
			crypts[i].remove();
		}

		var todos = xmlDoc.find('//en-todo');
		for ( var i in todos) {
			todos[i].remove();
		}

		var lines = xmlDoc.get('//en-note').childNodes();
		for ( var i in lines) {
			if (lines[i].childNodes().length != 0) {
				result += lines[i].toString();
			}
		}
	}
	return result;
});

PostSchema.virtual('tagGuids').set(function(vals) {
	for ( var i in vals) {
		var isNew = true;
		for ( var n in this.tags) {
			if (this.tags[n].guid == vals[i]) {
				isNew = false;
			}
		}
		if (isNew) {
			this.tags.push({
				guid : vals[i]
			});
		}
	}
});

var publishedGuid;
PostSchema.static('setPublished', function(guid) {
	publishedGuid = guid;
});
PostSchema.static('published', function() {
	return this.find({
		tags : {
			$elemMatch : {
				guid : publishedGuid
			}
		}
	});
});
