const emailValidator = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const passwordValidator = (password) => {
  if (!password) {
    return "Mật khẩu không được để trống";
  }
  if (password.length < 8) {
    return "Mật khẩu phải có ít nhất 8 ký tự";
  }
  if (!/[A-Z]/.test(password)) {
    return "Mật khẩu phải chứa ít nhất một chữ in hoa (A-Z)";
  }
  if (!/[a-z]/.test(password)) {
    return "Mật khẩu phải chứa ít nhất một chữ thường (a-z)";
  }
  if (!/[0-9]/.test(password)) {
    return "Mật khẩu phải chứa ít nhất một chữ số (0-9)";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Mật khẩu phải chứa ít nhất một ký tự đặc biệt (!@#$%^&*)";
  }
  return null; // hợp lệ
};

module.exports = {
  emailValidator,
  passwordValidator,
};
