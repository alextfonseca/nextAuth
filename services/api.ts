import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";
import { signOut } from "../contexts/AuthContext";
import { AuthTokenError } from "./errors/AuthTokenError";

// variavel para ver se esta atualizando o token ou não
let isRefreshing = false;

// todas as requisições que deram erro
let failedRequestesQueue: any = [];

export function setupAPIClient(ctx = undefined) {
  // pegar o token dos cookies
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: "http://localhost:3333",
    headers: {
      Authorization: `Bearer ${cookies["nextAuthIgnite.token"]}`,
    },
  });

  // criando o refresh token
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: any) => {
      if (error.response.status === 401) {
        if (error.response.data?.code === "token.expired") {
          // renovar o token

          // buscando o token armazenado
          cookies = parseCookies(ctx);

          const { "nextAuthIgnite.refreshToken": refreshToken } = cookies;

          const originalConfig = error.config; // configuração da requisição ao back-end

          //fazendo o refresh do token se ele ainda não foi feito
          if (!isRefreshing) {
            isRefreshing = true;

            // realizando a requisição ao servidor para gerar um novo token
            api
              .post("/refresh", {
                refreshToken,
              })
              .then((response) => {
                const { token } = response.data; // novo token

                // salvando o novo token nos cookies
                //salvando as informações do usuario nos cookies do navegador
                setCookie(ctx, "nextAuthIgnite.token", token, {
                  maxAge: 60 * 60 * 24 * 30, // -- 30 dias --//quando tempo o cookie fica armazenado no computador
                  path: "/", //quais caminhos tem acesso aos cookies -- / = todas --
                });

                setCookie(
                  ctx,
                  "nextAuthIgnite.refreshToken",
                  response.data.refreshToken,
                  {
                    maxAge: 60 * 60 * 24 * 30, // -- 30 dias --//quando tempo o cookie fica armazenado no computador
                    path: "/", //quais caminhos tem acesso aos cookies -- / = todas --
                  },
                );

                // passando o token de autorização para o axios apenas quando a pessoa fizer a autenticação
                api.defaults.headers["Authorization"] = `Bearer ${token}`;

                // tentando resolver os problemas de error durante a atualização
                failedRequestesQueue.forEach((request: any) =>
                  request.onSuccess(token),
                );

                // limpando a lista
                failedRequestesQueue = [];
              })
              .catch((error) => {
                // tentando resolver os problemas de error durante a atualização
                failedRequestesQueue.forEach((request: any) =>
                  request.onFailure(error),
                );

                // limpando a lista
                failedRequestesQueue = [];
                if (process.browser) {
                  signOut();
                }
              })
              .finally(() => {
                isRefreshing = false; //refresh do token finalizado
              });
          }

          // criando uma fila
          return new Promise((resolve, reject) => {
            failedRequestesQueue.push({
              onSuccess: (token: string) => {
                originalConfig.headers["Authorization"] = `Bearer ${token}`;

                //fazendo a requisição novamente
                resolve(api(originalConfig));
              },
              // o que acontece quando a atualização do token termina
              onFailure: (error: AxiosError) => {
                reject(error);
              }, // o que acontece quando a atualização do token der errado
            });
          });
        } else {
        } // desloga o usuario
        if (process.browser) {
          signOut();
        } else {
          return Promise.reject(new AuthTokenError());
        }
      }

      return Promise.reject(error);
    },
  );

  return api;
}
