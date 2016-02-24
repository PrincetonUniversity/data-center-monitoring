<html>
<head>
<title>BeagleBone Temperature</title>
<script type="text/javascript" src="https://www.google.com/jsapi"></script>
    <script type="text/javascript">
google.load("visualization", "1", {packages:["corechart"]});
google.setOnLoadCallback(firstChart);

var i = 0;

/* initialize chart */
function drawChart(data, options) {
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);
    return(chart);
}

/* update the chart */
function updateChart(data, chart, options) {
    //i = (i + 1);
   
	data.removeRow(0);
	
    data.addRow(getData);
	
    chart.draw(data, options);
    
    setTimeout(function(){updateChart(data, chart, options)}, 5000);
}


function firstChart() {
   /* set variables */
    var data = google.visualization.arrayToDataTable([
    ['Time', 'Temperature'],

        <?php
		$$GLOBALS['lastIndex'] = 0;
		
        $con = mysqli_connect("localhost", "bone", "root", "TempDB");

        $query = "SELECT timeUCT,sensor1,id FROM LabTMP ORDER BY timeUCT ASC LIMIT 30";
        $result = mysqli_query($con, $query);
        mysqli_close($con);
		
        while ($row = mysqli_fetch_array($result))
                {
					
                        $time = $row['timeUCT'];
                        $temp = $row['sensor1'];
						
						$GLOBALS['lastIndex'] = $row['id']; 
						
                        echo "['$time', $temp],";
						
                }
				//$lastIndex = 34;
                ?>
]);
    
 var options = {
	  title: 'BeagleBone Measured Temperature: sensor1',
	  vAxis: { title: "Degrees Celsius" }
	  };
	
    var chart = drawChart(data, options);
    
    //updateChart(data, chart, options);
	getData(data, chart, options);
}

function getData(data, chart, options) {
   /* set variables */
	
	var data1 = [
        <?php
		
        $con = mysqli_connect("localhost", "bone", "root", "TempDB");
		 
		$newId = $GLOBALS['lastIndex'] + 1;
		$newId = $newId + 1;
		$queryexecuted = 'This above is being executed';
		
        $query = "SELECT timeUCT,sensor1,id FROM LabTMP WHERE id > ". $newId ." LIMIT 1";
		
		$queryexecuted1 = 'This below  is being executed';
		
        $result = mysqli_query($con, $query);
        mysqli_close($con);
		$row = mysqli_fetch_array($result);
		
        $time = $row['timeUCT'];
        $temp = $row['sensor1'];
		
		$GLOBALS['lastIndex'] = $row['id'];
		/*
        while ($row = mysqli_fetch_array($result)) {
					
                        $time = $row['timeUCT'];
                        $temp = $row['sensor1'];
						
						$GLOBALS['lastIndex'] = $row['id']; 
						
                        //echo ['$time', $temp];
						//echo "['2015-08-11 17:24:09', 29],";
						
                } */
		// echo "['2015-08-11 17:24:09', 29],";
		echo "['$time', $temp],";
		
                ?>
	];
		
   //var data2 = data1;

   data.removeRow(0);

   //data.addRow(["<?php echo $time; ?>", <?php echo $GLOBALS['temp']; ?>]);
   
   data.addRows(data1);
   
   chart.draw(data, options);

   setTimeout(function(){getData(data, chart, options)}, 5000);
}

</script>
	  
</head>
<body>
<div id="chart_div" style="width: 900px; height: 500px;">
<div> <?php 
//echo "This statement is being read";
echo "global". $GLOBALS['lastIndex'];
echo "     "; 
echo $newId;

//echo 'felix had ' + $felix + 'when we saw him';
//echo '$GLOBALS['lastIndex']';
?> </div>
</body>
</html>