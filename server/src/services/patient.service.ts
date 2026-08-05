import pool from "../config/database";

export class PatientService {


    // Create Patient
    static async create(patient: any) {

        const sql = `
            INSERT INTO patients
            (
                patient_number,
                first_name,
                last_name,
                other_names,
                gender_id,
                blood_group_id,
                marital_status_id,
                date_of_birth,
                national_id,
                nhis_number,
                phone_number,
                email,
                occupation,
                address,
                city,
                region,
                emergency_contact_name,
                emergency_contact_phone,
                emergency_contact_relationship
            )
            VALUES
            (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

        const [result]: any = await pool.execute(sql, [

            patient.patient_number,
            patient.first_name,
            patient.last_name,
            patient.other_names ?? null,
            patient.gender_id,
            patient.blood_group_id ?? null,
            patient.marital_status_id ?? null,
            patient.date_of_birth,
            patient.national_id ?? null,
            patient.nhis_number ?? null,
            patient.phone_number ?? null,
            patient.email ?? null,
            patient.occupation ?? null,
            patient.address ?? null,
            patient.city ?? null,
            patient.region ?? null,
            patient.emergency_contact_name ?? null,
            patient.emergency_contact_phone ?? null,
            patient.emergency_contact_relationship ?? null

        ]);

        return result.insertId;

    }

    // =====================================================
    // Get All Patients
    // =====================================================
    static async getAll() {

        const sql = `
            SELECT
                p.patient_id,
                p.patient_number,
                p.first_name,
                p.last_name,
                p.other_names,
                p.phone_number,
                p.email,
                p.is_active,
                p.created_at,
                TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) AS age,
                g.gender_name,
                CASE
                    WHEN bg.blood_group IS NOT NULL THEN
                        CONCAT(bg.blood_group, IF(bg.rhesus_factor = 'Positive', '+', '-'))
                    ELSE NULL
                END AS blood_type
            FROM patients p
            LEFT JOIN genders g
                ON g.gender_id = p.gender_id
            LEFT JOIN blood_groups bg
                ON bg.blood_group_id = p.blood_group_id
            WHERE p.deleted_at IS NULL
            ORDER BY p.patient_id DESC
        `;

        const [rows] = await pool.query(sql);

        return rows;

    }

    // =====================================================
    // Get Patient By ID
    // =====================================================
    static async getById(patientId: number) {

        const sql = `
            SELECT *
            FROM patients
            WHERE patient_id = ?
            AND deleted_at IS NULL
            LIMIT 1
        `;

        const [rows]: any = await pool.query(sql, [patientId]);

        return rows[0];

    }

    // =====================================================
    // Update Patient
    // =====================================================
    static async update(patientId: number, patient: any) {

        const sql = `
            UPDATE patients
            SET
                first_name = ?,
                last_name = ?,
                other_names = ?,
                gender_id = ?,
                date_of_birth = ?,
                phone_number = ?,
                email = ?
            WHERE patient_id = ?
        `;

       const [result]: any = await pool.execute(sql, [

            patient.first_name,
            patient.last_name,
            patient.other_names ?? null,
            patient.gender_id,
            patient.date_of_birth,
            patient.phone_number ?? null,
            patient.email ?? null,
            patientId

        ]);

        return result.affectedRows;

    }

    // =====================================================
    // Soft Delete Patient
    // =====================================================
    static async delete(patientId: number) {

        const sql = `
            UPDATE patients
            SET deleted_at = NOW()
            WHERE patient_id = ?
        `;

        const [result]: any = await pool.execute(sql, [patientId]);

        return result.affectedRows;

    }

    // =====================================================
    // Search Patients
    // =====================================================
    static async search(keyword: string) {

        const sql = `
            SELECT
                patient_id,
                patient_number,
                first_name,
                last_name,
                other_names,
                phone_number,
                email
            FROM patients
            WHERE
                (
                    patient_number LIKE ?
                    OR first_name LIKE ?
                    OR last_name LIKE ?
                    OR phone_number LIKE ?
                )
            AND deleted_at IS NULL
            ORDER BY first_name ASC
        `;

        const search = `%${keyword}%`;

        const [rows] = await pool.query(sql, [

            search,
            search,
            search,
            search

        ]);

        return rows;

    }

}