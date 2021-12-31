import { decode } from "punycode";
import { setupAPIClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";

const metrics = () => {
  return (
    <div>
      <h1>Métricas</h1>
    </div>
  );
};

export default metrics;

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    const apiClient = setupAPIClient(ctx);

    const response = await apiClient.get("/me");

    return {
      props: {
        users: [],
      },
    };
  },
  { permissions: ["metrics.list"], roles: ["administrator"] },
);
