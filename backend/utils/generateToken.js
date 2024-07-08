import jwt from "jsonwebtoken";

export default function generateToken(id) {
  return jwt.sign({ id }, process.env.SECRET, {
    expiresIn: "30m",
  });
}
