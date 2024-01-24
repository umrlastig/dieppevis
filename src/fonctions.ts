let map = document.getElementById("map");


let vitesse_checkbox = document.getElementById("vitesse_checkbox");
let troncon_checkbox = document.getElementById("troncon_checkbox");
let graphe_vitesse = document.getElementById("graphe_vitesse")
let label_vitesse_checkbox = document.getElementById("label_vitesse_checkbox");
let label_troncon_checkbox = document.getElementById("label_troncon_checkbox");
let label_graphe_vitesse = document.getElementById("label_graphe_vitesse")
let graphe_alti = document.getElementById("graphe_alti_checkbox")
let sol_checkbox = document.getElementById("sol_checkbox")
let legende = document.getElementById("legende_div")
let graphe_med = document.getElementById("graphe_med");
let label_checkbox_med = document.getElementById("label_checkbox_med");
let vitesses_cumulees = document.getElementById("vitesses_cumulees")
let plusieurs_vitesses = document.getElementById("plusieurs_vitesses")
let label_vitesses_cumulees = document.getElementById("label_vitesses_cumulees")
let label_plusieurs_vitesses = document.getElementById("label_plusieurs_vitesses")

var size_pt = 10


const marginTop = 50;
const marginRight = 50;
const marginBottom = 50;
const marginLeft = 50;
const width_trace = 1800;
const height_trace = 300;
const width_legend = 1800;
const height_legend = 1800;


import { legendColor, legendSize } from "d3-svg-legend";
import point_parcours from "../data/interpolated/point_parcours.csv";
import nomenclature from "../data/interpolated/nomenclature.csv"
import { controlPoints } from "./controlPoints";

export function distance_depart(i, data) {
    if (i === 0) {
        return 0;
    }

    let dist = 0
    dist += data[i - 1].distance + Math.sqrt(
        Math.pow(data[i].x - data[i - 1].x, 2) +
        Math.pow(data[i].y - data[i - 1].y, 2)
    )
    return dist
}

export function carte_leaflet(data) {


    var map = L.map('map').setView([49.92000738406715, 1.0775347734476912], 10);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);



    proj4.defs("EPSG:3857", "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs");
    proj4.defs("EPSG:4326", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs");

    var pseudomercator = proj4('EPSG:3857');
    var mercator = proj4('EPSG:4326');


    var coordx = data.map((d) => d.x)
    var coordy = data.map((d) => d.y)

    var coordx_control = controlPoints.map((d) => d[0])
    var coordy_control = controlPoints.map((d) => d[1])
    console.log(coordx_control, coordy_control)


    var pointList = [];
    for (var i = 0; i < coordx.length; i++) {
        var pseudomercatorCoords = new L.LatLng(coordx[i], coordy[i])
        var mercatorCoords = proj4(pseudomercator, mercator, [pseudomercatorCoords.lat, pseudomercatorCoords.lng]);

        pointList.push(
            Array(mercatorCoords[1], mercatorCoords[0]))
    }
    new L.Polyline(pointList, {
        color: 'black',
        weight: 2,
        opacity: 1,
        smoothFactor: 1
    }).addTo(map);


    for (var i = 0; i < coordx_control.length; i++) {
        var pseudomercatorCoords = new L.LatLng(coordx_control[i], coordy_control[i])
        var mercatorCoords = proj4(pseudomercator, mercator, [pseudomercatorCoords.lat, pseudomercatorCoords.lng]);
        new L.circleMarker(mercatorCoords.reverse(), {
            color: 'red',
            weight: 3,
            opacity: 0.7,
            fillOpacity: 0.7
        }).addTo(map);
    }
}

export function tracer_ligne(device) {

    for (let i = 0; i < device.length; i++) {
        point_parcours[i].distance = distance_depart(i, point_parcours)
        device[i].distance = distance_depart(i, device)
        device[i].alti1 = point_parcours[i].alti1
    }
    for (let i = 0; i < controlPoints.length; i++) {
        controlPoints[i].distance = device[controlPoints[i][4]].distance
    }
    d3.select('#tracelinaire')
        .remove();

    d3.select('#legende')
        .remove();

    const xScale = d3
        .scaleLinear()
        .domain([0, device[device.length - 1].distance - 100])
        .range([marginLeft, width_trace - marginRight]);


    var Scale_alti = d3
        .scaleLinear()
        .domain([d3.min(point_parcours, d => d.alti1), d3.max(point_parcours, d => d.alti1)])
        .range([5, 10]);



    var lSize = legendSize()
        .scale(Scale_alti)
        .shape('circle')
        .shapePadding(50)
        .labelOffset(20)
        .orient('horizontal');

    var svg = d3.create("svg")
        .attr("width", width_trace)
        .attr("height", height_trace)
        .attr("id", "tracelinaire");
    ;
    var legend_svg = d3.create("svg")
        .attr("width", width_legend)
        .attr("height", height_legend)
        .attr("id", "legende");





    svg
        .selectAll("circle.alti")
        .data(device)
        .enter()
        .append("circle")
        .attr("class", "alti")
        .attr("cx", (d) => xScale(d.distance))
        .attr("cy", height_trace / 2)
        .attr("r", 5)
        .attr("fill", "black")

    svg
        .selectAll("circle.control")
        .data(controlPoints)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d.distance))
        .attr("cy", height_trace / 2)
        .attr("r", 10)
        .attr("fill", "red")




    // const Scale_graphe_alti = d3
    //     .scaleLinear()
    //     .domain([d3.min(device, d => d.alti1), 200])
    //     .range([(height_trace - size_pt - 5) / 2, 5]);

    const Scale_graphe_alti = d3
        .scaleLinear()
        .domain([d3.min(device, d => d.alti1), 200])
        .range([height_trace - (height_trace - size_pt - 5) / 2, height_trace - 5]);


    var line = d3.line()
        .x(d => xScale(d.distance))
        .y(d => Scale_graphe_alti(d.alti1));


    svg
        .datum(device)
        .append("path")
        .attr("class", "lines")
        .attr("id", "lines_alti")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-opacity", 0);

    svg
        .append("g")
        .call(d3.axisLeft(Scale_graphe_alti))
        .attr("transform", "translate(30,0)")
        .attr("class", "axe")
        .attr("id", "axe_alti")

        .style("display", "none");


    trace_1d?.append(svg.node());

    legende?.append(legend_svg.node());

    alti_checkbox.addEventListener('change', function () {


        let circles = svg.selectAll("circle.alti");


        if (alti_checkbox.checked) {
            circles.attr("r", (d) => Scale_alti(d.alti1));

            legend_svg.append("g")
                .attr("class", "legende_alti")
                .attr("transform", "translate(20,50)")
                .call(lSize);

        } else {
            circles.attr("r", 5);
            legend_svg.select(".legende_alti").remove()
        }
    });





    graphe_alti.addEventListener('change', function () {


        let lines = svg.selectAll("#lines_alti")
        let axe = svg.selectAll("#axe_alti")
        if (graphe_alti.checked) {
            lines.attr("stroke-opacity", 1)
            axe.style("display", "block");

        } else {
            lines.attr("stroke-opacity", 0)
            axe.style("display", "none");

        }
    })


}

export function tracer_parcours(device) {

    for (let i = 0; i < device.length; i++) {
        device[i].code = point_parcours[i].CODE_12
    }



    const svg = d3.select('#tracelinaire')

    const legend_svg = d3.select('#legende')
    nomenclature.forEach(e => e.couleur = (e.rouge, e.vert, e.bleu));

    function rgbToHex(r, g, b) {
        return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
    }

    const xScale = d3
        .scaleLinear()
        .domain([0, device[device.length - 1].distance + 100])
        .range([marginLeft, width_trace - marginRight]);

    const color = d3.scaleOrdinal()
        .domain(nomenclature.map((d) => d.code))
        .range(nomenclature.map((e) => rgbToHex(e.rouge, e.vert, e.bleu)));

    const color_legend = d3.scaleOrdinal()
        .domain(nomenclature.map((e) => e.libelle_fr))
        .range(nomenclature.map((e) => rgbToHex(e.rouge, e.vert, e.bleu)));



    svg
        .selectAll("rect.parcours")
        .data(device)
        .enter()
        .append("rect")
        .attr("class", "parcours")
        .attr("x", (d) => xScale(d.distance))
        .attr("y", height_trace / 2 - 5)
        .attr("height", 10)
        .attr('width', 1)
        .attr("fill", (d) => color(d.code))
        .attr("opacity", 0);

    trace_1d?.append(svg.node());

    var legendOrdinal = legendColor()
        .scale(color_legend)
        .shapePadding(20)
        .shapeWidth(20)
        .cells(10)
        .orient("vertical");


    legend_svg.append("g")
        .attr("class", "legendOrdinal")
        .attr("id", "legende_sol")
        .attr("transform", "translate(1500,0)")
        .call(legendOrdinal)
        .attr("opacity", 0);


    sol_checkbox.addEventListener('change', function () {
        let rect = svg.selectAll(".parcours");
        let legende = legend_svg.selectAll("#legende_sol")
        if (sol_checkbox.checked) {
            rect.attr("opacity", 1);
            legende.attr("opacity", 1)

        } else {
            rect.attr("opacity", 0);
            legende.attr("opacity", 0)
        }
    });

}

export function tracer_vitesse(device) {
    label_vitesse_checkbox.style.display = ''
    label_troncon_checkbox.style.display = ''

    label_graphe_vitesse.style.display = ''

    vitesses_cumulees.style.display = 'none'
    plusieurs_vitesses.style.display = 'none'

    label_vitesses_cumulees.style.display = 'none'
    label_plusieurs_vitesses.style.display = 'none'
    graphe_med.style.display = 'none'
    label_checkbox_med.style.display = 'none'

    for (let i = 0; i < device.length; i++) {

        device[i].distance = distance_depart(i, device)
    }

    const svg = d3.select('#tracelinaire')

    const legend_svg = d3.select('#legende')

    svg.selectAll("#lines_vitesse").remove();
    svg.selectAll("#axe_vitesse").remove();
    svg.selectAll("rect.gps").remove()
    legend_svg.select(".legende_vitesse").remove()



    device.forEach(element => {
        element.vitesse_kmh = element.speed * 3.6
    });

    let checkpoints = controlPoints.map(row => row[4]);

    for (let i = 0; i < device.length; i++) {
        let troncon = 0
        for (let c of checkpoints) {
            if (i >= c) {
                troncon += 1
            }
            if (i >= 3438) {
                troncon = 9
            }
        }
        device[i].troncon = troncon
    }


    for (let i = 0; i < device.length; i++) {
        device[i].vitesse_troncon = d3.mean(device.filter(d => d.troncon === device[i].troncon).map(d => d.vitesse_kmh));
    }

    const xScale = d3
        .scaleLinear()
        .domain([0, device[device.length - 1].distance + 100])
        .range([marginLeft, width_trace - marginRight]);

    const Scale_hauteur_vitesse = d3
        .scaleLinear()
        .domain([d3.min(device, d => d.vitesse_kmh), d3.max(device, d => d.vitesse_kmh)])
        .range([5, (height_trace - size_pt - 10) / 2]);

    const Scale_graphe_vitesse = d3
        .scaleLinear()
        .domain([d3.min(device, d => d.vitesse_kmh), d3.max(device, d => d.vitesse_kmh)])
        .range([(height_trace - size_pt - 10) / 2, 5]);



    var color = d3.scaleSequential([0, d3.max(device, d => d.vitesse_kmh)], d3.interpolateReds);
    var color_troncon = d3.scaleSequential([0, d3.max(device, d => d.vitesse_troncon)], d3.interpolateReds);


    var legend = legendColor()
        .scale(color)
        .shapePadding(60)
        .shapeWidth(30)
        .cells(10)
        .orient("horizontal");

    svg
        .append("g")
        .call(d3.axisLeft(Scale_graphe_vitesse))
        .attr("transform", "translate(30,0)")
        .attr("class", "axe")
        .attr("id", "axe_vitesse")

        .style("display", "none");



    svg
        .selectAll("rect.gps")
        .data(device)
        .enter()
        .append("rect")
        .attr("class", "gps")
        .attr("x", (d) => xScale(d.distance))
        .attr('width', 1)
        .attr("fill", (d) => color(d.vitesse_kmh))
        .attr("opacity", 0);

    var line = d3.line()
        .x(d => xScale(d.distance))
        .y(d => Scale_graphe_vitesse(d.vitesse_kmh));

    console.log(device)
    svg
        .datum(device)
        .append("path")
        .attr("id", "lines_vitesse")
        .attr("class", "lines")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-opacity", 0);

    trace_1d?.append(svg.node());

    legende?.append(legend_svg.node());
    vitesse_checkbox.addEventListener('change', function () {

        let rect = svg.selectAll("rect.gps")
        let axe = svg.selectAll("#axe_vitesse")


        if (vitesse_checkbox.checked) {
            troncon_checkbox.checked = false
            legend_svg.select(".legende_vitesse").remove()

            rect.attr("fill", (d) => color(d.vitesse_kmh))
                .attr("height", (d) => Scale_hauteur_vitesse(d.vitesse_kmh))
                .attr("y", (d) => (height_trace - size_pt) / 2 - (Scale_hauteur_vitesse(d.vitesse_kmh)))

            rect.attr("opacity", 1)

            legend_svg.append("g")
                .attr("transform", "translate(20,10)")
                .attr("class", "legende_vitesse")
                .call(legend)
            axe.style("display", "block");


        } else {

            rect.attr("opacity", 0)
            legend_svg.select(".legende_vitesse").remove()
            axe.style("display", "none");

        }
    })


    troncon_checkbox.addEventListener('change', function () {
        let rect = svg.selectAll("rect.gps")
        let axe = svg.selectAll("#axe_vitesse")

        if (troncon_checkbox.checked) {
            vitesse_checkbox.checked = false
            legend_svg.select(".legende_vitesse").remove()
            rect.attr("fill", (d) => color_troncon(d.vitesse_troncon))
                .attr("height", (d) => Scale_hauteur_vitesse(d.vitesse_troncon))
                .attr("y", (d) => (height_trace - size_pt) / 2 - (Scale_hauteur_vitesse(d.vitesse_troncon)))
                .attr("opacity", 1);

            legend_svg.append("g")
                .attr("transform", "translate(20,10)")
                .attr("class", "legende_vitesse")
                .call(legend)
            axe.style("display", "block");

        } else {
            rect.attr("opacity", 0);
            legend_svg.select(".legende_vitesse").remove()

            axe.style("display", "none");

        }
    });


    graphe_vitesse.addEventListener('change', function () {


        let lines = svg.selectAll("#lines_vitesse")
        let axe = svg.selectAll("#axe_vitesse")
        if (graphe_vitesse.checked) {
            lines.attr("stroke-opacity", 1)
            axe.style("display", "block");

        } else {
            lines.attr("stroke-opacity", 0)
            axe.style("display", "none");

        }
    })
}

export function tracer_quartiles(device) {


    vitesses_cumulees.style.display = ''
    plusieurs_vitesses.style.display = ''

    label_vitesses_cumulees.style.display = ''
    label_plusieurs_vitesses.style.display = ''
    graphe_med.style.display = ''
    label_checkbox_med.style.display = ''



    device.forEach(element => {
        element.vitesse_kmh = element.speed * 3.6
        element.firstQuartile_kmh = element.firstQuartile * 3.6
        element.median_kmh = element.median * 3.6
        element.thirdQuartile_kmh = element.thirdQuartile * 3.6


    });
    const xScale = d3
        .scaleLinear()
        .domain([0, device[device.length - 1].distance + 100])
        .range([marginLeft, width_trace - marginRight]);


    for (let i = 0; i < device.length; i++) {

        device[i].distance = distance_depart(i, device)
    }
    const svg = d3.select('#tracelinaire')
    svg.selectAll(".lines_med").remove();
    svg.selectAll("#axe_vitesse_med").remove();



    const Scale_graphe_vitesse = d3
        .scaleLinear()
        .domain([d3.min(device, d => d.vitesse_kmh), d3.max(device, d => d.vitesse_kmh)])
        .range([(height_trace - size_pt - 10) / 2, 5]);

    var line_med = d3.line()
        .x(d => xScale(d.distance))
        .y(d => Scale_graphe_vitesse(d.median_kmh));

    var line_1q = d3.line()
        .x(d => xScale(d.distance))
        .y(d => Scale_graphe_vitesse(d.firstQuartile_kmh));

    var line_3q = d3.line()
        .x(d => xScale(d.distance))
        .y(d => Scale_graphe_vitesse(d.thirdQuartile_kmh));

    var device2 = [
        { distance: device[0].distance, thirdQuartile_kmh: 0, firstQuartile_kmh: 0, median_kmh: 0 },
        ...device,
        { distance: device[device.length - 1].distance, thirdQuartile_kmh: 0, firstQuartile_kmh: 0, median_kmh: 0 }
    ];
    svg
        .datum(device2)
        .append("path")
        .attr("class", "line_med")
        .attr("d", line_3q)
        .attr("fill", "red")
        .attr("stroke", "red")
        .style("display", "none");

    svg
        .datum(device2)
        .append("path")
        .attr("class", "line_med")
        .attr("d", line_1q)
        .attr("fill", "white")
        .attr("stroke", "red")
        .style("display", "none");

    svg
        .datum(device)
        .append("path")
        .attr("class", "line_med")
        .attr("d", line_med)
        .attr("fill", "none")
        .attr("stroke", "black")
        .style("display", "none");




    svg
        .append("g")
        .call(d3.axisLeft(Scale_graphe_vitesse))
        .attr("transform", "translate(30,0)")
        .attr("class", "axe")
        .attr("id", "axe_vitesse_med")

        .style("display", "none");

    trace_1d?.append(svg.node());
    graphe_med.addEventListener('change', function () {


        let lines = svg.selectAll("path.line_med");

        let axe = svg.selectAll("#axe_vitesse_med")
        if (graphe_med.checked) {
            lines.style("display", "block");
            axe.style("display", "block");

        } else {
            lines.style("display", "none");
            axe.style("display", "none");

        }
    })


}

export function tracer_vitesses_cumulees(devices, devices_names) {
    console.log(devices)
    var nbr_devices = devices.length


    devices.forEach(function (element) {
        for (let i = 0; i < element.length; i++) {

            element[i].distance = distance_depart(i, element)
        }
    })



    const svg = d3.select('#tracelinaire')

    const legend_svg = d3.select('#legende')


    svg.selectAll("rect.vitesse_cumul").remove()
    legend_svg.selectAll(".legendOrdinal").remove()




    for (let device of devices) {
        device.forEach(element => {
            element.vitesse_kmh = element.speed * 3.6;
        });
    }



    var device_ref = devices[0]
    let Vmin = Infinity;
    let Vmax = -Infinity;

    for (let device of devices) {
        for (let point of device) {
            if (point.vitesse_kmh < Vmin) { Vmin = point.vitesse_kmh }
            if (point.vitesse_kmh > Vmax) { Vmax = point.vitesse_kmh }
        }
    }
    console.log(Vmin, Vmax)

    const xScale = d3
        .scaleLinear()
        .domain([0, device_ref[device_ref.length - 1].distance + 100])
        .range([marginLeft, width_trace - marginRight]);

    const Scale_hauteur_vitesse = d3
        .scaleLinear()
        .domain([Vmin, Vmax])
        .range([5, (height_trace - size_pt - 10) / (2 * nbr_devices)]);




    for (let i = 0; i < devices.length; i++) {
        for (let j = 0; j < devices[0].length; j++) {

            if (i == 0) {
                devices[i][j].rect_y = (height_trace - size_pt) / 2 - (Scale_hauteur_vitesse(devices[i][j].vitesse_kmh))
                devices[i][j].height = Scale_hauteur_vitesse(devices[i][j].vitesse_kmh)
                devices[i][j].height_tot = devices[i][j].height
            }
            else {
                devices[i][j].rect_y = (height_trace - size_pt) / 2 - (Scale_hauteur_vitesse(devices[i][j].vitesse_kmh)) - devices[i - 1][j].height_tot
                devices[i][j].height = Scale_hauteur_vitesse(devices[i][j].vitesse_kmh)
                devices[i][j].height_tot = devices[i - 1][j].height_tot + devices[i][j].height

            }
        }

    }
    console.log(devices_names)
    var color = d3.scaleOrdinal()
        .domain(devices_names)
        .range(d3.schemeSet1);

    for (let i = 0; i < devices.length; i++) {

        var fill = color(devices_names[i])
        svg
            .append("g")
            .selectAll("rect")

            .data(devices[i])
            .enter()
            .append("rect")
            .attr("class", "vitesse_cumul")
            .attr("x", (d) => xScale(d.distance))
            .attr('width', 1)
            .attr("fill", fill)
            .attr("height", (d) => d.height)
            .attr("y", (d) => d.rect_y)
            .attr("opacity", 0)
    }


    trace_1d?.append(svg.node());


    legende?.append(legend_svg.node());

    vitesses_cumulees.addEventListener('change', function () {

        let rect = svg.selectAll("rect.vitesse_cumul")


        if (vitesses_cumulees.checked) {

            //legend_svg.select(".legende_vitesse").remove()
            rect.attr("opacity", 1)

            var legendOrdinal = legendColor()
                .scale(color)
                .shapePadding(60)
                .shapeWidth(30)
                .cells(10)
                .orient("horizontal");


            legend_svg.append("g")
                .attr("class", "legendOrdinal")
                .attr("transform", "translate(20,10)")
                .call(legendOrdinal);

        } else {

            rect.attr("opacity", 0)
            legend_svg.select(".legendOrdinal")
                .remove()

        }
    })

}

export function tracer_plusieurs_vitesses(devices, devices_names) {

    var nbr_devices = devices.length

    const svg = d3.select('#tracelinaire')
    const legend_svg = d3.select('#legende')

    svg.selectAll("#lines_vitesse_plusieurs").remove()
    svg.selectAll("#axe_vitesse_plusieurs").remove()
    legend_svg.selectAll("#legende_vitesse_plusieurs").remove()



    devices.forEach(function (element) {
        for (let i = 0; i < element.length; i++) {

            element[i].distance = distance_depart(i, element)
        }
    })





    for (let device of devices) {
        device.forEach(element => {
            element.vitesse_kmh = element.speed * 3.6;
        });
    }

    var device_ref = devices[0]
    let Vmin = Infinity;
    let Vmax = -Infinity;

    for (let device of devices) {
        for (let point of device) {
            if (point.vitesse_kmh < Vmin) { Vmin = point.vitesse_kmh }
            if (point.vitesse_kmh > Vmax) { Vmax = point.vitesse_kmh }
        }
    }
    console.log(Vmin, Vmax)

    const xScale = d3
        .scaleLinear()
        .domain([0, device_ref[device_ref.length - 1].distance + 100])
        .range([marginLeft, width_trace - marginRight]);

    const Scale_graphe_vitesse = d3
        .scaleLinear()
        .domain([Vmin, Vmax])
        .range([(height_trace - size_pt - 10) / 2, 5]);



    var color = d3.scaleOrdinal()
        .domain(devices_names)
        .range(d3.schemeSet1);
    console.log(devices[0])



    for (let i = 0; i < devices.length; i++) {

        var stroke = color(devices_names[i])
        var line = d3.line()
            .x(d =>
                xScale(d.distance)

            )
            .y(d =>
                Scale_graphe_vitesse(d.vitesse_kmh)
            )

        svg
            .datum(devices[i])
            .append("path")
            .attr("id", "lines_vitesse_plusieurs")
            .attr("d", line)
            .attr("fill", "none")
            .attr("stroke", stroke)
            .attr("stroke-opacity", 0);

    }

    svg
        .append("g")
        .call(d3.axisLeft(Scale_graphe_vitesse))
        .attr("transform", "translate(30,0)")
        .attr("class", "axe")
        .attr("id", "axe_vitesse_plusieurs")
        .style("display", "none");

    var legendOrdinal = legendColor()
        .scale(color)
        .shapePadding(60)
        .shapeWidth(30)
        .cells(10)
        .orient("horizontal");


    trace_1d?.append(svg.node());


    legende?.append(legend_svg.node());

    plusieurs_vitesses.addEventListener('change', function () {

        let path = svg.selectAll("#lines_vitesse_plusieurs")

        let axe = svg.selectAll("#axe_vitesse_plusieurs")


        if (plusieurs_vitesses.checked) {

            //legend_svg.select(".legende_vitesse").remove()
            path.attr("stroke-opacity", 1)
            axe.style("display", "block")



            legend_svg.append("g")
                .attr("class", "legendOrdinal")
                .attr("id", "legende_vitesse_plusieurs")
                .attr("transform", "translate(20,10)")
                .call(legendOrdinal);

        } else {

            path.attr("stroke-opacity", 0)
            legend_svg.select(".legendOrdinal")
                .remove()
            axe.style("display", "none")


        }
    })

}