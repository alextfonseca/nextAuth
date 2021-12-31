import { destroyCookie } from "nookies";
import { useContext, useEffect } from "react";
import { Can } from "../components/Can";
import { AuthContext } from "../contexts/AuthContext";
import { useCan } from "../hooks/useCan";
import { api, setupAPIClient } from "../services/api";
import { AuthTokenError } from "../services/errors/AuthTokenError";
import { withSSRAuth } from "../utils/withSSRAuth";

const dashboard = () => {
  // importando o contexto para pegar os dados do usuario
  const { user, signOut } = useContext(AuthContext);

  // usando o hook de verificação de permissões do usuário
  const userCanSeeMetrics = useCan({
    permissions: ["metrics.list"],
  });

  return (
    <div>
      <button onClick={signOut}>Sair</button>

      {/* component Can que so aparece  */}
      <Can permissions={["metrics.list"]}>
        <h1>Seja bem vindo {user?.email} </h1>
      </Can>
    </div>
  );
};

export default dashboard;

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);

  const response = await apiClient.get("/me");

  return {
    props: {
      users: [],
    },
  };
});
