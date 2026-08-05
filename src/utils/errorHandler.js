export function getErrorMessage(error, fallback = 'Ocurrió un problema. Intenta de nuevo.') {
    if (!error.response) {
        return 'No se pudo conectar con el servidor. Verifica tu conexión o intenta más tarde.';
    }

    const { status, data } = error.response;

    if (data?.detail) {
        return typeof data.detail === 'string' ? data.detail : fallback;
    }

    switch (status) {
        case 400:
            return 'Los datos enviados no son válidos.';
        case 403:
            return 'No tienes permiso para realizar esta acción.';
        case 404:
            return 'No se encontró lo que buscabas.';
        case 500:
            return 'Hubo un error interno del servidor. Intenta más tarde.';
        default:
            return fallback;
    }
}
