let linechartHeight = h / 4;
let padding = 50;
let quarters = ['Q1', 'Q2', 'Q3', 'Q4']
let times = ['Night', 'Day']
let transitionDuration = 700
let rowConverter = (data) => {
    {
        return {
            Day: new Date(data.Day),
            Count: Number(data.Count),
        }
    }
}
let tripsEachDay = []
let lineChartXScale, lineChartYScale;
let linecharts;
let xAxis, yAxis;
let line, wholePath;
d3.csv('TimelineData.csv', rowConverter, (trips) => {
    tripsEachDay = trips
    console.log(tripsEachDay);

    linecharts = d3.select("#fullTimeline")
        .append("svg")
        .attr("width", w)
        .attr("height", linechartHeight)
        .attr("class", 'linechart');

    lineChartXScale = d3.scaleTime()
        .domain([
            d3.min(tripsEachDay, function (d) {
                return d.Day;
            }),
            d3.max(tripsEachDay, function (d) {
                return d.Day;
            })
        ])
        .range([padding, w - padding]);
    lineChartYScale = d3.scaleLinear()
        .domain([
            0,
            d3.max(tripsEachDay, function (d) {
                return d.Count;
            })
        ])
        .range([linechartHeight - padding, padding]);

    xAxis = d3.axisBottom()
        .scale(lineChartXScale)
    //Define Y axis
    yAxis = d3.axisLeft()
        .scale(lineChartYScale)
        .ticks(6)

    line = d3.line()
        .x(function (d) {
            return lineChartXScale(d.Day);
        })
        .y(function (d) {
            return lineChartYScale(d.Count);
        });
    linecharts.append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("x", padding)
        .attr("y", 0)
        .attr("width", w - 2 * padding)
        .attr("height", linechartHeight)
    linecharts.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + (linechartHeight - padding) + ")")
        .call(xAxis);
    linecharts.append("g")
        .attr("class", "yAxis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);
    wholePath = linecharts.append("path")
        .attr("clip-path", "url(#clip)")
        .datum(tripsEachDay)
        .attr("width", w - 2 * padding)
        .attr("height", linechartHeight)
        .attr("d", line)
        .attr("class", "line")

})
quarters.forEach((element) => {
    var h = document.getElementById(element);
    h.addEventListener('click', zoomTimelines.bind(this));
})

times.forEach((element) => {
    var h = document.getElementById(element);
    h.addEventListener('click', changeTimeline.bind(this));
})
let dayNightLineChart;
let dayNightxAxis, dayNightYAxis;
let lineDay, pathDay;
let lineNight, pathNight;


function zoomTimelines() {
    switch (selectedQuarter) {
        case 'Q1':
            lineChartXScale.domain([tripsEachDay[0].Day, tripsEachDay[92].Day]);
            break;
        case 'Q2':
            lineChartXScale.domain([tripsEachDay[84].Day, tripsEachDay[190].Day]);
            break;
        case 'Q3':
            lineChartXScale.domain([tripsEachDay[180].Day, tripsEachDay[280].Day]);
            break;
        case 'Q4':
            lineChartXScale.domain([tripsEachDay[270].Day, tripsEachDay[364].Day]);
            break;
        default:
            lineChartXScale.domain([tripsEachDay[0].Day, tripsEachDay[364].Day]);
    }
    wholePath.transition().duration(transitionDuration).attr('d', line)
    linecharts.select('.xAxis')
        .transition().duration(transitionDuration)
        .attr("transform", "translate(0," + (linechartHeight - padding) + ")")
        .call(xAxis)
    linecharts.select('.yAxis').attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);

    pathDay.transition().duration(transitionDuration).attr('d', lineDay)
    pathNight.transition().duration(transitionDuration).attr('d', lineNight)
    dayNightLineChart.select('.xAxis')
        .transition()
        .duration(transitionDuration)
        .attr("transform", "translate(0," + (linechartHeight - padding) + ")")
        .call(dayNightxAxis)

    dayNightLineChart.select('.yAxis')
        .attr("transform", "translate(" + padding + ",0)")
        .call(dayNightYAxis);
}

function changeTimeline() {
    switch (selectedTime) {
        case 'Day':
            console.log('hello')
            dayNightLineChart
                .select('.lineDay')
                .transition()
                .duration(transitionDuration)
                .style('opacity', 0.9)
            dayNightLineChart
                .select('.lineNight')
                .transition()
                .duration(transitionDuration)
                .style('opacity', 0)
            break;
        case 'Night':
            dayNightLineChart
                .select('.lineNight')
                .transition()
                .duration(transitionDuration)
                .style('opacity', 0.9)
            dayNightLineChart
                .select('.lineDay')
                .transition()
                .duration(transitionDuration)
                .style('opacity', 0)
            break;
        default:
            dayNightLineChart
                .select('.lineNight')
                .transition()
                .duration(transitionDuration)
                .style('opacity', 0.6)
            dayNightLineChart
                .select('.lineDay')
                .transition()
                .duration(transitionDuration)
                .style('opacity', 0.6)
    }
}

let rowConverter2 = (data) => {
    return {
        Day: new Date(data.Day),
        CountNight: Number(data.CountNight),
        CountDay: Number(data.CountDay),
    }
}

d3.csv('TimelineDataDayNight.csv', rowConverter2, (tripsDayNight) => {
    console.log(tripsDayNight)
    dayNightLineChart = d3.select("#dayNightTimeline")
        .append("svg")
        .attr("width", w)
        .attr("height", linechartHeight)
        .attr("class", 'linechart');

    let lineChartYScale = d3.scaleLinear()
        .domain([
            0,
            d3.max(tripsDayNight, function (d) {
                return (d.CountDay > d.CountNight) ? d.CountDay : d.CountNight
            })
        ])
        .range([linechartHeight - padding, padding]);

    dayNightxAxis = d3.axisBottom()
        .scale(lineChartXScale)
    //Define Y axis
    dayNightYAxis = d3.axisLeft()
        .scale(lineChartYScale)
        .ticks(6)

    lineDay = d3.line()
        .x(function (d) {
            return lineChartXScale(d.Day);
        })
        .y(function (d) {
            return lineChartYScale(d.CountDay);
        });
    lineNight = d3.line()
        .x(function (d) {
            return lineChartXScale(d.Day);
        })
        .y(function (d) {
            return lineChartYScale(d.CountNight);
        });
    dayNightLineChart.append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("x", padding)
        .attr("y", 0)
        .attr("width", w - 2 * padding)
        .attr("height", linechartHeight)
    dayNightLineChart.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + (linechartHeight - padding) + ")")
        .call(dayNightxAxis);
    dayNightLineChart.append("g")
        .attr("class", "yAxis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(dayNightYAxis);
    pathNight = dayNightLineChart.append("path")
        .datum(tripsDayNight)
        .attr("clip-path", "url(#clip)")
        .attr("d", lineNight)
        .attr("class", "lineNight")
    pathDay = dayNightLineChart.append("path")
        .datum(tripsDayNight)
        .attr("clip-path", "url(#clip)")
        .attr("d", lineDay)
        .attr("class", "lineDay")
})