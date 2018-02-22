function timeline(data) {
    let start = d3.min(data, element => { return element.Date });
    let end = d3.max(data, element => { return element.Date });
    xScale = d3.scaleTime()
        .domain([d3.timeDay.offset(start, -1), d3.timeDay.offset(end, 1)])
        .range([padding, w - padding]);
    yScale = d3.scaleLinear()
        .domain([0, d3.max(data, element => { return element.Amount })])
        .range([h - padding, padding]);

    let svg = d3.select("body")
        .append("svg")
        .attr("class", "myPlot")
        .attr("width", w)
        .attr("height", h);
    svg.selectAll("line")
        .data(data)
        .enter()
        .append("line")
        .attr("x1", (params) => {
            return xScale(params.Date)
        })
        .attr("x2", (params) => {
            return xScale(params.Date)
        })
        .attr('y1', (params) => {
            return h - padding
        })
        .attr('y2', (params) => {
            return yScale(params.Amount)
        })
        .attr("stroke", "#ddd")
        .attr("stroke-width", 1);
    svg.selectAll('circle')
        .data(data)
        .enter()
        .append("circle")
        .attr('cx', (params) => {
            return xScale(params.Date)
        })
        .attr('cy', (params) => {
            return yScale(params.Amount)
        })
        .attr('r', 6)
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(d3.axisBottom(xScale)
            .tickFormat(formatTime));

    //Create Y axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(d3.axisLeft(yScale));
}