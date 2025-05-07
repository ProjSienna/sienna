
const API_URL = process.env.SIENNA_API_URL || 'http://localhost:5000';
export const lulo = {
  deposit: async (owner, mintAddress, protectedAmount) => {
    const response = await fetch(`${API_URL}/api/ext/lulo/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ owner, mintAddress, protectedAmount }),
    });
    return response.json();
  },

  getRates: async () => {
    const response = await fetch(`${API_URL}/api/ext/lulo/rates`);
    return response.json();
  },

  getAccount: async (owner) => {
    const response = await fetch(`${API_URL}/api/ext/lulo/account?owner=${owner}`);
    return response.json();
  }
};
