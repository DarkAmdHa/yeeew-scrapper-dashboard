import bcrypt from "bcryptjs";

const users = [
  {
    name: "Admin User",
    email: "email@example.com",
    password: bcrypt.hashSync("12345678"),
    isAdmin: true,
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: bcrypt.hashSync("12345678"),
    isAdmin: false,
  },
  {
    name: "Jane Does",
    email: "jane@example.com",
    password: bcrypt.hashSync("12345678"),
    isAdmin: false,
  },
];

export default users;
