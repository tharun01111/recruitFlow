import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

export const protect = (req, res, next) => {
  let token;
  // Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // No token present
  if (!token) {
    return next(
      new AppError(
        "Authentication required.",
        401,
        {
          expected: "Authorization header with Bearer token",
          received: "no token",
          action: "Login and include a valid token in the request headers"
        }
      )
    );
  }

  //  Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded = { id, role }
    req.user = decoded;
    next();
  } catch (error) {
    return next(
      new AppError(
        "Invalid or expired token.",
        401,
        {
          expected: "valid JWT access token",
          received: "invalid or expired token",
          action: "Login again to obtain a new token"
        }
      )
    );
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return next(
    new AppError(
      "Admin access only.",
      403,
      {
        expected: "authenticated user with admin role",
        received: req.user?.role || "unauthenticated user",
        action: "Use an admin account to access this resource"
      }
    )
  );
};

export const companyOnly = (req, res, next) => {
  if (req.user && req.user.role === "company") {
    return next();
  }

  return next(
    new AppError(
      "Company access only.",
      403,
      {
        expected: "authenticated user with company role",
        received: req.user?.role || "unauthenticated user",
        action: "Use a company account to access this resource"
      }
    )
  );
};
