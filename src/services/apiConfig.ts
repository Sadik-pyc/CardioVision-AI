export interface ApiConfig {
  backendMode: 'prototype_mock' | 'python_backend';
  pythonApiUrl: string; // e.g. 'http://localhost:8000/api/v1/predict'
  enableSimulatedNetworkDelay: boolean;
  simulatedDelayMs: number;
}

export const DEFAULT_API_CONFIG: ApiConfig = {
  backendMode: 'prototype_mock',
  pythonApiUrl: (import.meta.env.VITE_PYTHON_API_URL as string) || 'http://localhost:8000/api/v1/predict',
  enableSimulatedNetworkDelay: true,
  simulatedDelayMs: 450,
};
