import { NameAnd } from "@laoban/utils";
import { DataSource } from "./sources.domain";

export type WorkerConfig = {
  source: DataSource
  workerCount: number;
  fileNameTemplate: string;
  batchSize: number;
  retryPolicy: RetryPolicyConfig;
  throttle?: number;
};

export type RetryPolicyConfig = {
  initialInterval: number; // In milliseconds
  maximumInterval: number; // In milliseconds
  maximumAttempts: number;
  nonRecoverableErrors?: string[];
};
export const defaultRetryPolicy: RetryPolicyConfig = {
  initialInterval: 1000,
  maximumInterval: 30000,
  maximumAttempts: 3,
}

export type SystemConfig = {
  sources: NameAnd<WorkerConfig>;
};

