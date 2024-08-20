import { ApiKeyAuthentication, BasicAuthentication, OAuthAuthentication } from "./authentication.domain";
import { OutlookDataSource } from "./sources.domain";
import { RetryPolicyConfig, SystemConfig } from "./worker.domain";

//These are actually tests. The test is 'do they compile'

const authConfigOAuth: OAuthAuthentication = {
  method: 'OAuth',
  credentials: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    tokenEndpoint: 'https://api.example.com/oauth2/token'
  }
};

const authConfigBasic: BasicAuthentication = {
  method: 'Basic',
  credentials: {
    username: 'user',
    password: 'password'
  }
};

const apiConfig: ApiKeyAuthentication = {
  method: 'ApiKey',
  credentials: {
    apiKey: 'your-api-key'
  }
};
const fileNameTemplate = 'output/${type}/$index}.json';
const retryPolicy: RetryPolicyConfig = {
  initialInterval: 1000,
  maximumInterval: 3000,
  maximumAttempts: 5
}
// Example Usage

const systemConfig: SystemConfig = {
  sources: {
    'email': {
      source: {
        type: 'Outlook',
        emails: { method: 'file', details: '/path/to/email_list.txt' },
        baseUrl: 'https://outlook.office.com/api/v2.0',
        authentication: {
          method: 'Basic',
          credentials: { username: '${env.OUTLOOK_USERNAME}', password: '${env.OUTLOOK_PASSWORD}' }
        }
      },
      workerCount: 5,
      fileNameTemplate,
      batchSize: 100,
      retryPolicy
    },
    'teams': {
      source: {
        type: 'Teams',
        channels: { method: 'staticList', details: [ 'channel1,', 'channel2', 'channel3' ] },
        baseUrl: 'https://teams.example.com/api/v1',
        authentication: {
          method: 'OAuth',
          credentials: { clientId: 'your-client', clientSecret: 'your-client', tokenEndpoint: 'https://api.example.com/oauth2/token' }
        }
      },
      workerCount: 3,
      fileNameTemplate,
      batchSize: 50,
      retryPolicy
    }
  }
};
