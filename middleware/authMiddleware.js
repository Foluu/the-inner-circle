import jwt from "jsonwebtoken";



// Default middleware (example: logging or generic checks)
const authMiddleware = (req, res, next) => {
  console.log("Running generic auth middleware...");
  next();
};

// Named middleware to verify JWT tokens

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token." });
  }
};


// Export both

export default authMiddleware;
export { verifyToken };
