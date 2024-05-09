import express from "express";
import {
  getUserByLoginAndPassword,
  getNotasFaltas,
  getMateriasDoProfessor,
  getAlunosDaDisciplina,
  getNotasEFaltasById,
  setNota,
  setFalta,
  getAllAlunos,
  getDisciplinasNaoVinculadasAoAluno,
  associarUsuarioDisciplina,
  cadastroDeUsuario,
  getDisciplinasVinculadasAoAluno,
  removerAssociacaoUsuarioDisciplina
} from "../controllers/user.js";

const router = express.Router();

router.post("/users", getUserByLoginAndPassword);
router.post("/getNotasFaltas", getNotasFaltas)
router.post("/getMateriasDoProfessor", getMateriasDoProfessor)
router.post("/getAlunosDaDisciplina", getAlunosDaDisciplina)
router.post("/getNotasEFaltasById", getNotasEFaltasById)
router.post("/setNota", setNota)
router.post("/setFalta", setFalta)
router.get("/getAllAlunos", getAllAlunos)
router.post("/getDisciplinasNaoVinculadasAoAluno", getDisciplinasNaoVinculadasAoAluno)
router.post("/associarUsuarioDisciplina", associarUsuarioDisciplina)
router.post("/cadastroDeUsuario", cadastroDeUsuario)
router.post("/getDisciplinasVinculadasAoAluno", getDisciplinasVinculadasAoAluno)
router.post("/removerAssociacaoUsuarioDisciplina", removerAssociacaoUsuarioDisciplina)


export default router;
