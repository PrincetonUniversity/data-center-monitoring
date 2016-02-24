<?php 
$utc_date = DateTime::createFromFormat(
                'Y-m-d G:i:s', 
                '2015-08-09 13:59:54', 
                new DateTimeZone('UTC')
);

$nyc_date = $utc_date;
$nyc_date->setTimeZone(new DateTimeZone('America/New_York'));

echo $nyc_date->format('Y-m-d g:i:s');

?>