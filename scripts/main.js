function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}

function sortArray()
{
  const labels = pointStyle;
  const data1 = data;
  
  const allData = [];
  for (let i = 0; i < labels.length; ++i) {
      allData.push({
          label: labels[i],
          data: data1[i]
      });
  }
  
  allData.sort((a, b) => a.data - b.data);
  
  // And split them again
  const sortedPointStyle = allData.map(e => e.label);
  const sortedData = allData.map(e => e.data);
}

function buildChart(title, xLabel, yLabel)
{
    sortArray();
  
    var ctx = document.getElementById('theChart');

    ctx.style.backgroundColor = '#ffffff';

    const chart = new Chart(ctx, {
      type: 'scatter',  
      data: {
            datasets: [{
            data: sortedData
            }]
        },
        options: {
            title: {
                display: true,
                text: title,
                position: 'top',
                fontSize: 48,
                fontColor: '#000000'
            },
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: xLabel,
                        fontSize: 24,
                        fontColor: '#000000'
                    },
                    ticks: {
                       fontSize: 24,
                       fontColor: '#000000'
                    },
                    gridLines: {
                        color: "#000000"
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: yLabel,
                        fontSize: 24,
                        fontColor: '#000000'
                    },
                    ticks: {
                        fontSize: 24,
                        fontColor: '#000000'
                    },
                    gridLines: {
                        color: "#000000"
                    }
                }],
              animation: false
            }
//          ,devicePixelRatio: 10
        },
        plugins: {
            afterUpdate: chart => {
                chart.getDatasetMeta(0).data.forEach((d, i) => d._model.pointStyle = sortedPointStyles[i]);
            }
        }
    });
}

