function barChart(dataset) {
    var xScale = d3.scaleBand()
        .domain(d3.range(dataset.length))
        .range([0, w])
        .round(true)
        .paddingInner(0.05);
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset)])
        .range([0, h - padding]);

    let svg = d3.select("body")
        .append("svg")
        .attr("class", "myPlot")
        .attr("width", w)
        .attr("height", h);

    svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            return xScale(i);
        })
        .attr("y", function (d) {
            return h - yScale(d);
        })
        .attr("width", xScale.bandwidth())
        .attr("height", function (d) {
            return yScale(d);
        })
    svg.selectAll("text")
        .data(dataset)
        .enter()
        .append("text")
        .text(function (d) {
            return d;
        })
        .attr("text-anchor", "middle")
        .attr("x", function (d, i) {
            return xScale(i) + xScale.bandwidth() / 2;
        })
        .attr("y", function (d) {
            return h - yScale(d) + 14;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "black");

    d3.select("p")
        .on("click", function () {
            //New	values	for	dataset
            dataset = [11, 12, 15, 20, 18, 17, 16, 18, 23, 25,
                5, 10, 13, 19, 21, 25, 22, 18, 15, 13];
            //Update	all	rects
            svg.selectAll("rect")
                .data(dataset)
                .transition()
                .delay((params, i) => {
                    return i / dataset.length * 1000;
                })
                .duration(1200)
                .ease(d3.easePolyInOut)
                .attr("y", function (d) {
                    return h - yScale(d);
                })
                .attr("height", function (d) {
                    return yScale(d);
                });
            svg.selectAll("text")
                .data(dataset)
                .transition()
                .delay((params, i) => {
                    return i / dataset.length * 1000;
                })
                .duration(1200)
                .ease(d3.easePolyInOut)
                .text((params) => {
                    return params
                })
                .attr("y", function (d) {
                    return h - yScale(d) + 14;
                });
        });
}