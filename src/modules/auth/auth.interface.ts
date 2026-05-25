export type TSignUpUser = {
  name: string;
  email: string;
  password: string;
  role?: string;
};

export type TLoginUser = {
  email: string;
  password: string;
};


export type TTokenUser = Omit<TSignUpUser &
{
  id: number;
  created_at: string;
  updated_at: string;
}, 'password'>;
