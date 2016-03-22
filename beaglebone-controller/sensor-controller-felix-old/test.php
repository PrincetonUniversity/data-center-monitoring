<html>
<head>
<title>BeagleBone Temperature</title>
<script type="text/javascript" src="https://www.google.com/jsapi"></script>
    <script type="text/javascript">
      google.load("visualization", "1", {packages:["corechart"]});
      google.setOnLoadCallback(drawChart);
      function drawChart() {
		  
        var data = google.visualization.arrayToDataTable([
          ['ID', 'X', 'Y', 'Temperature'],
          ['',   80,  167,      120],
          ['',   79,  136,      130],
          ['',   78,  184,      50],
          ['',   72,  278,      230],
          ['',   81,  200,      210],
          ['',   72,  170,      100],
          ['',   68,  477,      80]
        ]);
			  
	   var data1 = google.visualization.arrayToDataTable([


			  	<?php
			  	$con = mysqli_connect("localhost", "bone", "root", "TempDB");
	
			  	$query = "SELECT * FROM LabTemperature ORDER BY timeUCT DESC LIMIT 1";
			  	$result = mysqli_query($con, $query);
			  	mysqli_close($con);
	
			  	while($row = mysqli_fetch_array($result)) {
			  	//$row = mysqli_fetch_array($result)
			  			//$uct_time = $row['timeUCT'];
				       // $uct_time = $row['timeUCT']
						$sensor0Temp = $row['sensor0'];
						$sensor1Temp = $row['sensor1'];
						$sensor2Temp = $row['sensor2'];
						$sensor3Temp = $row['sensor3'];
						$sensor4Temp = $row['sensor4'];
						$sensor5Temp = $row['sensor5'];
						$sensor6Temp = $row['sensor6'];
						$sensor7Temp = $row['sensor7'];
						$sensor8Temp = $row['sensor8'];
						$sensor9Temp = $row['sensor9'];
						//$uct_time = $row['timeUCT']
						//$sensor2Temp =34;
					}
						
						//$sensor1Temp = 23;
						?>
			
			  			// $utc_date = DateTime::createFromFormat('Y-m-d G:i:s',$uct_time,new DateTimeZone('UTC'));

			  			//$time = $utc_date->setTimeZone(new DateTimeZone('America/New_York'));
			
			  			//$temp = $row['sensor0'];
		          ['ID', 'Horizontal Distance', 'Height', 'Temperature'],
		          ['sensor0',    1,       2,       <?php echo $sensor0Temp; ?>],
		          ['sensor1',    2,       5,       <?php echo $sensor1Temp; ?>],
		          ['sensor2',    3,       7,       <?php echo $sensor2Temp; ?>],
		          ['sensor3',    4,       8,       <?php echo $sensor3Temp; ?>],
		          ['sensor4',    5,       9,       <?php echo $sensor4Temp; ?>],
		          ['sensor5',    6,       2,       <?php echo $sensor5Temp; ?>],
		          ['sensor6',    7,        4,      <?php echo $sensor6Temp; ?>],
		          ['sensor7',    8,        6,      <?php echo $sensor7Temp; ?>],
		          ['sensor8',    9,        3,      <?php echo $sensor8Temp; ?>],
		          ['sensor9',    10,        8,     <?php echo $sensor9Temp; ?>]
       
						
			  ]);
			  
			  
			  var data2 = google.visualization.arrayToDataTable([
			  ['Time', 'Temperature'],

			          <?php
			          $con = mysqli_connect("localhost", "bone", "root", "TempDB");

			          $query = "SELECT timeUCT,sensor1 FROM LabTemperature ORDER BY timeUCT DESC LIMIT 3600";
			          $result = mysqli_query($con, $query);
			          mysqli_close($con);

			          while ($row = mysqli_fetch_array($result))
			                  {
			                          $time = $row['timeUCT'];
			                          $temp = $row['sensor1'];
			                          echo "['$time', $temp],";
			                  }
			                  ?>
			  ]);	  
			  
			  
			  
        var options = {
          colorAxis: {colors: ['yellow', 'red']}
        };
		
		var options1 = {
		        title: 'The current temperature in a DataCenter',
		        hAxis: {title: 'Horizontal Distance'},
		        vAxis: {title: 'Height'},
		        colorAxis: {colors: ['blue', 'red']}
		      };
	   
	   var options2 = {
			  title: 'BeagleBone Measured Temperature: sensor1',
			  vAxis: { title: "Degrees Celsius" }
			  };
			  
        var chart = new google.visualization.BubbleChart(document.getElementById('chart_div'));
        chart.draw(data, options);
		
		var chart1 = new google.visualization.BubbleChart(document.getElementById('scatter'));
		      chart1.draw(data1, options1);
			  
	    var chart2 = new google.visualization.LineChart(document.getElementById('scatter2'));
			chart2.draw(data2, options2);
		    
      }
    </script>
  </head>
	  
</head>
<body>
<div id="chart_div" style="width: 900px; height: 500px;">
		
</div>
<div id="scatter" style="width: 900px; height: 500px;"></div>

<div id="scatter2" style="width: 900px; height: 500px;"></div>
<div> <?php 
	echo  "['sensor10',    1,       2, ]";
	echo $sensor2Temp;
	echo $sensor9Temp;
	
	?> </div>
</body>
</html>