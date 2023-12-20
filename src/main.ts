import * as d3 from "d3";
// import data3607 from "../data/interpolated/interpolation_3607.csv";
import data3607 from "../data/interpolated/interpolation_3607.csv";
import { controlPoints } from "./controlPoints";

// Declare the chart dimensions and margins.
const width = 640;
const height = 400;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 40;

async function start() {
  console.log("data", data3607);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let record of data3607) {
    if (record.x < minX) minX = record.x;
    if (record.x > maxX) maxX = record.x;
    if (record.y < minY) minY = record.y;
    if (record.y > maxY) maxY = record.y;
  }
  console.log("minx", minX, "maxX", maxX, "minY", minY, "maxY", maxY);
  const xScale = d3
    .scaleLinear()
    .domain([minX - 100, maxX + 100])
    .range([marginLeft, width - marginRight]);

  const yScale = d3
    .scaleLinear()
    .domain([minY - 100, maxY + 100])
    .range([height - marginBottom, marginTop]);

  const svg = d3.create("svg").attr("width", width).attr("height", height);

  //add points
  svg
    .selectAll("circle")
    .data(data3607)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.x))
    .attr("cy", (d) => yScale(d.y))
    .attr("r", 1)
    .attr("fill", "black");

  // add control points
  svg
    .selectAll("circle.control")
    .data(controlPoints)
    .enter()
    .append("circle")
    .attr("class", "control")
    .attr("cx", (d) => xScale(d[0]))
    .attr("cy", (d) => yScale(d[1]))
    .attr("r", 3)
    .attr("fill", "red");

  document.getElementById("app")?.append(svg.node());
}

start();
