const url =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";

let width = 1600;
let height = 600;
let padding = 60;

let section = d3.select("body").append("section");

// Create heading
let heading = section.append("heading");

// Colors setup
let colorScale = d3
  .scaleThreshold()
  // .domain([-1,5, -0.5, -0.1, 0.5, 1, 1.5])
  .domain([-1.25, -0.75, -0.25, 0.25, 0.75, 1.25])
  .range([
    "steelblue",
    "lightsteelblue",
    "lightcyan",
    "wheat",
    "orange",
    "salmon",
    "crimson"
  ]);

let colorLabels = ["-1.5", "-1", "-0.5", "0", "0.5", "1", "1.5"];

// Create the graph element
let svg = d3
  .select("body")
  .append("svg")
  .attr("class", "graph")
  .attr("width", width)
  .attr("height", height + 90)
  .attr("fill", "red");

// Create the group element to hold element
let g = svg.append("g");

// Create the x scale
let xScale = d3.scaleLinear().range([padding, width - padding]);
// Create the x axes
let xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

// Create the x scale
let yScale = d3.scaleBand().range([30, height - padding]);
// Create the y axes
let yAxis = d3.axisLeft(yScale).tickFormat(function (d) {
  // %B is a time format specifier that returns month name
  return d3.timeFormat("%B")(new Date(0, d, 1));
});

// Create the tooltip
let tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("width", "100px")
  .style("opacity", 0);

// Create the legend
let legend = svg
  .append("g")
  .attr("id", "legend")
  .attr("transform", "translate(" + padding + "," + (height - 8) + ")");

// Create the legend title
legend
  .append("text")
  .attr("class", "legend-title")
  .style("fill", "black")
  .attr("x", 0)
  .attr("y", -8)
  .text("Variance");

// Create the legend colors
let legendColors = legend
  .selectAll("rect")
  .data(colorScale.range())
  .enter()
  .append("rect")
  .attr("class", "legend-cell")
  .attr("x", function (d, i) {
    return i * 90;
  })
  .attr("y", 0)
  .attr("width", 90)
  .attr("height", 10)
  .attr("fill", function (d) {
    return d;
  });

// Create the legend color labels
legend
  .selectAll("g")
  .data(colorLabels)
  .enter()
  .append("g")
  .attr("class", "legend-label")
  .attr("transform", function (d, i) {
    return "translate(" + i * 90 + ", 20)";
  })
  .append("text")
  .text(function (d) {
    return d;
  })
  .attr("x", 45)
  .attr("y", 5)
  .style("text-anchor", "middle")
  .style("fill", "black")
  .style("font-size", "12px");

d3.json(url)
  .then((data) => {
    let years = data.monthlyVariance.map((d) => {
      return d.year;
    });
    let months = data.monthlyVariance.map(function (d) {
      return d.month;
    });
    let variances = data.monthlyVariance.map(function (d) {
      return d.variance;
    });

    // Set up heading
    heading
      .append("h1")
      .attr("id", "title")
      .text("Monthly Global Land-Surface Temperature");
    // Set up description
    heading
      .append("h3")
      .attr("id", "description")
      .html(
        data.monthlyVariance[0].year +
          " - " +
          data.monthlyVariance[data.monthlyVariance.length - 1].year +
          ": base temperature " +
          data.baseTemperature +
          "&#176;" +
          "C"
      );

    // Define the x scale using json data
    xScale.domain([d3.min(years), d3.max(years)]);

    // Set ticks very 10 years
    xAxis.ticks(Math.round((d3.max(years) - d3.min(years)) / 10));

    // Add the x-axis
    g.append("g")
      .attr("id", "x-axis")
      .attr("transform", "translate(0, " + (height - padding) + " )")
      .call(xAxis);

    // Define the y scale
    yScale.domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

    // Add the y-axis
    g.append("g")
      .attr("id", "y-axis")
      .attr("transform", "translate( " + padding + ", 0 )")
      .call(yAxis);

    // Create the cells
    g.selectAll(".cell")
      .data(data.monthlyVariance)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", function (d) {
        return xScale(d.year);
      })
      .attr("y", function (d) {
        return yScale(d.month - 1);
      })
      .attr("width", (width - 2 * padding) / (d3.max(years) - d3.min(years)))
      .attr("height", yScale.bandwidth())
      .attr("data-month", function (d) {
        return d.month - 1;
      })
      .attr("data-year", function (d) {
        return d.year;
      })
      .attr("data-temp", function (d) {
        return data.baseTemperature + d.variance;
      })
      .attr("fill", function (d) {
        return colorScale(d.variance);
      })

      // Tooltip generation
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget)
          .attr("stroke", "white")
          .attr("stroke-width", 2);
        tooltip
          .transition()
          .duration(100)
          .style("opacity", 0.9)
          .attr("data-year", d.year);
        tooltip

          .html(
            d.year +
              " - " +
              d3.timeFormat("%B")(new Date(d.year, d.month - 1)) +
              "<br />" +
              "Variance: " +
              d3.format("+.1f")(d.variance) +
              "&#176;" +
              "C"
          )
          .style("left", event.pageX + -20 + "px")
          .style("top", event.pageY - 65 + "px");
      })
      .on("mouseout", () => {
        d3.select(event.currentTarget)
          .attr("stroke", null)
          .attr("stroke-width", null);
        tooltip.transition().duration(200).style("opacity", 0);
      });
  })
  .catch((error) => console.log(error));
