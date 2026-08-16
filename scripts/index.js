import { Signup } from './authentication/Signup.js';
import { Login } from './authentication/Login.js';

const signup = new Signup();
signup.init();

const login = new Login();
login.init();
