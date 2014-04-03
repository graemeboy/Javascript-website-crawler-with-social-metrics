	jQuery(document).ready(function($) {
		var data;
		var links, linkTags, linkTag, curProgress, numLinks, processesComplete, numSocial;
		var networksList = new Array('facebook', 'twitter', 'linkedin', 'pinterest');
		var allShares = {}; // for posts
		var networkData = {};
		
		var networkFrequency = {	
			facebook: 0,
			twitter: 0,
			linkedin: 0,
			pinterest: 0,
		};
		
		var pageData = {
			/*
				pageUrl: ,
				pageTitle: ,
				shares: {
					facebook: ,
					twitter: ,
				}
				totalShares: ,
			*/	
		};
		
		var networkLocation = '';
		var protocol = '';
		var linkTitles = new Array();
		var links = new Array();
		
		
		function formatLink(link) {
			// defrag
			link = link.split('#')[0];
			if (link.substr(0, 4) != 'http') {
				// relative path. add protocol and network location
				if (link.charAt(0) != '/') {
					link = '/' + link;
				}
				link = protocol + '//' + networkLocation + link;
			}
			if (link.substr(link.length - 1) == '/') {
				// dangling slash
				link = link.substr(0, link.length - 1);
			}
			return link;
		}

		function appendLink(link, linkTitle, linkTag) {
			inHtml = '<tr><td><a href="' + link + '">' + linkTitle + '</a></td>';
			for (var x = 0; x < networksList.length; x++) {
				inHtml += '<td id="link-' + linkTag + '-' + networksList[x] + '"></td>';
			}
			inHtml += '</tr>';
			$('#data-body').append(inHtml);
			$('#found-num').text(links.length);
		}

		function addLinkToDom(link, linkTag) {
			var linkTitle;
			var yahooURL = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22" + encodeURI(link) + "%22%20and%0A%20%20%20%20%20%20xpath%3D'%2F%2Ftitle'&diagnostics=true&format=json";
			console.log(yahooURL);
			$.ajax({
				url: yahooURL,
				dataType: 'json',
				success: function(data) {
					linkTitle = link;
					if (data.query.results) {
						if (data.query.results.title !== undefined && data.query.results.title !== null) {
							console.log(data.query.results.title);
							linkTitles[link] = data.query.results.title;
							linkTitle = data.query.results.title;
						}
					} // if results
					appendLink(link, linkTitle, linkTag);
				},
				// success
				error: function() {
					appendLink(link, link, linkTag);
				} // error
			}); // ajax
		} // getTitleFromUrl

		function getLinksYahoo(depth) {
			//console.log("Going to next link: " + depth + ', starting on link: ' + links[depth]);
			if (depth <= 5) {
				url = links[depth];
				var yahooURL = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22" + encodeURI(url) + "%22%20and%0A%20%20%20%20%20%20xpath%3D'%2F%2Fa'&diagnostics=true&format=json";
				$.ajax({
					url: yahooURL,
					dataType: 'json',
					success: function(data) {
						if (data.query.results) {
							$.each(data.query.results.a, function(index) {
								if (data.query.results.a[index].href != undefined && data.query.results.a[index].href.substr(0, 10) != 'javascript') {
									link = data.query.results.a[index].href;
									link = formatLink(link);
									//console.log('network location: ' + link.substring(0, protocol.length + networkLocation.length + 2));
									if (linkTitles[link] == undefined && (link.substring(0, protocol.length + networkLocation.length + 2) == (protocol + '//' + networkLocation) || link.substring(0, protocol.length + networkLocation.length + 6) == (protocol + '//www.' + networkLocation)) && link.substring(link.length - 4, link.length) != '.jpg' && link.substring(link.length - 4, link.length) != '.png' && link.substring(link.length - 4, link.length) != '.mp3' && link.substring(link.length - 4, link.length) != '.mp4' && link.substring(link.length - 4, link.length) != '.pdf') {
										//console.log('adding link: ' + link);
										addLinkToList(link);
										linkTag = stripUrl(link);
										addLinkToDom(link, linkTag);
									} else {
										//console.log('not adding link: ' + link);
									}
								}
							});
						}
						getLinksYahoo(depth + 1);
					}
				});
			} else {
				console.log("finished crawling. Links: " + links.length);
				
				for (var i = 0; i < links.length; i++) {
					allShares[links[i]] = 0;
					networkData[links[i]] = {
							url: links[i],
							title: linkTitles[links[i]],
							shares: {
								facebook: 0,
								twitter: 0,
								linkedin: 0,
								pinterest: 0,
							},
						}
					//$.extend(networkData, linkData);
				}
				console.log("network data: " + networkData);
				addSocial();
			}
		}

		function addLinkToList(urlIn) {
			//addLinkToDom(urlIn);
			linkTitles[urlIn] = true;
			links.push(urlIn);
		}

		function incrementProgressBar() {
			processesComplete++;
			curProgress = Math.round((processesComplete / numSocial) * 100);
			$('#progressBar').css('width', curProgress + '%');
			$('#curProg').text(curProgress);
		}

		function updateInterfaceSocial() {
			numSocial = 1 + (links.length * networksList.length);
			console.log("Num social = " + numSocial);
			processesComplete = 0;
			curProgress = 0;
			incrementProgressBar();
		}

		function addSocial() {
			// we've done crawling let's update the interface.
			updateInterfaceSocial();
			$('#init-msg').fadeOut(function() {
				$('#progress').fadeIn('slow');
			});
			getFacebookShares(links, 0);
		}
		/*
		 *	Social Networking Get Methods
		 */
		function getFacebookShares(links, num) {
			if (num < links.length) {
				console.log('Num: ' + num + ", links: " + links.length);
				var url = links[num];
				console.log("Url: " + url);
				console.log(pageData);
				linkTag = stripUrl(url);
				socUrl = 'https://graph.facebook.com/' + url + '?callback=?';
				console.log("SocUrl: " + socUrl);
				$.ajax({
					url: socUrl,
					dataType: 'json',
					success: function(data) {
						if (data.shares !== undefined) {
							numShare = data.shares;
						} else {
							numShare = 0;
						}
						console.log("Facebook shares: " + numShare);
						$('#link-' + linkTag + '-facebook').html(numShare);
						networkFrequency.facebook += numShare;
						networkData[url].shares.facebook = numShare;
						allShares[url] += numShare;
						incrementProgressBar();
						getFacebookShares(links, num + 1);
					},
					error: function() {
						numShare = 'unknown';
						console.log("Facebook error on : " + url);
						incrementProgressBar();
						getFacebookShares(links, num + 1);
					}
				});
			} else {
				//console.log(networkFrequency);
				console.log("over links number");
				getTwitterShares(links, 0);
			}
		}
		function getPinterestShares(links, num) {
			if (num < links.length) {
				var url = links[num];
				socUrl = "http://api.pinterest.com/v1/urls/count.json?url=" + url + "&callback=?";
				linkTag = stripUrl(url);
				console.log(socUrl);
				$.ajax({
					url: socUrl,
					dataType: 'json',
					success: function(data) {
						console.log(data);
						if (data.count !== undefined) {
							numShare = data.count;
						} else {
							numShare = 0;
						}
						console.log("Pinterest shares: " + data.count);
						$('#link-' + linkTag + '-pinterest').html(numShare);
						networkFrequency.pinterest += numShare;
						networkData[url].shares.pinterest = numShare;
						allShares[url] += numShare;
						incrementProgressBar();
						getPinterestShares(links, num + 1);
					},
					// success
					error: function() {
						numShare = 'unknown';
						console.log("Pinterest error on : " + url);
						incrementProgressBar();
						getPinterestShares(links, num + 1);
					} //error
				}); // ajax
			} // if num
			else {
				updateProgress();
			}
		}
		function getLinkedInShares(links, num) {
			if (num < links.length) {
				var url = links[num];
				linkTag = stripUrl(url);
				socUrl = 'https://www.linkedin.com/countserv/count/share?url=' + url + '&format=jsonp&callback=?';
				console.log(socUrl);
				$.ajax({
					url: socUrl,
					dataType: 'json',
					success: function(data) {
						console.log(data);
						if (data.count !== undefined) {
							numShare = data.count;
						} else {
							numShare = 0;
						}
						console.log("LinkedIn shares: " + data.count);
						$('#link-' + linkTag + '-linkedin').html(numShare);
						networkFrequency.linkedin += numShare;
						networkData[url].shares.linkedin = numShare;
						allShares[url] += numShare;
						incrementProgressBar();
						getLinkedInShares(links, num + 1);
					},
					// success
					error: function() {
						numShare = 'unknown';
						console.log("LinkedIn error on : " + url);
						incrementProgressBar();
						getLinkedInShares(links, num + 1);
					} //error
				}); // ajax
			} else {
				console.log("over links number for linkedIn");
				getPinterestShares(links, 0);
			} // over num
		} // getLinkedInUponShares

		function getTwitterShares(links, num) {
			//console.log("Doing twitter");
			if (num < links.length) {
				var url = links[num];
				socUrl = 'http://urls.api.twitter.com/1/urls/count.json?url=' + url + "&callback=?";
				linkTag = stripUrl(url);
				$.ajax({
					url: socUrl,
					dataType: 'json',
					success: function(data) {
						if (data.count !== undefined) {
							numShare = data.count;
						} else {
							numShare = 0;
						}
						console.log("Twitter shares: " + numShare);
						$('#link-' + linkTag + '-twitter').html(numShare);
						networkFrequency.twitter += numShare;
						networkData[url].shares.twitter = numShare;
						allShares[url] += numShare;
						incrementProgressBar();
						getTwitterShares(links, num + 1);
					},
					//success
					error: function() {
						numShare = 'unknown';
						console.log("Facebook error on : " + url);
						incrementProgressBar();
						getTwitterShares(links, num + 1);
					} //error
				}); // ajax
			} // if num
			else {
				getLinkedInShares(links, 0);
			} // else
		} // getTwitterShares

		function updateProgress() {
			if (!$('#data-table').hasClass('tablesorter')) {
				$('#data-table').tablesorter({
					debug: true,
					sortList: [
						[1, 1]
					]
				});
			} else {
				$('#data-table').trigger('update');
			}
			graphNetworkFrequency(networkFrequency);
			graphTopPostDistribution(allShares);
			$('#progress .lead').text('Data mining complete.');
		}
		
		function changeLayout() {
			$('#header-area').hide();
			$('#navigation-bar').show();
			$('#data-area').show();
			$('body').css('padding-top', '70px');
		}
		
		function stripUrl(url) {
			url = decodeURI(url)
			url = url.replace('http://', '');
			url = url.replace(/\./g, '');
			url = url.replace(/\//g, '');
			url = url.replace(/\?/g, '');
			url = url.replace(/\=/g, '');
			url = url.replace(/\:/g, '');
			url = url.replace(/\@/g, '');
			return url;
		}
		$('#url-field').focus(function() {
			$('#url-help span').fadeIn();
		}).blur(function() {
			$('#url-help span').fadeOut();
		});
		$('#url-field').keyup(function() {
			if ($(this).val().toLowerCase().indexOf('http://') >= 0) {
				$(this).val($(this).val().replace('http://', ''));
			}
		});
		$('#url-form').submit(function(event) {
			event.preventDefault();
			changeLayout();
			var urlIn = $('#url-field').val();
			$('#websiteName').text(urlIn);
			var el = document.createElement('a');
			el.href = 'http://' + urlIn;
			networkLocation = el.hostname;
			protocol = el.protocol;
			console.log('nLoc: ' + protocol + '//' + networkLocation);
			if (urlIn != '') {
				$('#url-help span').hide();
				$('#progress').hide();
				$('#progress .lead').text('Analyzing Social Engagement...');
				$('#init-msg').fadeIn('slow');
				// Let's set up the table. First refresh.
				$('#data-body').html('');
				addLinkToList('http://' + urlIn);
				getLinksYahoo(0);
			}
		});
	});