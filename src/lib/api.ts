import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const AXIOS_INSTANCE = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Add interceptor to handle 401s (global error handling)
AXIOS_INSTANCE.interceptors.response.use(
    (response) => response,
    (error) => {
        // If error is 401, it means the cookie is invalid/expired
        if (error.response?.status === 401) {
            // Check if the request explicitly opts out of global 401 handling
            const skipRedirect = (error.config as any)?._skipAuthRedirect;
            if (skipRedirect) {
                return Promise.reject(error);
            }

            // Redirect to home if not already there to clear state
            if (window.location.pathname !== '/') {
                // We rely on the backend clearing the cookie or it being expired
                // A force reload or navigation to / ensures fresh state
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

// Custom instance function for Orval
export const customInstance = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
    const source = axios.CancelToken.source();
    const promise = AXIOS_INSTANCE({
        ...config,
        ...options,
        cancelToken: source.token,
    }).then(({ data }) => data);

    // @ts-ignore
    promise.cancel = () => {
        source.cancel('Query was cancelled');
    };

    return promise;
};

// Define ErrorType for Orval to use
export type ErrorType<Error> = AxiosError<Error>;
