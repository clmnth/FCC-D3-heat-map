const url =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";

let width = 1800;
let height = 600;
let padding = 60;

let section = d3.select("body").append("section");

// Create heading
let heading = section.append("heading");

// Create the graph element
let svg = d3
  .select("body")
  .append("svg")
  .attr("class", "graph")
  .attr("width", width)
  .attr("height", height)
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
  return d3.timeFormat("%B")(new Date(2000, d, 1));
});

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

    console.log(years);

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
      .attr("x", function (d) {return xScale(d.year);})
      .attr("y", function (d) {return yScale(d.month - 1);})
      .attr("width", (width - 2 * padding) / (d3.max(years) - d3.min(years)))
      .attr("height", yScale.bandwidth())
      .attr("data-month", function (d) {return d.month - 1;})
      .attr("data-year", function (d) {return d.year;})
      .attr("data-temp", function (d) {return data.baseTemperature + d.variance;})
      .attr("fill", function (d) {
        // Use a different color for each temperature range
        if (d.variance < -1) {
          return "steelblue";
        } else if (d.variance < -0.5) {
          return "lightsteelblue";
        } else if (d.variance < 0) {
          return "wheat";
        } else if (d.variance < 0.5) {
          return "orange";
        } else if ( d.variance < 1) {
          return "salmon";
        } else {
          return "crimson";
        }
      });

  
  
  
  })
  .catch((error) => console.log(error));