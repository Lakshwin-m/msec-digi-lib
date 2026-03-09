/**
 * Validate register number format
 */
export const validateRegisterNumber = (registerNumber: string): boolean => {
  // Basic validation - can be customized based on institution's format
  return registerNumber.trim().length > 0;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate Google Drive URL
 */
export const isGoogleDriveUrl = (url: string): boolean => {
  return url.includes('drive.google.com');
};

/**
 * Validate semester number (1-8)
 */
export const validateSemester = (semester: number): boolean => {
  return semester >= 1 && semester <= 8;
};

/**
 * Format date to readable string
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Format date to short string
 */
export const formatDateShort = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

/**
 * Get semester display name
 */
export const getSemesterName = (semester: number): string => {
  return `Semester ${semester}`;
};

/**
 * Get resource type display name
 */
export const getResourceTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    curriculum: 'Curriculum',
    qb: 'Question Bank',
    qp: 'Question Papers',
    notes: 'Notes',
    textbook: 'Textbooks',
    link: 'Learning Links',
    quiz: 'Quizzes',
    certificate: 'Certificates',
  };
  return typeMap[type] || type;
};

/**
 * Get preparation category display name
 */
export const getPreparationCategoryName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    gate: 'GATE',
    govt_exams: 'Government Exams',
    ielts: 'IELTS',
    toefl: 'TOEFL',
    gre: 'GRE',
    gmat: 'GMAT',
    
  };
  return categoryMap[category] || category;
};
