function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/plotly_chart/static/data/samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("/plotly_chart/static/data/samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("/plotly_chart/static/data/samples.json").then((data) => {

    // 3. Create a variable that holds the samples array. 
    var samples = data.samples;
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var resultArray = samples.filter(sampleObj => sampleObj.id == sample);
    //  5. Create a variable that holds the first sample in the array.
    var result = resultArray[0];
    //console.log(result); 

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    //Need to make sure records are sorted by sample_values before slicing
    result.sample_values.sort((a, b) => parseInt(b) - parseInt(a)); 
    var otu_ids = result.otu_ids
    var otu_labels = result.otu_labels;
    var sample_values = result.sample_values;
    // console.log(otu_ids);
    // console.log(otu_labels);
    // console.log(sample_values);

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 
   // var sortedByArrow = otu_ids.sort((a, b) => b - a);
   // console.log(sortedByArrow);
    var yticks = otu_ids.slice(0, 10).reverse().map(otu => 'OTU ' + otu)
    var xvalues = sample_values.slice(0,10).reverse()
    var barlabels = result.otu_labels.slice(0, 10).reverse();

    // 8. Create the trace for the bar chart. 
    var barData = [
      {     
        x: xvalues,
        y: yticks,
        type: "bar", // line, bar, pie: uses labels,values vs x,y
        orientation: 'h',
        text: barlabels
      }
    ];
    //console.log(barData);
    // 9. Create the layout for the bar chart. 
    var barLayout = {
      title: {text: "Top 10 Bacteria Cultures Found"}
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout);

    // 1. Create the trace for the bubble chart.
    var bubbleData = [{
      x: otu_ids,
      y: sample_values,
      text: otu_labels,
      mode: "markers",
        marker: {
          size: sample_values,
          color: otu_ids,
         // sizeref: 2.0 * Math.max(sample_values) / (1**2),
          colorscale: "Geyser"
        }
    }];
    //console.log(data);
    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      hovermode:'closest',
      title: {text: "Bacteria Cultures Per Sample"},
      xaxis: {title: "OTU ID"},
      margin: {
        l: 50,
        r: 50,
        b: 100,
        t: 100,
        pad: 4
      }
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot('bubble', bubbleData, bubbleLayout);

    //gauge
    var wfreq = data.metadata.filter(meta => meta.id == sample)[0].wfreq; 
    //console.log(wfreq);
    var gaugeData = [{
      value: wfreq,
      type: "indicator",
      mode: "gauge+number",
      title: {text: "<b>Belly Button Washing Frequency</b><br>Scrubs Per Week</br>"},
      gauge: {
        axis: { range: [null, 10], tickwidth: "2" },
        bar: { color: "black" },
        bgcolor: "white",
        borderwidth: 1,
        bordercolor: "black",
        steps:[
          {range: [0, 2], color: "red"},
          {range: [2, 4], color: "orange"},
          {range: [4, 6], color: "yellow"},
          {range: [6, 8], color: "lightgreen"},
          {range: [8, 10], color: "green"}
        ]
      }
    }];

    var layout = { width: 600, height: 500, margin: { t: 0, b: 0 } };
    Plotly.newPlot('gauge', gaugeData, layout);
  
});
}
