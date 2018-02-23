


function stackedBarchart() {

    var formatTime = d3.timeFormat("%e");
    let padding = 60;
    let textSpace = 200;
    let width = document.getElementById("body").clientWidth
    let w = width - textSpace;
    let h = width * 2 / 3;
    let newData = new Array();
    let rawArray = new Array();
    let visible = {
        zero: true,
        one: true,
        two: true,
        three: true
    }
    var formatMonth = d3.timeFormat("%m");
    var colors = d3.scaleOrdinal(d3.schemeCategory20c);
    var rowConverter = function (d) {
        //var format = d3.time.format("%b");
        let result;
        var parseTime = d3.timeParse("%b");

        if (d.Index == 0)
            return {
                Month: parseTime(d.Month),
                zero: parseInt(d.Count),
                one: 0,
                two: 0,
                three: 0
            };
        else if (d.Index == 1)
            return {
                Month: parseTime(d.Month),
                zero: 0,
                one: parseInt(d.Count),
                two: 0,
                three: 0
            };
        else if (d.Index == 2)
            return {
                Month: parseTime(d.Month),
                zero: 0,
                one: 0,
                two: parseInt(d.Count),
                three: 0
            };
        else if (d.Index == 3)
            return {
                Month: parseTime(d.Month),
                zero: 0,
                one: 0,
                two: 0,
                three: parseInt(d.Count)
            };
    }


    d3.csv("ass1.csv", rowConverter, function (error, data) {
        if (error) {
            throw error;
        }

        data.forEach(element => {
            result = newData.find((params) => {
                return (element.Month.getTime() == params.Month.getTime())
            })
            if (result) {
                result.zero += element.zero;
                result.one += element.one;
                result.two += element.two;
                result.three += element.three;
                //data.splice(element, 1);
            }
            else { newData.push(element) }
        });
        $.extend(true, rawArray, newData);
        var stack = d3.stack()
            .keys(["zero", 'one', 'two', 'three'])
            .order(d3.stackOrderAscending);
        //Data,	stacked
        let series = stack(newData);
        var xScale = d3.scaleBand()
            .domain(newData.map(function (d) { return d.Month; }))
            .range([padding, w - padding])
            .round(true)
            .paddingInner(0.2);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(newData, (params) => {
                return params.zero + params.one + params.two + params.three;
            })])
            .range([h - padding, padding]);

        let svg = d3.select("body")
            .append("svg")
            .attr("class", "myPlot")
            .attr("width", width)
            .attr("height", h);

        var groups = svg.selectAll("g")
            .data(series)
            .enter()
            .append("g")
            .style("fill", function (d, i) {
                return colors(i);
            });
        //	Add	a	rect	for	each	data	value
        var rects = groups.selectAll("rect")
            .data(function (d) { return d; })
            .enter()
            .append("rect")
            .attr("x", function (d, i) {
                return xScale(d.data.Month);
            })
            .attr("y", function (d) {
                return yScale(d[1]);
            })
            .attr("height", function (d) {
                return yScale(d[0]) - yScale(d[1]);
            })
            .attr("width", xScale.bandwidth());


        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (h - padding) + ")")
            .call(d3.axisBottom(xScale)
                .tickFormat(d3.timeFormat("%b")));

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + padding + ",0)")
            .call(d3.axisLeft(yScale).tickFormat(d3.format("d")));
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 0 - (h / 2))
            .attr("y", padding - 40)
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .text("# of Unique Kinds of Produce");



        svg.append("text")
            .attr("x", w / 2)
            .attr("y", padding - 40)
            .attr("font-size", "24px")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .text("NYC Green Market - Unique Produce Types");

        let offset = 50;
        let widthOffset = textSpace / 6;
        let squareSize = 20;
        svg.append("rect").attr("id", "FH")
            .attr("x", w + widthOffset)
            .attr("y", h / 2 + offset * 2)
            .attr("width", squareSize)
            .attr("height", squareSize).attr("fill", colors(0));
        svg.append("text").attr("x", w + widthOffset + 25)
            .attr("y", h / 2 + offset * 2 + squareSize * (2 / 3)).text("Fruits Harvest").attr("font-size", "14px");

        svg.append("rect").attr("id", "FS")
            .attr("x", w + widthOffset)
            .attr("y", h / 2 + offset)
            .attr("width", squareSize)
            .attr("height", squareSize).attr("fill", colors(1));
        svg.append("text").attr("x", w + widthOffset + 25)
            .attr("y", h / 2 + offset + squareSize * (2 / 3)).text("Fruits Storage").attr("font-size", "14px");

        svg.append("rect").attr("id", "VH")
            .attr("x", w + widthOffset)
            .attr("y", h / 2)
            .attr("width", squareSize)
            .attr("height", squareSize).attr("fill", colors(2));
        svg.append("text").attr("x", w + widthOffset + 25)
            .attr("y", h / 2 + squareSize * (2 / 3)).text("Veggies Harvest").attr("font-size", "14px");

        svg.append("rect").attr("id", "VS")
            .attr("x", w + widthOffset)
            .attr("y", h / 2 - offset)
            .attr("width", squareSize)
            .attr("height", squareSize).attr("fill", colors(3));
        svg.append("text").attr("x", w + widthOffset + 25)
            .attr("y", h / 2 - offset + squareSize * (2 / 3)).text("Veggies Storage").attr("font-size", "14px");

        svg.selectAll("rect")
            .on("click", function (params) {
                var key;
                bttn = d3.select(this).attr("id");
                if (bttn == "FH") {
                    if (visible.zero) {
                        visible.zero = false;
                        newData.forEach(element => {

                            element.zero = 0;
                        });
                    }
                    else {
                        visible.zero = true;
                        for (let index = 0; index < rawArray.length; index++) {
                            newData[index].zero = rawArray[index].zero;

                        }
                    };
                }
                if (bttn == "FS") {
                    if (visible.one) {
                        visible.one = false;
                        newData.forEach(element => {

                            element.one = 0;
                        });
                    }
                    else {
                        visible.one = true;
                        for (let index = 0; index < rawArray.length; index++) {
                            newData[index].one = rawArray[index].one;

                        }
                    };

                }
                if (bttn == "VH") {
                    if (visible.two) {
                        visible.two = false;
                        newData.forEach(element => {

                            element.two = 0;
                        });
                    }
                    else {
                        visible.two = true;
                        for (let index = 0; index < rawArray.length; index++) {
                            newData[index].two = rawArray[index].two;

                        }
                    };

                }
                if (bttn == "VS") {
                    if (visible.three) {
                        visible.three = false;
                        newData.forEach(element => {
                            element.three = 0;
                        });
                    }
                    else {
                        visible.three = true;
                        for (let index = 0; index < rawArray.length; index++) {
                            newData[index].three = rawArray[index].three;

                        }
                    };

                }
                let yMaximum = d3.max(newData, (params) => {
                    return params.zero + params.one + params.two + params.three;
                })
                yScale.domain([0, yMaximum])

                series = stack(newData);

                groups = svg.selectAll("g")
                    .data(series)

                //	Add	a	rect	for	each	data	value
                var rects = groups.selectAll("rect")
                    .data(function (d) { return d; })
                    .transition()
                    .delay((params, i) => {
                        return i / series.length * 500;
                    })
                    .duration(1200)
                    .ease(d3.easePolyInOut)
                    .attr("y", function (d) {
                        return yScale(d[1]);
                    })
                    .attr("height", function (d) {
                        return yScale(d[0]) - yScale(d[1]);
                    })
                let numberofticks;
                if (yMaximum < 8) {
                    numberofticks = yMaximum
                }
                else {
                    numberofticks = 8;
                }
                svg.select(".y.axis")
                    .transition()
                    .delay((params, i) => {
                        return i / series.length * 500;
                    })
                    .duration(1200)
                    .ease(d3.easePolyInOut)
                    .call(d3.axisLeft(yScale).ticks(numberofticks, (d3.format("d"))));

                // Update Y axis
            })

    });
}