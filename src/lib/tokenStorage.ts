const TOKEN_KEY = 'admin_token';

export const tokenStorage = {
      saveToken(token: string): void {
            localStorage.setItem(TOKEN_KEY, token);
      },

      getToken(): string | null {
            return localStorage.getItem(TOKEN_KEY);
      },

      removeToken(): void {
            localStorage.removeItem(TOKEN_KEY);
      },

      hasToken(): boolean {
            return !!this.getToken();
      },
};
