d3.csv("coord_list_subset.csv", function(error, data) {

	// var random = d3.randomNormal(0, 0.2),
	// 	sqrt3 = Math.sqrt(3),
	// 	points0 = d3.range(300).map(function() { return [random() + sqrt3, random() + 1, 0]; }),
	// 	points1 = d3.range(300).map(function() { return [random() - sqrt3, random() + 1, 1]; }),
	// 	points2 = d3.range(300).map(function() { return [random(), random() - 1, 2]; }),
	// 	points = d3.merge([points0, points1, points2]);
	// console.log(data)

	var margin = {top: 30, right: 30, bottom: 30, left: 50},
		width = 0.5 * window.innerWidth - margin.left - margin.right,
		height = 0.5 * width - margin.top - margin.bottom;

	// var div = d3.select("#dimensionality").append("div")
	// 	.attr("id", "tooltip")
	// 	.attr("class", "hidden")
	// 	.append("p")
	// 	.append("span")
	// 	.attr("id","value");

	var svg = d3.select("#dim_svg").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var tooltip = d3.select("#svg").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

	var x0 = [0,1],
		y0 = [0,1],
		x = d3.scaleLinear().domain(x0).range([0, width]),
		y = d3.scaleLinear().domain(y0).range([height, 0]),
		z = d3.scaleOrdinal(d3.schemeCategory10);

	var xAxis = d3.axisBottom(x),
		yAxis = d3.axisLeft(y);

	var brush = d3.brush().on("end", brushended),
		idleTimeout,
		idleDelay = 350;

	svg.append("clipPath")
		.attr("id", "chart-area")
		.append("rect")
		.attr("width", width)
		.attr("height", height);

	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis);

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	svg.append("g")
		.attr("class", "brush")
		.call(brush);

	svg.append("g")
			.attr("id", "circles")
			.attr("clip-path", "url(#chart-area)")
		.selectAll("circle")
			.data(data)
			.enter().append("circle")
			.attr("cx", function(d) { return x(d.x_val); })
			.attr("cy", function(d) { return y(d.y_val); })
			.attr("r", 3)
			.attr("fill", "orange")
			.attr("class", "circles");

	svg.selectAll(".circles").on("mouseover", function(d) {
			var xPosition = d3.select(this).attr("cx");
			var yPosition = d3.select(this).attr("cy");
			//console.log(document.getElementById("svg").offsetLeft);
			d3.select("#staticimg")
				.style("opacity",0);
			tooltip
				.style("left", xPosition + "px")
				.style("top", yPosition + "px")
				.select("#value")
				.text("Entrez ID: " + d.name);
			d3.select("#tooltip").classed("hidden", false);
		})
		.on("mouseout", function(d) {
			d3.select("#staticimg")
				.style("opacity",1);
			d3.select("#tooltip").classed("hidden", true);
		});

	svg.append('svg:image')
		.attr("id", "staticimg")
		.attr('xlink:href', 'images/embedding_static_area.png')
		.attr("width", width)
		.attr("height", height)
		.style("pointer-events", "none");

	d3.selectAll(".brush").on("mouseover", function() {
		d3.select("#staticimg")
			.style("opacity",0);
	});

	d3.selectAll(".brush").on("mouseout", function() {
		d3.select("#staticimg")
			.style("opacity",1);
	});

	function brushended() {
		var s = d3.event.selection;
		if (!s) {
			if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
			x.domain(x0);
			y.domain(y0);
		} else {
			x.domain([s[0][0], s[1][0]].map(x.invert, x));
			y.domain([s[1][1], s[0][1]].map(y.invert, y));
			svg.select(".brush").call(brush.move, null);
		}
		zoom();
	}

	function idled() {
		idleTimeout = null;
	}

	function zoom() {
		var t = svg.transition().duration(750);
		svg.select(".x.axis").transition(t).call(xAxis);
		svg.select(".y.axis").transition(t).call(yAxis);
		svg.selectAll("circle").transition(t)
			.attr("cx", function(d) { return x(d.x_val); })
			.attr("cy", function(d) { return y(d.y_val); });
	}

});