/**
 * Constantes globales de la aplicación
 * Evita "quemar" valores (hardcoding) en el código.
 */
export const APP_CONFIG = {
  API_VERSION: 'v1',
  PROJECT_ID: 'habitapp-cb02c',
  COLLECTIONS: {
    USERS: 'usuarios',
    HABITS: 'habitos',
    LOGS: 'registros',
  },
  SYNC: {
    MAX_LOG_HISTORY_DAYS: 15, // Días de retención para el Job de limpieza
    HOLGATE_WINDOW_MINUTES: 5, // Margen holgado para sincronización si se requiere
  },
};

/**
 * Mensajes estándar de la aplicación
 */
export const MESSAGES = {
  SYNC_SUCCESS: 'Sincronización completada exitosamente.',
  NOT_AUTHORIZED: 'No tiene permisos para acceder a este recurso.',
  RESOURCE_NOT_FOUND: 'El recurso solicitado no existe.',
};
