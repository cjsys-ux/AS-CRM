import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

interface Auth0ContextProviderProps {
  children: React.ReactNode;
}

export const Auth0ContextProvider: React.FC<Auth0ContextProviderProps> = ({ children }) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_AUTH0_CALLBACK_URL;

  if (!domain || !clientId || !redirectUri) {
    console.error(
      'Auth0 configuration missing. Please set VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, and VITE_AUTH0_CALLBACK_URL in .env.local'
    );
    return <div>Auth0 configuration error. Check console.</div>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      useFormData={false}
    >
      {children}
    </Auth0Provider>
  );
};

export { useAuth0 } from '@auth0/auth0-react';
