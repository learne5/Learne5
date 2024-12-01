import jwt from "jsonwebtoken";


export const authenticateToken = (req, res, next) =>{
    const JWT_SECRET= process.env.JWT_SECRET_KEY;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) return res.status(401).json({ message: 'No token provided' });
  
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid or expired token' });
      req.user = user;
      next();
    });
}

export default authenticateToken;

// import jwt from "jsonwebtoken";

// export const verifyToken = (req, res, next) => {
//   const token = req.cookies.token; // Retrieve token from cookies

//   if (!token) {
//     return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     if (!decoded) {
//       return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });
//     }

//     req.userId = decoded.userId;
//     next();
//   } catch (error) {
//     console.log("Error in verifyToken:", error);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };
