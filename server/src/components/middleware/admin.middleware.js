export function adminMiddleware(req, res, next) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access Denied"
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
}
export function authorize(...roles) {
  return (req, res, next) => {
    try {

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden"
        });
      }

      next();

    } catch (err) {

      return res.status(500).json({
        success: false,
        message: err.message
      });

    }
  };
}