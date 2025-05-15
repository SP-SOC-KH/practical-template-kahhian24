-- create module stored procedure
CREATE OR REPLACE PROCEDURE create_module(IN p_code VARCHAR(10), IN p_name
VARCHAR(100), IN p_credit INT)
AS $$
BEGIN
	-- Check if the module already exists
	IF EXISTS (SELECT * FROM module WHERE mod_code = p_code) THEN
	RAISE EXCEPTION 'Module % already exists', p_code;
	END IF;
	-- Insert the new module
	INSERT INTO module (mod_code, mod_name, credit_unit) VALUES (p_code, p_name,
p_credit);
END;
$$ LANGUAGE plpgsql;


-- create module stored procedure without error throwing code
CREATE OR REPLACE PROCEDURE create_module(IN p_code TEXT, IN p_name TEXT, IN p_credit
INT)
AS $$
BEGIN
-- Insert the new module
INSERT INTO module (mod_code, mod_name, credit_unit) VALUES (p_code, p_name,
p_credit);
END; 
$$ LANGUAGE plpgsql; 

-- update module stored procedure
CREATE OR REPLACE PROCEDURE update_module(IN p_code VARCHAR(10), IN p_credit INT)
AS $$
BEGIN
	-- Check if the module doesnt exists
	IF NOT EXISTS (SELECT * FROM module WHERE mod_code = p_code) THEN
	RAISE EXCEPTION 'Module % does not exist', p_code;
	END IF;
	-- Insert the new module
	UPDATE module SET mod_code = p_code, credit_unit = p_credit WHERE mod_code = p_code;
END;
$$ LANGUAGE plpgsql;

-- delete module stored procedure
CREATE OR REPLACE PROCEDURE delete_module(IN p_code VARCHAR(10))
AS $$
BEGIN
	-- Check if the module doesnt exists
	IF NOT EXISTS (SELECT * FROM module WHERE mod_code = p_code) THEN
	RAISE EXCEPTION 'Module % does not exist', p_code;
	END IF;
	-- Delete the new module
	DELETE FROM module WHERE mod_code = p_code;
END;
$$ LANGUAGE plpgsql;

-- Create a function to count the number of each grade, grouped by module
CREATE OR REPLACE FUNCTION get_modules_performance()
RETURNS TABLE (
	mod_registered VARCHAR(10),
	grade CHAR(2),
	grade_count BIGINT
) AS
$$
BEGIN
	-- Use RETURN QUERY to define the query to be executed
	RETURN QUERY
	-- TODO: Write the query to count the number of each grade, grouped by module
	SELECT s.mod_registered, s.grade, COUNT(s.grade) FROM stud_mod_performance s
	GROUP BY s.mod_registered, s.grade
	ORDER BY s.mod_registered, s.grade;
	
END;
$$
LANGUAGE plpgsql;

ALTER TABLE student 
ADD gpa NUMERIC(4,2), ADD gpa_last_updated DATE;


CREATE OR REPLACE FUNCTION get_grade_point(grade_input CHAR(2))
RETURNS NUMERIC
AS $$
DECLARE
	-- Declare variable to store the calculated grade point
	grade_point NUMERIC;
BEGIN
	-- Use a CASE statement to match the input grade and assign the corresponding grade point
	CASE grade_input
		-- TODO: Complete the CASE statement
		WHEN 'AD' THEN grade_point = 4.0;
		WHEN 'A' THEN grade_point = 4.0;
		WHEN 'B+' THEN grade_point =  3.5;
		WHEN 'B' THEN grade_point = 3.0;
		WHEN 'C+' THEN grade_point = 2.5;
		WHEN 'C' THEN grade_point = 2.0;
		WHEN 'D+' THEN grade_point = 1.5;
		WHEN 'D' THEN grade_point = 1.0;
		WHEN 'F' THEN grade_point = 0;
		-- TODO: Raise an exception to indicate 'Invalid Grade' if there is no match;
		ELSE
			RAISE EXCEPTION 'Invalid grade %', grade_input;
	END CASE;
	-- Return the calculated grade point
	RETURN grade_point;
END;
$$ LANGUAGE plpgsql;


-- Stored Procedure to calculate and update GPAs for all students
CREATE OR REPLACE PROCEDURE calculate_students_gpa()
AS $$
DECLARE
	-- Declare variables for procedure
	v_adm_no CHAR(4);
	v_mod_performance RECORD;
	total_credit_units INT; -- total credit unit for each student in nested loop
	total_weighted_grade_points NUMERIC; -- total grade points for each student in nested loop
	computed_gpa NUMERIC; -- gpa for each student
	current_cu INT;
BEGIN
	-- Loop through stud_mod_performance
	FOR v_adm_no IN (
		-- TODO: Complete the IN clause. Retrieve the distinct admission numbers from stud_mod_performance	
		SELECT adm_no FROM stud_mod_performance
	)
	LOOP
		-- Initialize total credit units and weighted grade points
		total_credit_units := 0;
		total_weighted_grade_points := 0;
		-- Nested loop that iterates over module performance records for a specific student to calculate gpa
		FOR v_mod_performance IN (
			-- TODO: Complete the SELECT statement. Retrieve the module performances for the specific student
			SELECT grade, mod_registered FROM stud_mod_performance WHERE adm_no = v_adm_no
		)

		-- Join the stud_mod_performance table with the module table to get the credit unit and grade for each module
		-- Use the v_adm_no variable to filter for a specific student (eg WHERE clause)
		LOOP
			
			-- TODO: Calculate the total credit units and weighted grade points for the student based on the gpa formula. 
			-- Use the get_grade_point function to map grade to grade points
			current_cu = (
				SELECT m.credit_unit FROM module m JOIN stud_mod_performance p ON m.mod_code = p.mod_registered  
				WHERE p.adm_no = v_adm_no AND p.mod_registered = v_mod_performance.mod_registered
			);
			total_credit_units = total_credit_units + current_cu;
			
			total_weighted_grade_points = total_weighted_grade_points + (SELECT get_grade_point(v_mod_performance.grade) * current_cu);
			
		END LOOP;
			-- Calculate GPA if total credit units are greater than 0
			
			IF total_credit_units > 0 THEN
				computed_gpa := total_weighted_grade_points / total_credit_units;
				-- TODO: Complete the Update statement to update computed gpa
				-- to the student table. use today's date for gpa_last_updated
				
				UPDATE student SET gpa = computed_gpa, gpa_last_updated = CURRENT_DATE WHERE adm_no = v_adm_no;
		END IF;
	END LOOP;
END;
$$ LANGUAGE plpgsql;

select get_grade_point(CAST('C+' AS VARCHAR(2)));
select * from stud_mod_performance