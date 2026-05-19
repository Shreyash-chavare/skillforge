import jwt from 'jsonwebtoken'

const tokenuser = (user) => {
  // Fallback secret in case JWT_TOKEN is not set (especially in local dev)
  const secret = process.env.JWT_TOKEN || 'dev-secret-skillforge';
  return jwt.sign(
    { id: user._id, email: user.email },
    secret,
    { expiresIn: '1d' }
  );
}

export default tokenuser;