export interface IAuthUser {
  id: string;
  identifier?: string;
  email?: string;
  name?: string;
  phoneNumber?: string;
  roles?: string[];
}

export interface IValidatedUser {
  user: IUserData;
  roles: string[];
  permissions: string[];
}
export interface IUserData {
  id: string;
  identifier: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}
