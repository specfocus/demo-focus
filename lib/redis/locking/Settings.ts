/**
 *
 */
 export interface Settings {
  readonly driftFactor: number;
  readonly retryCount: number;
  readonly retryDelay: number;
  readonly retryJitter: number;
  readonly automaticExtensionThreshold: number;
}

// Define default settings.
const defaultSettings: Readonly<Settings> = {
  driftFactor: 0.01,
  retryCount: 10,
  retryDelay: 200,
  retryJitter: 100,
  automaticExtensionThreshold: 500,
};

// Modifyng this object is forbidden.
Object.freeze(defaultSettings);

export default defaultSettings;
