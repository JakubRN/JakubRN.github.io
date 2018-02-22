function drawEurope(data) {
    data.forEach(element => {
        element.longitude = parseFloat(element.longitude);
        element.latitude = parseFloat(element.latitude);
    });

    let xScale = d3.scaleLinear()
        .domain([d3.min(data, function (d) { return d.longitude }),
        d3.max(data, function (d) { return d.longitude })])
        .range([padding, w - padding]);
    let yScale = d3.scaleLinear()
        .domain([d3.min(data, function (d) { return d.latitude }),
        d3.max(data, function (d) { return d.latitude })])
        .range([h - padding, padding]);

    //maybe only some countries?
    function myFilter(d) {
        //if (d.country == 'Turkey') {
        return d;
        //}
    }

    var svg2 = d3.select("body")
        .append("svg")
        .attr("class", "myPlot")
        .attr("width", w)
        .attr("height", h);
    //circles
    svg2.selectAll("circle")
        .data(data.filter(myFilter))
        .enter()
        .append("circle")
        .attr("cx", function (d) { return xScale(d.longitude) })
        .attr("cy", function (d) { return yScale(d.latitude) })
        .attr("r", 2);
    //text
    svg2.selectAll("text")
        .data(data.filter(myFilter))
        .enter()
        .append("text")
        .text(function (d) {
            return toFixed(d.longitude, 1) + ","
                + toFixed(d.latitude, 1);
        })
        .attr('x', function (d) {
            return xScale(d.longitude) + 3;
        })
        .attr('y', function (d) { return yScale(d.latitude); });
    //scales
    svg2.append('g')
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(d3.axisBottom(xScale));
    svg2.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(d3.axisLeft(yScale));
}