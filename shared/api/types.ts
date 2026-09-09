export interface UserInfo {
  id?: number | string;
  name?: string;
  login?: string;
  email?: string;
  [key: string]: unknown;
}
