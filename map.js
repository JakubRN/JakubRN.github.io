var selectedQuarter = '';
var selectedTime = '';

var possibleIDS = ['Q1', 'Q2', 'Q3', 'Q4', 'Night', 'Day']

var toggledClusters = {
    p: {
        C1: false,
        C2: false,
        C3: false,
        C4: false,
        C5: false,
        C6: false
    },
    d: {
        C1: false,
        C2: false,
        C3: false,
        C4: false,
        C5: false,
        C6: false
    }
}

function clearToggledClusters() {
    Object.keys(toggledClusters).forEach(function (objectKey, index) {
        Object.keys(toggledClusters[objectKey]).forEach((nestedId) => {
            toggledClusters[objectKey][nestedId] = false;
        })
    });
}

function selectQuarter(quarter) {
    if (selectedQuarter != '') document.getElementById(selectedQuarter).style.backgroundColor = 'darkslategrey'
    if (selectedQuarter == quarter) {
        selectedQuarter = '';
    } else {
        selectedQuarter = quarter;
        document.getElementById(quarter).style.backgroundColor = 'dodgerblue'
    }
}

function selectTime(time) {
    if (selectedTime != '') document.getElementById(selectedTime).style.backgroundColor = 'darkcyan'
    if (time == selectedTime) {
        selectedTime = ''
    } else {
        selectedTime = time
        document.getElementById(time).style.backgroundColor = 'cornflowerblue'
    }
}



let w = 1000;
let h = w;


var projection = d3.geoMercator()
    .translate([w / 2, h / 2])
    .center([-73.94, 40.73])
    .scale([w * 90]);
//Define path generator
var path = d3.geoPath()
    .projection(projection);
//Create SVG element
var mapContainer = d3.select("#map")
    .append("svg")
    .attr("width", w)
    .attr("height", h);
//Load in GeoJSON data
d3.json("boroughs.json", function (map) {
    //Bind data and create one path per GeoJSON feature
    mapContainer.selectAll("path")
        .data(map.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", function (d) {
            return d.properties.BoroName;
        })
    mapContainer.selectAll("text")
        .data(map.features)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", function (d) {
            return path.centroid(d)[0];
        })
        .attr("y", function (d) {
            return path.centroid(d)[1];
        })
        .text(function (d) {
            return d.properties.BoroName;
        });

    d3.json('onlyCenters.json', (clusterCentres) => {
        console.log("Cluster centers:")
        console.log(clusterCentres);
        let wholeClusters = {}
        let clusterConnections = {}

        function displayClusters() {
            clearToggledClusters();
            mapContainer.selectAll("line").remove()
            mapContainer.selectAll("circle").remove()
            //drawLineBetweenClusters();
            displayClusterCentres("p");
            displayClusterCentres("d");
        }

        function refreshCentres() {
            // mapContainer.selectAll('.Pickup_cluster_centre').remove()
            // mapContainer.selectAll('.Dropoff_cluster_centre').remove()
            displayClusterCentres("p");
            displayClusterCentres("d");
        }
        let radius = 25;
        let baseRadius = 4;

        function displayClusterCentres(pickupOrdropoff) {
            let translation;
            if (pickupOrdropoff == 'p') {
                translation = 'Pickup'
            } else if (pickupOrdropoff == 'd') {
                translation = 'Dropoff'
            }
            let filteredData = clusterCentres[pickupOrdropoff]
            if (selectedQuarter != '') {
                filteredData = filteredData[selectedQuarter];
            }
            if (selectedTime != '') {
                filteredData = filteredData[selectedTime];
            }
            console.log(filteredData)
            let circles = mapContainer.selectAll(['.', translation, '_cluster_centre'].join(''))
                .data(filteredData['clusterData'])
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return projection([d[translation.concat('_longitude')], d[translation.concat('_latitude')]])[0];
                })
                .attr("cy", function (d) {
                    return projection([d[translation.concat('_longitude')], d[translation.concat('_latitude')]])[1];
                })
                .attr("r", (d, i) => {
                    let clusterID = "C".concat((i + 1).toString())
                    if (toggledClusters[pickupOrdropoff][clusterID]) {
                        return radius * filteredData["Portions"][i] * 2 + filteredData["Portions"][i] * 20 + baseRadius;
                    } else return radius * filteredData["Portions"][i] + baseRadius
                })
                .attr('opacity', (d, i) => {
                    let clusterID = "C".concat((i + 1).toString())
                    if (toggledClusters[pickupOrdropoff][clusterID]) {
                        return 0.2 + filteredData["Portions"][i] * 1.5;
                    } else return 0.4 + filteredData["Portions"][i] * 1.5;
                })
                .attr("class", translation.concat('_cluster_centre'))
                .on("click", (d, i) => {
                    handleMouseClick(i + 1, pickupOrdropoff)
                })
        }

        function handleMouseClick(i, pickupOrdropoff) {
            mapContainer.selectAll("circle").remove()
            mapContainer.selectAll(".dropoff_pickup_line").remove()
            let clusterID = "C".concat((i).toString())
            if (toggledClusters[pickupOrdropoff][clusterID] == false) {
                clearToggledClusters();
                toggledClusters[pickupOrdropoff][clusterID] = true;
                drawLinesBetweenClusters(i, pickupOrdropoff)
                if (selectedQuarter != "" && selectedTime != "" && !jQuery.isEmptyObject(wholeClusters)) {
                    showCluster(pickupOrdropoff, clusterID)
                }
            } else {

                toggledClusters[pickupOrdropoff][clusterID] = false;
                //hideClusters(pickupOrdropoff, clusterID)
            }

            refreshCentres();
        }

        function showCluster(pickupOrdropoff, clusterID) {
            let reverse
            if (pickupOrdropoff == 'p') {
                translation = 'Pickup'
                reverse = "Dropoff"
            } else if (pickupOrdropoff == 'd') {
                translation = 'Dropoff'
                reverse = 'Pickup'
            }
            let filteredData = wholeClusters[pickupOrdropoff][selectedQuarter][selectedTime][clusterID]
            drawCluster(filteredData, reverse, clusterID)
            drawCluster(filteredData, translation, clusterID)

        }
        let colors = {
            Pickup: '#3f238b',
            Dropoff: '#a52801',
        }

        function drawCluster(filteredData, PickuporDropoff, clusterID) {
            mapContainer.selectAll(['.', clusterID, PickuporDropoff, '_cluster_data'].join(''))
                .data(filteredData)
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return projection([d[PickuporDropoff.concat('_longitude')], d[PickuporDropoff.concat('_latitude')]])[0];
                })
                .attr("cy", function (d) {
                    return projection([d[PickuporDropoff.concat('_longitude')], d[PickuporDropoff.concat('_latitude')]])[1];
                })
                .attr("r", 1)
                .attr("fill", colors[PickuporDropoff])
                .attr("opacity", 0.70)
                .attr("class", [clusterID, PickuporDropoff, , '_cluster_data'].join(''))
        }

        function hideClusters(pickupOrdropoff, clusterID) {
            mapContainer.selectAll(['.', clusterID, pickupOrdropoff, '_Pickup', '_cluster_centre'].join('')).remove()
            mapContainer.selectAll(['.', clusterID, pickupOrdropoff, '_Dropoff', '_cluster_centre'].join('')).remove()
        }

        function drawLinesBetweenClusters(i, pickupOrdropoff) {
            let filteredConnections = clusterConnections
            let filteredData = clusterCentres[pickupOrdropoff]
            let otherData = clusterCentres[reverse(pickupOrdropoff)]
            if (selectedQuarter != '') {
                filteredConnections = filteredConnections[selectedQuarter];
                filteredData = filteredData[selectedQuarter];
                otherData = otherData[selectedQuarter];
            }
            if (selectedTime != '') {
                filteredConnections = filteredConnections[selectedTime];
                filteredData = filteredData[selectedTime];
                otherData = otherData[selectedTime];
            }
            let retardedString = pickupOrdropoff.concat('Cluster');
            let maxCount = 0;
            let finalArray = []
            filteredConnections['Connections'].forEach((data, index) => {
                if (data[retardedString] == i) {
                    if (data['Count'] > maxCount) {
                        maxCount = data['Count'];
                    }
                    otherIndex = data[reverse(pickupOrdropoff).concat('Cluster')];
                    finalArray.push(Object.assign({}, {
                        count: data['Count'],
                        primary: Object.values(filteredData['clusterData'][i - 1]),
                        secondary: Object.values(otherData['clusterData'][otherIndex - 1])
                    }))
                }
            })

            function reverse(retardedString) {
                if (retardedString == 'p') {
                    return 'd'
                } else if (retardedString == 'd') {
                    return 'p'
                }
            }
            mapContainer.selectAll(".dropoff_pickup_line")
                .data(finalArray)
                .enter()
                .append("line")
                .attr("x1", function (d) {
                    return projection([d.primary[0], d.primary[1]])[0];
                })
                .attr("y1", function (d) {
                    return projection([d.primary[0], d.primary[1]])[1];
                })
                .attr("x2", function (d) {
                    return projection([d.secondary[0], d.secondary[1]])[0];
                })
                .attr("y2", function (d) {
                    return projection([d.secondary[0], d.secondary[1]])[1];
                })
                .attr("class", "dropoff_pickup_line")
                .attr("stroke-width", (d) => {
                    return (d.count / maxCount) * (radius * 2 * filteredData["Portions"][i - 1] + baseRadius)
                })
            mapContainer.selectAll(".dropoff_pickup_line_begin")
                .data(finalArray)
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return projection([d.primary[0], d.primary[1]])[0];
                })
                .attr("cy", function (d) {
                    return projection([d.primary[0], d.primary[1]])[1];
                })
                .attr("fill", 'black')
                .attr("r", (d) => {
                    return (d.count / maxCount) * (radius * filteredData["Portions"][i - 1] + baseRadius)
                })
                .attr('opacity', 1)
                .attr("class", 'dropoff_pickup_line_begin')

            mapContainer.selectAll(".dropoff_pickup_line_ends")
                .data(finalArray)
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return projection([d.secondary[0], d.secondary[1]])[0];
                })
                .attr("cy", function (d) {
                    return projection([d.secondary[0], d.secondary[1]])[1];
                })
                .attr("fill", 'black')
                .attr("r", (d) => {
                    return (d.count / maxCount) * (radius * filteredData["Portions"][i - 1] + baseRadius)
                })
                .attr('opacity', 1)
                .attr("class", 'dropoff_pickup_line_ends')
        }
        displayClusters()
        possibleIDS.forEach(id => {
            var h = document.getElementById(id);
            h.addEventListener('click', displayClusters.bind(this));
        })
        d3.json('wholeClusters.json', (loadedData) => {
            console.log(loadedData);
            wholeClusters = loadedData;
        })
        d3.json('Connections.json', (con) => {
            console.log(con);
            clusterConnections = con;
        })

    })
});