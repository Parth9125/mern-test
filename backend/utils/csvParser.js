const fs = require('fs').promises;
const csv = require('csv-parser');
const XLSX = require('xlsx');
const path = require('path');

/**
 * Parse CSV file and return structured data
 * @param {string} filePath - Path to the uploaded file
 * @returns {Promise<Array>} Parsed data array
 */
const parseCSVFile = async (filePath) => {
  try {
    const extension = path.extname(filePath).toLowerCase();
    let data = [];

    if (extension === '.csv') {
      data = await parseCSV(filePath);
    } else if (extension === '.xlsx' || extension === '.xls') {
      data = await parseExcel(filePath);
    } else {
      throw new Error('Unsupported file format');
    }

    return validateAndCleanData(data);
  } catch (error) {
    console.error('CSV parsing error:', error);
    throw new Error(`Failed to parse file: ${error.message}`);
  }
};

/**
 * Parse CSV file
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Array>} Parsed CSV data
 */
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = require('fs').createReadStream(filePath);

    stream
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

/**
 * Parse Excel file (XLSX/XLS)
 * @param {string} filePath - Path to Excel file
 * @returns {Promise<Array>} Parsed Excel data
 */
const parseExcel = async (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Use first sheet
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data;
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};

/**
 * Validate and clean the parsed data
 * @param {Array} data - Raw parsed data
 * @returns {Array} Validated and cleaned data
 */
const validateAndCleanData = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('File is empty or contains no valid data');
  }

  const cleanedData = [];
  const errors = [];

  data.forEach((row, index) => {
    const cleanedRow = cleanRow(row, index + 1);
    if (cleanedRow.isValid) {
      cleanedData.push(cleanedRow.data);
    } else {
      errors.push(cleanedRow.error);
    }
  });

  if (cleanedData.length === 0) {
    throw new Error(`No valid data found. Errors: ${errors.join(', ')}`);
  }

  if (errors.length > 0 && errors.length / data.length > 0.5) {
    console.warn('Warning: More than 50% of rows had validation errors:', errors);
  }

  return cleanedData;
};

/**
 * Clean and validate individual row
 * @param {Object} row - Raw row data
 * @param {number} rowNumber - Row number for error reporting
 * @returns {Object} Cleaned row with validation status
 */
const cleanRow = (row, rowNumber) => {
  try {
    // Extract and normalize field names (case-insensitive)
    const normalizeKey = (key) => key.toLowerCase().trim();
    const keys = Object.keys(row).map(normalizeKey);

    // Find required fields (flexible matching)
    const firstNameKey = keys.find(key => 
      key.includes('firstname') || 
      key.includes('first_name') || 
      key.includes('first name') ||
      key === 'name'
    );

    const phoneKey = keys.find(key => 
      key.includes('phone') || 
      key.includes('mobile') || 
      key.includes('number') ||
      key.includes('contact')
    );

    const notesKey = keys.find(key => 
      key.includes('notes') || 
      key.includes('note') || 
      key.includes('comments') ||
      key.includes('description')
    );

    if (!firstNameKey) {
      return {
        isValid: false,
        error: `Row ${rowNumber}: FirstName field not found`
      };
    }

    if (!phoneKey) {
      return {
        isValid: false,
        error: `Row ${rowNumber}: Phone field not found`
      };
    }

    // Get original key names for extraction
    const originalFirstNameKey = Object.keys(row).find(key => 
      normalizeKey(key) === firstNameKey
    );
    const originalPhoneKey = Object.keys(row).find(key => 
      normalizeKey(key) === phoneKey
    );
    const originalNotesKey = notesKey ? Object.keys(row).find(key => 
      normalizeKey(key) === notesKey
    ) : null;

    const firstName = String(row[originalFirstNameKey] || '').trim();
    const phone = String(row[originalPhoneKey] || '').trim();
    const notes = originalNotesKey ? String(row[originalNotesKey] || '').trim() : '';

    if (!firstName) {
      return {
        isValid: false,
        error: `Row ${rowNumber}: FirstName is empty`
      };
    }

    if (!phone) {
      return {
        isValid: false,
        error: `Row ${rowNumber}: Phone is empty`
      };
    }

    // Basic phone validation (allow various formats)
    const phoneRegex = /^[+]?[\d\s\-\(\)]{7,20}$/;
    if (!phoneRegex.test(phone)) {
      return {
        isValid: false,
        error: `Row ${rowNumber}: Invalid phone format`
      };
    }

    return {
      isValid: true,
      data: {
        firstName,
        phone,
        notes
      }
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Row ${rowNumber}: ${error.message}`
    };
  }
};

/**
 * Distribute items among agents equally
 * @param {Array} items - Array of items to distribute
 * @param {Array} agents - Array of agent IDs
 * @returns {Array} Distribution result
 */
const distributeItems = (items, agents) => {
  if (!Array.isArray(items) || !Array.isArray(agents)) {
    throw new Error('Invalid input: items and agents must be arrays');
  }

  if (agents.length === 0) {
    throw new Error('At least one agent is required for distribution');
  }

  if (items.length === 0) {
    return agents.map(agent => ({ agent, items: [] }));
  }

  const distribution = agents.map(agent => ({ agent, items: [] }));
  const itemsPerAgent = Math.floor(items.length / agents.length);
  const remainingItems = items.length % agents.length;

  let currentIndex = 0;

  // Distribute items equally
  for (let i = 0; i < agents.length; i++) {
    const itemsToAssign = itemsPerAgent + (i < remainingItems ? 1 : 0);
    distribution[i].items = items.slice(currentIndex, currentIndex + itemsToAssign);
    currentIndex += itemsToAssign;
  }

  return distribution;
};

/**
 * Clean up uploaded file
 * @param {string} filePath - Path to file to delete
 */
const cleanupFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('File cleanup error:', error);
  }
};

module.exports = {
  parseCSVFile,
  distributeItems,
  cleanupFile,
  validateAndCleanData
};