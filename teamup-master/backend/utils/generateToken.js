import jwt from 'jsonwebtoken';

// generate JWT
export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '3d',
    });
}