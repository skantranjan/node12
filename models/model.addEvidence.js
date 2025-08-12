const pool = require('../config/db.config');

/**
 * Insert evidence file record
 */
async function insertEvidenceFile(data) {
  const query = `
    INSERT INTO sdp_evidence (
      component_id, evidence_file_name, evidence_file_url, 
      created_by, created_date, category
    ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
  `;

  const values = [
    data.component_id,
    data.evidence_file_name,
    data.evidence_file_url,
    data.created_by,
    data.created_date || new Date(),
    data.category || null
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Insert multiple evidence file records
 */
async function insertMultipleEvidenceFiles(evidenceFiles) {
  const query = `
    INSERT INTO sdp_evidence (
      component_id, evidence_file_name, evidence_file_url, 
      created_by, created_date, category
    ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
  `;

  const results = [];
  
  for (const evidenceFile of evidenceFiles) {
    const values = [
      evidenceFile.component_id,
      evidenceFile.evidence_file_name,
      evidenceFile.evidence_file_url,
      evidenceFile.created_by,
      evidenceFile.created_date || new Date(),
      evidenceFile.category || null
    ];

    const result = await pool.query(query, values);
    results.push(result.rows[0]);
  }

  return results;
}

module.exports = { insertEvidenceFile, insertMultipleEvidenceFiles }; 