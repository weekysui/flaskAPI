// create dropdown values

d3.json("/names",function(error,response){
    if(error) throw error;
    var dropdown = document.getElementById("selDataset");
    for (var i = 0,ii=response.length;i<ii;i++){
        var $option = document.createElement("option");
        $option.innerText=response[i];
        $option.setAttribute("value",response[i])
        dropdown.appendChild($option);
    };
});

// initial value
defaultSample = "BB_940"
function init(sample){
    var metaUrl = `/metadata/${sample}`;
    d3.json(metaUrl,function(error,response){
        if(error) throw error;
        var sampleData = d3.select("#metadataSample")
        sampleData.append("p").text(`AGE: ${response.AGE}`)
        sampleData.append("p").text(`BBTYPE: ${response.BBTYPE}`)
        sampleData.append("p").text(`ETHNICITY: ${response.ETHNICITY}`)
        sampleData.append("p").text(`GENDER: ${response.GENDER}`)
        sampleData.append("p").text(`LOCATION: ${response.LOCATION}`)
        sampleData.append("p").text(`SAMPLEID: ${response.SAMPLEID}`)
    })
    var url = `/samples/${sample}`;
    console.log(url);
    d3.json(url,function(error,response){
        if(error) throw error;
        var values = response[0]["sample_values"].slice(0,10);
        var labels = response[0]["otu_ids"].slice(0,10);
        console.log(values)
    
        var $hoverText = []
        
        for(var i = 0, ii=labels.length;i<ii;i++){
            var query_url = `/otu/${labels[i]}`
            d3.json(query_url,function(error,otuResponse){
                if(error) throw error;
                $hoverText.push(otuResponse[0])
            })
        }
        console.log($hoverText)
        
        var data1 = [{
            "values":values,
            "labels":labels,
            "type":"pie",
            "text":$hoverText
        }]

        Plotly.newPlot("pie",data1)
        var data2 = [{
            "x":response[0]["otu_ids"],
            "y":response[0]["sample_values"],
            "mode":"markers",
            "type":"scatter",
            "marker":{
                "size":response[0]["sample_values"],
                "color":response[0]["otu_ids"]
            },
            "text":$hoverText,
            // "hoverinfo": {bordercolor: 'black'}
        }];
        var layout = {
            xaxis:{
                title:"OTU ID"
            },
            yaxis:{
                title:"Sample Values"
            }
        }
        Plotly.newPlot("bubble_chart",data2,layout)  
    })
    freq_url = `/wfreq/${sample}`
    d3.json(freq_url,function(error,freqResponse){
        if(error) throw error;
        var level = freqResponse*20;
        var degree = 180-level,
            radius = .5;
        var radians = degree * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);
        var mainPath = "M -.0 -0.025 L .0 0.025 L",
            pathX = String(x),
            space = ' ',
            pathY = String(y),
            pathEnd = ' Z';
        var path = mainPath.concat(pathX,space,pathY,pathEnd);
        var data3 = [{ type: 'scatter',
            x: [0], y:[0],
            marker: {size: 15, color:'850000'},
            showlegend: false,
            hoverinfo: 'name'},
            {values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
            rotation: 90,
            text:['8-9', '7-8', '6-7', '5-6','4-5', '3-4', '2-3', '1-2','0-1'," "],
            textinfo:"text",
            textposition:"inside",
            marker: {colors:['rgba(14, 126, 0, .5)','rgba(14, 126, 0, .5)','rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
            'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
            'rgba(210, 206, 145, .5)','rgba(230, 208, 157, .5)' ,'rgba(260, 209, 160, .5)',
            'white']},
            labels: ['8-9', '7-8', '6-7', '5-6','4-5', '3-4', '2-3', '1-2','0-1'," "],
            hoverinfo:'label',
            height:520,
            width:520,
            hole:.5,
            type:'pie',
            showlegend:false
        }];
        var layout = {
            shapes:[{
                type: 'path',
                path: path,
                fillcolor: '850000',
                line: {
                    color: '850000'
                },
            }],
            title:"<b>Belly Button Washing Frequency</b><br>Washes per Week",
            height: 450,
            margin: {
                top: 50,
                bottom: 10,
                right: 10,
                left: 10
            },
            xaxis: {zeroline:false, showticklabels:false,
                        showgrid: false, range: [-1, 1]},
            yaxis: {zeroline:false, showticklabels:false,
                        showgrid: false, range: [-1, 1]}
            };
            
        
        Plotly.newPlot("gauge",data3,layout)
    })
}
init(defaultSample);
function getData(new_samples){
    d3.select("#metadataSample").selectAll('p').remove();
    init(new_samples)
}




