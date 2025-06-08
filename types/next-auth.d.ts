import 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: 'MERCHANT' | 'CUSTOMER';
  }

  interface Session {
    user: User & {
      role?: 'MERCHANT' | 'CUSTOMER';
    };
  }
} 