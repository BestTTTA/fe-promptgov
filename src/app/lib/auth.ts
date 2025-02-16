export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const loginWithGoogle = () => {
  window.location.href = `${API_URL}/auth/google`;
};

