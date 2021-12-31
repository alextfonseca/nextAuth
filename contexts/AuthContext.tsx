import Router from "next/router";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/apiClient";

// tipagem do conteudo do contexto
type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthProviderProps = {
  children: ReactNode;
};

type AuthContextData = {
  sigIn(credentials: SignInCredentials): Promise<void>;
  signOut: () => void;
  user: any;
  isAuthenticated: boolean;
};
// contexto
export const AuthContext = createContext({} as AuthContextData);

// usando o Broadcast
let authChanel: BroadcastChannel;

// função para deslogar o usuario
export function signOut() {
  destroyCookie(undefined, "nextAuthIgnite.token"); //apaga o token armazenado
  destroyCookie(undefined, "nextAuthIgnite.refreshToken"); //apaga o refreshToken armazenado

  authChanel.postMessage("signOut");
  // redirecionando o usuario caso tenha data algum erro no token armazenado
  Router.push("/");
}

// função para criar o autocomplete do que tem dentro do contexto

export function AuthProvider({ children }: AuthProviderProps) {
  // armazenando os dados do usuario
  const [user, setUser] = useState<User>();

  const isAuthenticated = !!user; // se o estado user estiver vazio = false senão true

  useEffect(() => {
    authChanel = new BroadcastChannel("auth");

    authChanel.onmessage = (message) => {
      switch (message.data) {
        case "signOut":
          signOut();
          break;
        case "signIn":
          Router.push("/dashboard");
          break;
        default:
          break;
      }
    };
  }, []);

  // pegando as informações de dentro do cookie
  useEffect(() => {
    const { "nextAuthIgnite.token": token } = parseCookies();

    if (token) {
      api
        .get("/me")
        .then((response) => {
          const { email, permissions, roles } = response.data;

          setUser({ email, permissions, roles });
        })
        .catch(() => {
          // função para deslogar o usuario
          signOut();
        });
    }
  }, []);

  async function sigIn({ email, password }: SignInCredentials) {
    // chamada para api passando o email e senha da pagina home

    try {
      const response = await api.post("sessions", {
        email,
        password,
      });

      // pegando as informações de token, refreshToken, permissões e regras do usuario do back-end
      const { token, refreshToken, permissions, roles } = response.data;

      // salvado os dados no estado
      setUser({ email, permissions, roles });

      //salvando as informações do usuario nos cookies do navegador
      setCookie(undefined, "nextAuthIgnite.token", token, {
        maxAge: 60 * 60 * 24 * 30, // -- 30 dias --//quando tempo o cookie fica armazenado no computador
        path: "/", //quais caminhos tem acesso aos cookies -- / = todas --
      });

      setCookie(undefined, "nextAuthIgnite.refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // -- 30 dias --//quando tempo o cookie fica armazenado no computador
        path: "/", //quais caminhos tem acesso aos cookies -- / = todas --
      });

      // passando o token de autorização para o axios apenas quando a pessoa fizer a autenticação
      api.defaults.headers["Authorization"] = `Bearer ${token}`;

      // navegando o usuario autenticado para a pagina de dashboard
      Router.push("/dashboard");

      authChanel.postMessage("signIn");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AuthContext.Provider value={{ sigIn, isAuthenticated, signOut, user }}>
      {children}
    </AuthContext.Provider>
  );
}
