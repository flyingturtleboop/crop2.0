import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface Props {
  onSuccess: (credential: string) => void;
  onError?: () => void;
}

const GoogleLoginButton: React.FC<Props> = ({ onSuccess, onError }) => {
  return (
    <GoogleLogin
      onSuccess={(credentialResponse: CredentialResponse) => {
        if (credentialResponse.credential) {
          onSuccess(credentialResponse.credential);
        }
      }}
      onError={() => {
        console.error('Google Login Failed');
        onError && onError();
      }}
    />
  );
};

export default GoogleLoginButton;
