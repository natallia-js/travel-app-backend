import * as path from 'path';

export const DEF_COUNTRIES_NUM_TO_RETURN = 8;
export const DEF_LANG = 'en';
export const CONFIG_MONGOURI_PARAM_NAME = 'mongoURI';
export const CONFIG_JWT_SECRET_PARAM_NAME = 'jwtSecret';
export const DEF_PORT = '3000';

export const UPLOADED_FILE_MAX_SIZE_IN_BYTES = 10 * 1024 * 1024; // 10 Mb
export const UPLOADED_FILES_RELATIVE_PATH = '/uploads/';
export const UPLOADED_FILES_PATH = path.join(__dirname, 'uploads');
