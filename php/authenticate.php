<?php

define ("TOKEN_SIZE", 15);
define ("NEW_PASSWORD_SIZE", 7);
define ("EXPIRE_TIME", 30);  				// Minutes

// Authenticate username / password
// Inputs:
//  $result
// 	$username
//  $password
// Returns:
//  $result['user']: 			User array
//  $result['token']
//  $result['expires']
function authenticate($result, $username, $password) {
	$validate = DB::query("SELECT * FROM users WHERE id=%s AND password=%s", $username, $password);
	if (DB::count() == 1) {
		// Valid username/password
		$result['user'] = $validate[0];
		unset($result['user']['password']);
		$result['username'] = $username;
		$result['token'] = generateToken(TOKEN_SIZE);
		DB::query("UPDATE users SET token=%s, expires=%i WHERE id=%s", $result['token'], time()+EXPIRE_TIME, $username);
	} else {
		// Invalid
		$result['error'] = true;
		$result['errorType'] = 'password';
		$result['errorInfo'] = 'Password not correct';
	}
	return $result;
}

// Validate username and token and check expiration
// Inputs:
//	$result
//	$username
// 	$token
// Returns 
// 	$result[error]: 				True if error
//  $result['errorType']:		Error code
// 	$result['errorInfo']: 	Plain text error
function validate($result, $username, $token) {
	$validate = DB::query("SELECT * FROM users WHERE id=%s", $username);
	$result['role'] = $validate[0]['role'];
	// print_r($validate); echo $token; die();
	if (DB::count() != 1) {
		$result['error'] = true;
		$result['errorType'] = 'notFound';
		$result['errorInfo'] = 'Username not found';
	} elseif ($validate[0]['token'] != $token) {		
		$result['error'] = true;
		$result['errorType'] = 'noToken';
		$result['errorInfo'] = 'Invalid session';
	} elseif (time() > $validate[0]['expires']) {
		$result['error'] = true;
		$result['errorType'] = 'expired';
		$result['errorInfo'] = 'Session has expired';
	} else {
		DB::query("UPDATE users SET expires=%i", time()+(EXPIRE_TIME * 60));
	}
	return $result;
}

// Checks if user's role is valid for the function
// Inputs:
// 	$userRole: 		User's role from DB
// 	$validRole: 	User roles at or velow this level are valid
function checkRole($userRole, $request) {
	// Valid roles for various requests
	$validRoles = array(
		'importStudents' 					=> ADMIN_ROLE,
		'importPeriods' 					=> ADMIN_ROLE,
		'getStudentsWithFilter'		=> TEACHER_ROLE,
		'setIntervention' 				=> TEACHER_ROLE,
		'dataLists' 							=> TEACHER_ROLE,
		'users' 									=> SUPER_ADMIN_ROLE,
		'user'										=> SUPER_ADMIN_ROLE,
		'saveUser' 								=> SUPER_ADMIN_ROLE,
		'deleteUser' 							=> SUPER_ADMIN_ROLE,
		'courses' 								=> ADMIN_ROLE,
		'course' 									=> ADMIN_ROLE,
		'categories' 							=> ADMIN_ROLE,
		'saveCourse' 							=> ADMIN_ROLE, 
		'deleteCourse' 						=> ADMIN_ROLE,
		'addCourse' 							=> ADMIN_ROLE,
		'currentCycle'						=> ADMIN_ROLE,
		'getInterventionUnenrolled'  => ADMIN_ROLE,
		'getInterventionEnrolled' => ADMIN_ROLE,
		'getInterventionDifferentClass' => ADMIN_ROLE,
		'interventionCourseList'	=> ADMIN_ROLE,
		'getInterventionCounts' 	=> ADMIN_ROLE,
		'interventionCourseCounts'=> ADMIN_ROLE,
		'enroll' 									=> ADMIN_ROLE,
		'unenroll'								=> ADMIN_ROLE,
		'toggleInterventionsEntered' =>	TEACHER_ROLE,
		'clearAllInterventionFlags'	 => TEACHER_ROLE   
	);
	if (array_key_exists ($request , $validRoles)) {
		return $userRole <= $validRoles[$request];
	} else {
		return false;
	}
}


?>