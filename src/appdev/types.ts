export interface AppConfig {
  name: string;
  envVar: string;
  slimDomain: string;
  defaultPort: number;
}

export interface DevServerConfig {
  projectName: string;
  apps: AppConfig[];
  envFiles: string[];
  devCommand: string;
}

export interface TenantSlimConfig {
  projectName: string;
  appName: string;
  defaultPort?: number;
  portEnvVar?: string;
}
