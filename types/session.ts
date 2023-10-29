export type Session = {
  name: string;
  username: string;
  email: string;
  photo_url: string;
  sub: string;
  token_uuid: string;
  two_factor_enabled: boolean;
  iat: number;
  nbf: number;
  exp: number;
};
