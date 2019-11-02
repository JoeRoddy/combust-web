import { CountContext, CountProvider } from "./CountContext";
import { UserContext, UserProvider } from "./UserContext";
import { ThemeContext, ThemeProvider } from "./ThemeContext";

const Providers = [UserProvider, CountProvider, ThemeProvider];

export { CountContext, ThemeContext, UserContext, Providers };
