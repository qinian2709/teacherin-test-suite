// 各角色测试账号。从环境变量 / CI 注入，不落库明文密码。
export interface Account {
  name: string;
  user: string;
  password: string;
}

export function studentAccount(): Account {
  return {
    name: 'student',
    user: process.env.STUDENT_USER ?? '',
    password: process.env.STUDENT_PASSWORD ?? '',
  };
}

export function merchantAccount(): Account {
  return {
    name: 'merchant',
    user: process.env.MERCHANT_USER ?? '',
    password: process.env.MERCHANT_PASSWORD ?? '',
  };
}
