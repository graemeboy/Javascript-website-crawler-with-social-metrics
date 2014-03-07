//createCoolGraph();

function createCoolGraph() {
	var base = 'http://viperchill.com';
	var data = {
'http://viperchill.com/aweber': 17238,
'http://www.viperchill.com': 682,
'http://www.viperchill.com/bluehost': 14138,
'http://www.viperchill.com/facebook-fan-page': 668,
'http://www.viperchill.com/future-of-blogging': 1119,
'http://www.viperchill.com/hey': 890,
'http://www.viperchill.com/keyword-research': 1266,
'http://www.viperchill.com/new-seo': 992,
'http://www.viperchill.com/twitter-followers': 691,
'http://www.viperchill.com/wordpress-seo': 715
	};
	var margin = {
		top: 20,
		right: 30,
		bottom: 30,
		left: 40
	},width = 960 - margin.left - margin.right,
	height = 700 - margin.top - margin.bottom;
	
	var keys = d3.keys(data);
	var values = d3.values(data);
	var entries = d3.entries(data);
	var spaceForAxis = 200;
		
	var x = d3.scale.ordinal()
		.rangeRoundBands([0, width])
		.domain(keys, function (k) { return k; });
	
	var y = d3.scale.linear()
		.range([height - spaceForAxis, 0])
		.domain([0, d3.max(values)]);
	
	var xAxis = d3.svg.axis().scale(x).orient("bottom");
	var yAxis = d3.svg.axis().scale(y).orient("left");
	
	// Set up the chart
	var chart = d3.select(".chart-2").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	// Create the axis
	chart.append("g").attr("class", "x axis").attr("transform", "translate(0," + (height - spaceForAxis) + ")").call(xAxis).selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)" 
                });
	chart.append("g").attr("class", "y axis").call(yAxis);
	
	chart.selectAll(".bar")
		.data(entries).enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d, i) { return i * x.rangeBand(); })
			.attr("y", function(d) { return y(d.value); })
			.attr("height", function(d) { return height - spaceForAxis - y(d.value); })
			.attr("width", x.rangeBand())
}

function graphTopPostDistribution(allShares) {
	console.log(allShares);
	var sortable = [];
	for (var link in allShares)
		sortable.push([link, allShares[link]])
	sortable.sort(function(a, b) {
		return b[1] - a[1]
	});
	var topTen = sortable.slice(0, 10);
	console.log(topTen);
	
	// Map to JSON, because I don't know how to do d3 with arrays.
	var data = {};
	for (var i = 0; i < topTen.length; i++) {
		data[topTen[i][0]] = topTen[i][1];
	}
	
	console.log(data);
		
	var margin = {
		top: 20,
		right: 30,
		bottom: 30,
		left: 40
	},width = 960 - margin.left - margin.right,
	height = 700 - margin.top - margin.bottom;
	
	var keys = d3.keys(data);
	var values = d3.values(data);
	var entries = d3.entries(data);
	var spaceForAxis = 200;
		
	var x = d3.scale.ordinal()
		.rangeRoundBands([0, width])
		.domain(keys, function (k) { return k; });
	
	var y = d3.scale.linear()
		.range([height - spaceForAxis, 0])
		.domain([0, d3.max(values)]);
	
	var xAxis = d3.svg.axis().scale(x).orient("bottom");
	var yAxis = d3.svg.axis().scale(y).orient("left");
	
	// Set up the chart
	var chart = d3.select(".chart-2").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	// Create the axis
	chart.append("g").attr("class", "x axis").attr("transform", "translate(0," + (height - spaceForAxis) + ")").call(xAxis).selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)" 
                });
	chart.append("g").attr("class", "y axis").call(yAxis);
	
	chart.selectAll(".bar")
		.data(entries).enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d, i) { return i * x.rangeBand(); })
			.attr("y", function(d) { return y(d.value); })
			.attr("height", function(d) { return height - spaceForAxis - y(d.value); })
			.attr("width", x.rangeBand());
}

function graphNetworkFrequency(networkData) {
	var entries = d3.entries(networkData);
	var values = d3.values(networkData);
	var keys = d3.keys(networkData);
	var barWidth = width / values.length;
	console.log(entries);
	console.log(d3.max(entries, function(d) {
		return d.value;
	}));
	var colors = [
		'#3b5998', // facebook
		'#00aced', // twitter
		'#007bb6', // linkedin
		'#cb2027', // pinterest
	];
	var margin = {
		top: 20,
		right: 30,
		bottom: 30,
		left: 40
	},
		width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;
	var x = d3.scale.ordinal().rangeRoundBands([0, width]).domain(keys)
	var y = d3.scale.linear().range([height, 0]).domain([0, d3.max(values)]);
	var xAxis = d3.svg.axis().scale(x).orient("bottom");
	var yAxis = d3.svg.axis().scale(y).orient("left");
	var chart = d3.select(".chart").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	chart.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
	chart.append("g").attr("class", "y axis").call(yAxis);
	chart.selectAll(".bar").data(entries).enter().append("rect")
		.style('fill', function(d, i) { return colors[i]; })
		.attr("class", "bar").attr("x", function(d, i) {
		return i * x.rangeBand();
	}).attr("y", function(d) {
		return y(d.value);
	}).attr("height", function(d) {
		return height - y(d.value);
	}).attr("width", x.rangeBand());
}