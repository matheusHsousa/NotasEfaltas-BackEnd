import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/users.js";
import cors from "cors";

const app = express();

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

app.use(cors());
app.use("/", userRoutes);

const PORT = 8800;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});