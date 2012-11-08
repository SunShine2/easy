<?php
    header('Content-type: text/javascript');
    $a = $_REQUEST['a'];
    $ret = '{"a":"' . $a . '","b":"2","t":' . time() . '}';
    $callback = $_REQUEST['callback'];
    echo($callback . "(" . $ret . ")");
?>
