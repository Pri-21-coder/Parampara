/**
 * Validation Utility Module
 * Shared validation functions for request data
 */

/**
 * Validate userId
 */
function validateUserId(userId) {
  const errors = [];

  if (!userId || typeof userId !== 'string') {
    errors.push('userId is required and must be a string.');
    return { valid: false, errors };
  }

  const trimmed = userId.trim();
  if (trimmed.length === 0) {
    errors.push('userId cannot be empty or only whitespace.');
  }

  // Check for dangerous characters (XSS protection)
  if (/[<>{}]/.test(trimmed)) {
    errors.push('userId contains invalid characters.');
  }

  return {
    valid: errors.length === 0,
    value: trimmed,
    errors
  };
}

/**
 * Validate village name
 */
function validateVillage(village, config) {
  const errors = [];
  const MIN_LENGTH = config?.VILLAGE?.MIN_LENGTH || 2;
  const MAX_LENGTH = config?.VILLAGE?.MAX_LENGTH || 100;

  if (!village || typeof village !== 'string') {
    errors.push('village is required and must be a string.');
    return { valid: false, errors };
  }

  const trimmed = village.trim();
  if (trimmed.length === 0) {
    errors.push('village cannot be empty or only whitespace.');
  }

  if (trimmed.length < MIN_LENGTH) {
    errors.push(`village name must be at least ${MIN_LENGTH} characters.`);
  }

  if (trimmed.length > MAX_LENGTH) {
    errors.push(`village name cannot exceed ${MAX_LENGTH} characters.`);
  }

  // Check for dangerous characters (XSS protection)
  if (/[<>{}]/.test(trimmed)) {
    errors.push('village name contains invalid characters.');
  }

  return {
    valid: errors.length === 0,
    value: trimmed,
    errors
  };
}

/**
 * Validate coordinates
 */
function validateCoordinates(coordinates) {
  const errors = [];

  if (!coordinates || typeof coordinates !== 'object' || Array.isArray(coordinates)) {
    errors.push('coordinates are required and must be an object.');
    return { valid: false, errors };
  }

  const { lat, lng } = coordinates;

  // Validate latitude
  if (lat === undefined || lat === null) {
    errors.push('latitude is required.');
  } else if (typeof lat !== 'number') {
    errors.push('latitude must be a number.');
  } else if (isNaN(lat)) {
    errors.push('latitude must be a valid number.');
  } else if (lat < -90 || lat > 90) {
    errors.push('latitude must be between -90 and 90.');
  }

  // Validate longitude
  if (lng === undefined || lng === null) {
    errors.push('longitude is required.');
  } else if (typeof lng !== 'number') {
    errors.push('longitude must be a number.');
  } else if (isNaN(lng)) {
    errors.push('longitude must be a valid number.');
  } else if (lng < -180 || lng > 180) {
    errors.push('longitude must be between -180 and 180.');
  }

  return {
    valid: errors.length === 0,
    value: { lat, lng },
    errors
  };
}

/**
 * Validate pagination parameters
 */
function validatePagination(page, limit, maxLimit = 100) {
  const errors = [];
  
  let parsedPage = parseInt(page, 10);
  let parsedLimit = parseInt(limit, 10);

  if (isNaN(parsedPage) || parsedPage < 1) {
    parsedPage = 1;
  }

  if (isNaN(parsedLimit) || parsedLimit < 1) {
    parsedLimit = 10;
  }

  if (parsedLimit > maxLimit) {
    errors.push(`Limit cannot exceed ${maxLimit}`);
    parsedLimit = maxLimit;
  }

  return {
    valid: errors.length === 0,
    page: parsedPage,
    limit: parsedLimit,
    errors
  };
}

/**
 * Validate email
 */
function validateEmail(email) {
  const errors = [];
  
  if (!email || typeof email !== 'string') {
    errors.push('email is required and must be a string.');
    return { valid: false, errors };
  }

  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    errors.push('Invalid email format.');
  }

  return {
    valid: errors.length === 0,
    value: trimmed,
    errors
  };
}

/**
 * Validate phone number
 */
function validatePhone(phone) {
  const errors = [];
  
  if (!phone || typeof phone !== 'string') {
    errors.push('phone is required and must be a string.');
    return { valid: false, errors };
  }

  const trimmed = phone.trim();
  const phoneRegex = /^[0-9]{10}$/;
  
  if (!phoneRegex.test(trimmed)) {
    errors.push('Phone number must be 10 digits.');
  }

  return {
    valid: errors.length === 0,
    value: trimmed,
    errors
  };
}

/**
 * Sanitize input string (XSS protection)
 */
function sanitizeString(input) {
  if (!input || typeof input !== 'string') return '';
  return input.trim().replace(/[<>{}]/g, '');
}

/**
 * Check if string is empty or whitespace
 */
function isEmptyOrWhitespace(str) {
  return !str || typeof str !== 'string' || str.trim().length === 0;
}

module.exports = {
  validateUserId,
  validateVillage,
  validateCoordinates,
  validatePagination,
  validateEmail,
  validatePhone,
  sanitizeString,
  isEmptyOrWhitespace
};