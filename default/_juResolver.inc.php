<!-- START MAIN CONTAINER -->
<section class="main-figure">
	<div class="main-text">
                <span class="title">JURISDICTION RESOLVER</span>

<hr/>

		<span class="title">(under construction)</span>

<h2>&nbsp; TESTS</h2>

<?php

print "geocode=$geocode";
$json = file_get_contents("http://127.0.0.1:3110/this"); // this will require php.ini to be setup to allow fopen over URLs

//$json = file_get_contents("http://127.0.0.1:3102/this");
//$data = json_decode($json);
var_dump($json);

// jurisdiction?isolabel_ext=eq.CO-ANT

/*
 http://127.0.0.1:3110
 /rpc/latlng_to_olc_city?lat=$1&lng=$2
 /rpc/resolver_geocode?code=$2&type=$1&subtype=official
 /rpc/resolver_geo_uri?geouri=$1
 proxy_pass http://127.0.0.1:3110 = _sql
*/

?>

	</div>
</section>
<!-- END VIDEO -->
<!-- START CARDS -->

