<?php
include "meekrodb.2.3.class.php";
include "constants.php";
include "authenticate.php";
include "queries.php";
include "utils.php";

/////////////////////////////////////////
// AJAX call entry point is here.  Parse the request and do the appropriate action
/////////////////////////////////////////
$request = $_POST['request'];
$username = $_POST['username'];
$token = (isset($_POST['token'])) ? $_POST['token'] : '';
$result['error'] = false;

if ($request == 'login') {	
	$loginResult['error'] = false;
	$result = authenticate($loginResult, $_POST['username'], $_POST['password']);	
} elseif ($request == 'forgotPassword') {
	$result = forgotPassword($result, $username);
} else {
	$result = validate($result, $username, $token);
	if (!checkRole($result['role'], $request)) {
		$result['error'] = true;
		$result['errorType'] = 'roleError';
		$result['errorInfo'] = 'You are not authorized for this function';
	} else {		
		if (!$result['error']) {
			$result = router($result, $request, $_POST);
		}
	}
}

echo json_encode($result);
// End of AJAX call
/////////////////////////////////////////

/////////////////////////////////////////
// Request processing router
/////////////////////////////////////////
function router($result, $request, $post) {

	switch ($request) {

		case 'dataLists':
			$result['teacherList'] = sqlToArray(DB::query("SELECT DISTINCT teacher FROM schedule ORDER BY teacher"), 'teacher');
			$result['gradeList'] = sqlToArray(DB::query("SELECT DISTINCT gradeLevel FROM students ORDER BY gradeLevel"), 'gradeLevel');
			$result['periodList'] = sqlToArray(DB::query("SELECT DISTINCT period FROM schedule ORDER BY period"), 'period');			
			break;

		case 'importStudents':
			$csv = $post['csv'];
			$result = parse($result, $csv, 'students');
			break;

		case 'importPeriods':
			$csv = $post['csv'];
			DB::query("DELETE FROM schedule WHERE period=%s", $post['period']);
			$result = parse($result, $csv, 'periods', $post['period']);
			break;

		case 'getStudentsWithFilter':
			$where = new WhereClause('and');
			$where = addWhere($where, 'gradeLevel', $post['gradeLevel']);
			$where = addWhere($where, 'period', $post['period']);
			$where = addWhere($where, 'teacher', $post['teacher']);
			if ($post['intervention'] != '') {
				$int = $post['intervention'];
				$where->add("$int=1");
			}
			if ($where->count() > 0) {
				$result['studentList'] = DB::query("SELECT students.*, CONCAT(students.lastname,', ', students.firstname) AS name FROM students JOIN schedule on students.studentId=schedule.studentId WHERE %l ORDER BY name", $where);
			} else {
				$result['studentList'] = DB::query("SELECT *, CONCAT(lastname, ', ', firstname) AS name FROM students ORDER BY lastname, firstname, middlename");
			}
			break;

		case 'setIntervention':
			$studentId = $post['studentId'];
			$field = $post['field'];
			DB::query("UPDATE students SET %l = NOT(%l) where studentId=%s", $field, $field, $studentId);
			$newValue = DB::query("SELECT %l FROM students WHERE studentId=%s", $field, $studentId);
			$result['newValue'] = $newValue[0][$field];
			$result['studentId'] = $studentId;
			$result['field'] = $field;
			break;

		case 'users':
			$result['users'] = DB::query("SELECT id, lastname, firstname, email, interventionsEntered FROM users ORDER BY lastname, firstname");
			break;

		case 'user':
			$result['user'] = DB::query("SELECT * FROM users WHERE id=%s", $post['id']);
			break;

		case 'saveUser':
			DB::insertUpdate('users', array(
				'id' 											=> $post['id'], 				// primary key
				'lastname'								=> $post['lastname'],
				'firstname'								=> $post['firstname'],
				'role' 										=> $post['role'],
				'email' 									=> $post['email'],
				'interventionsEntered' 		=> $post['interventionsEntered']
			));
			break;

		case 'deleteUser':
			DB::delete('users', 'id=%s', $post['id']);
			break;

		case 'courses':
			$result['courses'] = DB::query("SELECT * FROM courses ORDER BY category, name");
			break;

		case 'course':
			$result['course'] = DB::query("SELECT * FROM courses WHERE id=%s", $post['id']);
			break;

		case 'categories':
			$result['categories'] = sqlToArray(DB::query("SELECT DISTINCT category FROM courses ORDER BY category"), 'category');
			break;

		case 'saveCourse':
			DB::insertUpdate('courses', array(
				'id'										=> $post['id'],
				'name' 									=> $post['name'],
				'sectionsForCycle' 			=> $post['sectionsForCycle'],
				'classSize'							=> $post['classSize'],
				'gradeLevel' 						=> $post['gradeLevel'],
				'teachers' 							=> $post['teachers'],
				'intervention' 					=> $post['intervention'],
				'locked' 								=> $post['locked'],
				'category'							=> $post['category']
			));	
			break;

		case 'addCourse':
			DB::insert('courses', array(
				'name' 									=> $post['name'],
				'sectionsForCycle' 			=> $post['sectionsForCycle'],
				'classSize'							=> $post['classSize'],
				'gradeLevel' 						=> $post['gradeLevel'],
				'teachers' 							=> $post['teachers'],
				'intervention' 					=> $post['intervention'],
				'locked' 								=> $post['locked'],
				'category'							=> $post['category']
			));	
			break;

		case 'deleteCourse':
			DB::delete('courses', 'id=%s', $post['id']);
			break;

		case 'currentCycle':
			if ($post['direction'] == 'get') {
				$config = DB::query("SELECT currentCycle FROM config LIMIT 1");
				$result['currentCycle'] = $config[0]['currentCycle'];
			} else {
				DB::query("UPDATE config SET currentCycle=%d", $post['currentCycle']);
			}
			break;

		case 'enroll':
			foreach($post['studentList'] as $student) {
				DB::insert('enrollment', array(
					'studentId'			=> $student['studentId'],
					'sectionId' 		=> $post['sectionId'],
					'courseId' 			=> $post['courseId'],
					'cycleId' 			=> $post['cycleId']
				));
			}
			break;

		case 'unenroll':
			foreach($post['idList'] as $id) {
				DB::delete('enrollment', "id=%d", $id);
			}
			break;

		case 'toggleInterventionsEntered':
			DB::query("UPDATE users SET interventionsEntered=(NOT interventionsEntered) WHERE id=%s", $post['id']);
			$toggle = DB::query("SELECT * FROM users WHERE id=%s", $post['username']);
			$result['status'] = $toggle[0]['interventionsEntered'];
			break;

		case 'clearAllInterventionFlags':
			DB::query("UPDATE users SET interventionsEntered=0");
			break;

		case 'interventionCourseList':
			$icl = DB::query("SELECT * FROM courses WHERE intervention=1 ORDER BY name");
			$result['interventionCourseList'] = $icl;
			break;

		case 'interventionCourseCounts':
			$query = "SELECT studentId, sectionId FROM `enrollment` WHERE cycleId=%d AND courseId=%d";
			$result['list'] = DB::query($query, $post['cycleId'], $post['courseId']);
			break;

		case 'getInterventionCounts':
			$query = <<<QUERY
			SELECT 
				gradeLevel,
				SUM(IF(english=1,1,0)) AS english, 
				SUM(IF(science=1,1,0)) AS science,
				SUM(IF(math=1,1,0)) AS math,
				SUM(IF(studyHall=1,1,0)) AS studyHall,
				SUM(IF(learningUpgrade=1,1,0)) AS learningUpgrade
				FROM `students`
				GROUP BY gradeLevel
QUERY;
			$result['counts'] = DB::query($query);
			break;

		case 'getInterventionUnenrolled':
			$query1 = <<<QUERY1
				SELECT S.*, enrollment.courseId AS enrolledCourse FROM 
					(SELECT students.* %l
					FROM students
QUERY1;
			$query2 = "%l ) AS S";
			$query3 = <<<QUERY3
				LEFT JOIN enrollment
				ON S.studentId=enrollment.studentId
				AND enrollment.cycleId=%d
				WHERE ISNULL(courseId)
				ORDER BY lastname, firstname
QUERY3;
			$where = "";
			if ((strlen($post['interventionFilter']) > 0) &&
					($post['interventionFilter'] != 'none')) {
				$where .= $post['interventionFilter']."=1";
			}
			if (strlen($post['gradeLevel'])>0) {
				if (strlen($where) > 0) {
					$where .= " AND ";
				}
				$where .= "gradeLevel=".$post['gradeLevel'];
			}
			$onClause = "";
			$addSelect = "";
			if (($post['removeAlreadyTaken'] == 'true') &&
				(isset($post['courseId']))) {
				$onClause = " LEFT JOIN enrollment ON students.studentId=enrollment.studentId AND enrollment.courseId=".$post['courseId']." AND enrollment.cycleId<>".$post['cycleId'];
				if (strlen($where) > 0) {
					$where .= " AND ";
				}				
				$where .= " ISNULL(cycleId)";
				$addSelect .= ", enrollment.cycleId AS duplicateCycleId";
			}
			if (strlen($where) > 0) {
				$where = " WHERE ".$where;
			}
			$query = $query1.$onClause.$query2.$query3;
			$result['studentList'] = DB::query($query, $addSelect, $where, $post['cycleId']);
			break;

		case 'getInterventionDifferentClass':
			$query1 = "SELECT S.*, enrollment.courseId, courses.name, enrollment.id, enrollment.sectionId FROM (SELECT students.* ";
			$query2 = " FROM students ";
			$query3 = ") AS S JOIN (enrollment, courses) ON S.studentId=enrollment.studentId AND enrollment.courseId=courses.id AND enrollment.courseId<>%d AND enrollment.cycleId=%d ORDER BY lastname, firstname";
			$where = "";
			if ((strlen($post['interventionFilter']) > 0) &&
					($post['interventionFilter'] != 'none')) {
				$where .= $post['interventionFilter']."=1";
			}
			if (strlen($post['gradeLevel'])>0) {
				if (strlen($where) > 0) {
					$where .= " AND ";
				}
				$where .= "gradeLevel=".$post['gradeLevel'];
			}
			$onClause = "";
			$addSelect = "";
			if (($post['removeAlreadyTaken'] == 'true') &&
				(isset($post['courseId']))) {
				$onClause = " LEFT JOIN enrollment ON students.studentId=enrollment.studentId AND enrollment.courseId=".$post['courseId']." AND enrollment.cycleId<>".$post['cycleId'];
				if (strlen($where) > 0) {
					$where .= " AND ";
				}				
				$where .= " ISNULL(cycleId)";
				$addSelect .= ", enrollment.cycleId";
			}
			if (strlen($where) > 0) {
				$where = " WHERE ".$where;
			}
			$query = $query1.$addSelect.$query2.$onClause.$where.$query3;
			// echo $query; die();
			$result['studentList'] = DB::query($query, $post['courseId'], $post['cycleId']);
			break;

		case 'getInterventionEnrolled':
			$query = "SELECT students.*, enrollment.id, enrollment.courseId, enrollment.sectionId FROM students JOIN enrollment ON students.studentId=enrollment.studentId %l ORDER BY lastname, firstname";
			$where = "";
			if (isset($post['courseId'])) {
				$where .= " WHERE enrollment.courseId=".$post['courseId']." AND enrollment.cycleId=".$post['cycleId'];
			}
			if (isset($post['sectionId']) && ($post['sectionId'] > 0)) {
				$where .= " AND enrollment.sectionId=".$post['sectionId'];
			}
 			$result['studentList'] = DB::query($query, $where);
			break;	

// 		case 'getInterventionStudentLists':
// 			$queryUnenrolled = <<<QUERY
// 				SELECT 
// 					S.*, 
// 					enrollment.courseId,
// 					courses.name AS courseName 
// 				FROM

// 					(SELECT 
// 						students.*, 
// 						SUM(IF(enrollment.courseId=%d2 AND enrollment.cycleId<>%d3,1,0)) AS repeatCourseCount

// 					FROM 
// 						students
// 					LEFT JOIN 
// 						enrollment
// 					ON 
// 						students.studentId=enrollment.studentId 
// 						AND enrollment.courseId=%d2 
// 						AND enrollment.cycleId<>%d3
// 					%l0
// 					GROUP BY students.studentId) AS S

// 				LEFT JOIN 
// 					(enrollment, courses)
// 				ON 
// 					S.studentId=enrollment.studentId AND 
// 					enrollment.courseId<>%d2 AND enrollment.cycleId=%d3 AND 
// 					enrollment.courseId=courses.id

// 				%l1

// 				ORDER BY lastname, firstname
// QUERY;

// 			$queryEnrolled = <<<QUERY
// 				SELECT * FROM 
// 				(SELECT students.*,
// 				SUM(IF(enrollment.courseId=%d AND enrollment.cycleId=%d,1,0)) AS enrolledCount
// 				FROM students
// 				JOIN enrollment
// 				ON students.studentId=enrollment.studentId
// 				%l
// 				GROUP BY students.studentId) AS S
// 				WHERE enrolledCount=1
// 				ORDER BY lastname, firstname
// QUERY;

// 			$where1 = "";
// 			if ((strlen($post['interventionFilter']) > 0) &&
// 					($post['interventionFilter'] != 'none')) {
// 				$where1 .= $post['interventionFilter']."=1";
// 			}
// 			if (strlen($post['gradeLevel']) > 0) {
// 				if (strlen($where1) > 0) {
// 					$where1 .= " AND ";
// 				}
// 				$where1 .= " gradeLevel=".$post['gradeLevel'];
// 			}
// 			$where3 = $where1;
// 			if (strlen($post['interventionCourseId']) > 0) {
// 				if (strlen($where3) > 0) {
// 					$where3 .= " AND ";
// 				}
// 				$where3 .= " (enrollment.courseId <> ".$post['interventionCourseId']." OR enrollment.cycleId<>".$post['cycleId'].")";
// 			}
// 			if (strlen($where1) > 0) {
// 				$where1 = "WHERE ".$where1;
// 			}
// 			if (strlen($where3) > 0) {
// 				$where3 = "WHER ".$where3;
// 			}

// 			$where2 = "";
// 			if (!$post['showAllStudents']) {
// 				$where2 = " WHERE S.repeatCourseCount=0"; 
// 			}
// 			$result['unenrolled'] = DB::query($queryUnenrolled, $where3, $where2, $post['interventionCourseId'], $post['cycleId']);
// 			$result['enrolled'] = DB::query($queryEnrolled, $post['interventionCourseId'], $post['cycleId'], $where1);
// 			break;
	}
	return $result;
}

function forgotPassword($result, $username) {
	$user = DB::query("SELECT * FROM users WHERE id=%s", $username);
	if (DB::count() === 1) {
		$newPassword = generatePassword();
		$id = $username;
		$email = $user[0]['email'];
		DB::update('users', array(
			'password' => sha1($newPassword)
		), "id=%s", $id);
		$result['email'] = $email;
		mail($email, "Advisory system password reset", "Your password has been set to ".$newPassword);
	} else {
		$result['error'] = true;
		$result['errorInfo'] = 'User not found';
		$result['errorType'] = 'notFound';
	}
	return $result;
}

?>