<?php

require_once 'parsecsv.lib.php';

/////////////////////////////////////////
// Import students and periods
/////////////////////////////////////////
// Parse the csv text data into a csv array
function parse($result, $csv, $dataType, $period=null) {	
	$csvObj = new parseCSV();
	$csvObj->parse($csv);
	$csvArray = $csvObj->data;
	if ($dataType == 'periods') {
		DB::query('DELETE FROM schedule');
	}
	if (count($csvArray) > 1) {
		$firstRecord = true;
		foreach($csvArray as $record) {
			if (!$firstRecord) {
				if ($dataType == 'students') {
					parseStudent($record);
				} elseif ($dataType == 'periods') {
					parsePeriod($record, $period);
				}
			}
			$firstRecord = false;
		}
	}
	return $result;
}

// Parse the student data and insert / update the DB
function parseStudent($record) {
	if ($record[STUDENT_ID] != '') {
		DB::insertUpdate('students', array(
			'studentId' 	=> $record[STUDENT_ID],
			'lastname' 		=> $record[LAST_NAME],
			'firstname'		=> $record[FIRST_NAME],
			'middlename'	=> $record[MIDDLE_NAME],
			'gradeLevel' 	=> $record[GRADE_LEVEL],
			'password' 		=> $record[STUDENT_PASSWORD],
			'ethnicity' 	=> $record[ETHNICITY],
			'gender'			=> $record[GENDER],
			'el' 					=> $record[EL],
			'sped' 				=> $record[SPED]
		));	
	}
}

// Parse the period data and insert into the DB
function parsePeriod($record, $period) {
	$fields = ['2', '2-3', '3', '3-4', '4', '4-5', '5', '5-6', '6', '6-7', '7'];
	$fieldPos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
	$studentId = $record[STUDENT_ID];
	for ($i=0; $i<count($fieldPos); $i++) {
		if ($record[$fieldPos[$i]] != " ") {
			DB::insertUpdate('schedule', array(
				'studentId' 	=> $studentId,
				'teacher' 		=> $record[$fieldPos[$i]],
				'period'			=> $fields[$i]
			));				
		}
	}
}

/////////////////////////////////////////
// Query utilities
/////////////////////////////////////////
// Add a where clause
function addWhere($where, $fieldName, $fieldValue) {
	if ($fieldValue != '') {
		$where->add("$fieldName=%s", $fieldValue);
	}
	return $where;
}

?>
