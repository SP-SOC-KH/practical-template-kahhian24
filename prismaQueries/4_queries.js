const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()


function getAllStaff() {
	return prisma.staff.findMany({		
	})
}

/** Section A: Basic Queries */


function getHodInfo() {
	return prisma.department.findMany({
		//TODO: Implement the query
        select: {
            
            deptName: true,
            hodApptDate: true,
        }
	});
}


function getDeptStaffingInfo() {
	return prisma.department.findMany({
		//TODO: Implement the query
        select: {
            deptCode: true,
            noOfStaff: true,
        }

	});
}


function getCitizenshipWithoutDuplicates() {
	return prisma.staff.findMany({
		//TODO: Implement the query
        orderBy: {
            citizenship: 'desc',
        },
        select: {
            citizenship: true,
        },
        distinct: ['citizenship']
	});
}


/** Section B: Filtering Queries */


function getStaffofSpecificCitizenships() {
	return prisma.staff.findMany({
		//TODO: Implement the query
        where: {
            citizenship: {
                in: ['Hong Kong','Korea','Malaysia','Thailand']
            }
        },
        select: {
            
            staffName: true,
            citizenship: true
        },
        orderBy: {
            citizenship: 'asc'
        }

	});
}

function getStaffWithBachelorDegreeOrDeputyDesignation() {
	return prisma.staff.findMany({
		//TODO: Implement the query
        where: {
            OR: [
                {
                    highestQln: {
                        startsWith: 'B'
                        
                    }
                },
                {
                    designation: {
                        contains: 'Deputy',
                        mode: 'insensitive'
                    }
                }
            ]
        },
        select: {
            staffName: true,
            highestQln: true,
            designation: true
        },
        orderBy: {
            staffName: 'asc'
        }
	});
}

// Among the married staff, list female staff who are paid between 4000 and 7000 or male staff who are paid between 2000 and 6000. Sort in ascending order of gender, pay
function getStaffByCriteria1() {
    return prisma.staff.findMany({
        //TODO: Implement the query
        where: {
            maritalStatus: 'M',
            OR: [
                {
                    gender: 'M',
                    pay: {
                        gte: 2000,
                        lte: 6000
                    }
                },
                {
                    gender: 'F',
                    pay: {
                        gte: 4000,
                        lte: 7000
                    }
                }
            ]
        },
        select: {
            staffName: true,
            gender: true,
            pay: true
        },
        orderBy: [
            { gender: 'asc' },
            { pay: 'asc' }
        ]
    });
}


/** Section C: Relation Queries */

async function getDepartmentCourses() {
    return prisma.department.findMany({
        select: {
            deptName: true,
            course: {
                select: {
                    crseName: true,
                    crseFee: true,
                    labFee: true
                }
            }
        },
        orderBy: {
            deptName: 'asc'
        }
    })
}


const getStaffAndDependents = () => {
    return prisma.staff.findMany({
        where: {
            staffDependent: {
                some: {}
            }
        },
        select: {
            staffName: true,
            staffDependent: {
                select: {
                    dependentName: true,
                    relationship: true
                }
            }
        },
        orderBy: {
            staffName: 'asc'
        }
    });
};

const getDepartmentCourseStudentDob = () => {
    return prisma.department.findMany({
        where: {
            course: {
                some: {
                    student: {
                        some: {}
                    }
                }
            }
        },
        select: {
            deptName: true,
            course: {
                select: {
                    crseCode: true,
                    crseName: true,
                    student: {
                        select: {
                            studName: true,
                            dob: true
                        }
                    }
                }
            }
        },
        orderBy: [
            { deptName: 'asc' }
        ]
    });
};

async function main(argument) {
	let results;
	switch (argument) {
		case 'getAllStaff':
			results = await getAllStaff();
			break;
		case 'getCitizenshipWithoutDuplicates':
			results = await getCitizenshipWithoutDuplicates();
			break;
		case 'getHodInfo':
			results = await getHodInfo();
			break;
		case 'getDeptStaffingInfo':
			results = await getDeptStaffingInfo();
			break;
		case 'getStaffofSpecificCitizenships':
			results = await getStaffofSpecificCitizenships();
			break;
		case 'getStaffWithBachelorDegreeOrDeputyDesignation':
			results = await getStaffWithBachelorDegreeOrDeputyDesignation();
			break;
		case 'getStaffByCriteria1':
			results = await getStaffByCriteria1();
			break;
		case 'getDepartmentCourses':
			results = await getDepartmentCourses();
			break;
		case 'getStaffAndDependents':
			results = await getStaffAndDependents();
			break;
		case 'getDepartmentCourseStudentDob':
			results = await getDepartmentCourseStudentDob();
			break;
		default:
			console.log('Invalid argument');
			break;
	}
	results && console.log(results);
}

main(process.argv[2]);
