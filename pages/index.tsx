import type { GetServerSideProps, NextPage } from "next";
import { parseCookies } from "nookies";
import { FormEvent, useContext, useState } from "react";
import { AuthContext, AuthProvider } from "../contexts/AuthContext";
import { withSSRGuest } from "../utils/withSSRGuest";

const Home: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // contexto
  const { sigIn } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const data = {
      email,
      password,
    };

    // signIn dentro do contexto authContext
    await sigIn(data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Enviar</button>
    </form>
  );
};

export default Home;

export const getServerSideProps = withSSRGuest<{
  users: string[];
}>(async (ctx) => {
  return {
    props: {
      users: [],
    },
  };
});
