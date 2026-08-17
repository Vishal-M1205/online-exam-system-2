import { Signup } from './authentication/Signup.js';
import { Login } from './authentication/Login.js';
import bcrypt from 'https://cdn.jsdelivr.net/npm/bcryptjs@3.0.2/+esm';

const signup = new Signup();
signup.init();

const login = new Login();
login.init();
