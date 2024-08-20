export type OAuthAuthentication = {
  method: 'OAuth';
  credentials: {
    clientId: string;            // Public identifier for the app
    clientSecret: string;        // Secret used to authenticate the app and obtain tokens
    tokenEndpoint: string;       // Endpoint used to request tokens
  };
};


export type BasicAuthentication = {
  method: 'Basic';
  credentials: {
    username: string;
    password: string;
  };
};

export type ApiKeyAuthentication = {
  method: 'ApiKey';
  credentials: {
    apiKey: string;
  };
};

// Union export type for general authentication
export type Authentication = OAuthAuthentication | BasicAuthentication | ApiKeyAuthentication;

// Example Usage
