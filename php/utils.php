<?php

function sqlToArray($arr, $key) {
	$returnArr = array();
	foreach($arr as $item) {
		$returnArr[] = $item[$key];
	}
	return $returnArr;
}

// Generate an authentication token
// Input:
//  $tokenSize:     Length of token
// Returns:             Generated token
function generateToken($tokenSize) {
    $s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return generateString($tokenSize, $s);
}

// Generate an new password
// Returns:             New password - 7-digit number
function generatePassword() {
    $s = '0123456789';
    return generateString(NEW_PASSWORD_SIZE, $s);
}

// Generate a string given a character set and length
// Inputs:  
//  $length             Length of string to be generated
//  $charset            Character set used to build string
// Returns:             Generated string
function generateString($length, $charset) {
    $p = '';
    for ($i=0; $i<$length; $i++) {
        $p .= substr($charset, rand(0,strlen($charset)), 1);
    }
    return $p;  
}



?>