import { db } from "../db.js";
export const getUserByLoginAndPassword = (req, res) => {
  const { login, password } = req.body;

  const query = `
    SELECT id, nome, login, role
    FROM usuarios
    WHERE login = ? AND senha = ?;
  `;

  db.query(query, [login, password], (err, data) => {
    if (err) {
      console.error("Erro na consulta SQL:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    if (data.length === 0) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const userData = data[0];
    const { id, nome, login, role } = userData;

    return res.status(200).json({ id, nome, login, role });
  });
};

export const getNotasFaltas = (req, res) => {
  const usuarioId = req.body.id;
  console.log(usuarioId);

  const queryNotas = `
    SELECT
      d.nome AS disciplina,
      notas.nome_nota,
      notas.nota
    FROM
      usuario_disciplinas ud
    INNER JOIN disciplinas d ON ud.disciplina_id = d.id
    LEFT JOIN notas ON ud.id = notas.usuario_disciplina_id
    WHERE
      ud.usuario_id = ?;
  `;

  const queryFaltas = `
    SELECT
      d.nome AS disciplina,
      SUM(faltas.falta) AS total_faltas
    FROM
      usuario_disciplinas ud
    INNER JOIN disciplinas d ON ud.disciplina_id = d.id
    LEFT JOIN faltas ON ud.id = faltas.usuario_disciplina_id
    WHERE
      ud.usuario_id = ?
    GROUP BY
      d.nome;
  `;

  db.query(queryNotas, [usuarioId], (errNotas, dataNotas) => {
    if (errNotas) {
      console.error("Erro na consulta de notas:", errNotas);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    db.query(queryFaltas, [usuarioId], (errFaltas, dataFaltas) => {
      if (errFaltas) {
        console.error("Erro na consulta de faltas:", errFaltas);
        return res.status(500).json({ error: "Erro interno do servidor" });
      }

      const faltasMap = dataFaltas.reduce((acc, item) => {
        acc[item.disciplina] = item.total_faltas;
        return acc;
      }, {});

      const combinedData = {};
      dataNotas.forEach((nota) => {
        const disciplina = nota.disciplina;
        if (!combinedData[disciplina]) {
          combinedData[disciplina] = {
            nome: disciplina,
            notas: {},
            faltas: faltasMap[disciplina] || 0,
          };
        }
        combinedData[disciplina].notas[nota.nome_nota] = nota.nota;
      });

      return res.status(200).json(Object.values(combinedData));
    });
  });
};

export const getMateriasDoProfessor = (req, res) => {
  const usuarioId = req.body.id;
  console.log(usuarioId);

  const queryDisciplinasProfessor = `
    SELECT
      d.id AS id,
      d.nome AS nome
    FROM
      usuario_disciplinas ud
    INNER JOIN disciplinas d ON ud.disciplina_id = d.id
    WHERE
      ud.usuario_id = ? AND
      ud.eh_professor = 1;
  `;

  db.query(queryDisciplinasProfessor, [usuarioId], (err, data) => {
    if (err) {
      console.error("Erro na consulta de disciplinas do professor:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    const disciplinasProfessor = data.map((item) => ({
      id: item.id,
      nome: item.nome,
    }));
    return res.status(200).json(disciplinasProfessor);
  });
};

export const getAlunosDaDisciplina = (req, res) => {
  const disciplinaId = req.body.id;
  const professorId = req.body.Profid;

  const queryAlunosDisciplina = `
    SELECT
      u.id AS aluno_id,
      u.nome AS aluno_nome
    FROM
      usuario_disciplinas ud
    INNER JOIN Usuarios u ON ud.usuario_id = u.id
    WHERE
      ud.disciplina_id = ? AND
      ud.eh_professor = 0 AND
      ud.usuario_id <> ?;
  `;

  db.query(queryAlunosDisciplina, [disciplinaId, professorId], (err, data) => {
    if (err) {
      console.error("Erro na consulta de alunos da disciplina:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    const alunosDisciplina = data.map((item) => ({
      id: item.aluno_id,
      nome: item.aluno_nome,
    }));
    return res.status(200).json(alunosDisciplina);
  });
};

export const getNotasEFaltasById = (req, res) => {
  const alunoId = req.body.alunoId;
  const disciplinaId = req.body.disciplinaId;

  const queryNotas = `
    SELECT
      notas.nome_nota,
      notas.nota
    FROM
      usuario_disciplinas ud
    INNER JOIN disciplinas d ON ud.disciplina_id = d.id
    LEFT JOIN notas ON ud.id = notas.usuario_disciplina_id
    WHERE
      ud.usuario_id = ? AND
      ud.disciplina_id = ?;
  `;

  const queryFaltas = `
  SELECT
    d.nome AS disciplina,
    SUM(faltas.falta) AS total_faltas
  FROM
    usuario_disciplinas ud
  INNER JOIN disciplinas d ON ud.disciplina_id = d.id
  LEFT JOIN faltas ON ud.id = faltas.usuario_disciplina_id
  WHERE
    ud.usuario_id = ? AND
    ud.disciplina_id = ?
  GROUP BY
    d.nome;
`;

  db.query(queryNotas, [alunoId, disciplinaId], (errNotas, dataNotas) => {
    if (errNotas) {
      console.error("Erro na consulta de notas:", errNotas);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    db.query(queryFaltas, [alunoId, disciplinaId], (errFaltas, dataFaltas) => {
      if (errFaltas) {
        console.error("Erro na consulta de faltas:", errFaltas);
        return res.status(500).json({ error: "Erro interno do servidor" });
      }

      const faltas = dataFaltas.length > 0 ? dataFaltas[0].total_faltas : 0;

      const combinedData = {};
      dataNotas.forEach((nota) => {
        const disciplina = nota.disciplina;
        if (!combinedData[disciplina]) {
          combinedData[disciplina] = {
            nome: disciplina,
            notas: {},
            faltas: faltas,
          };
        }
        combinedData[disciplina].notas[nota.nome_nota] = nota.nota;
      });

      return res.status(200).json(Object.values(combinedData));
    });
  });
};

export const setNota = (req, res) => {
  const { alunoId, disciplinaId, nomeNota, valorNota } = req.body;
  console.log(alunoId, disciplinaId);

  if (valorNota.toLowerCase() === 'remover') {
    const queryRemoverNota = `
      DELETE FROM notas
      WHERE usuario_disciplina_id = (
        SELECT id
        FROM usuario_disciplinas
        WHERE usuario_Id = ? AND disciplina_Id = ?
      );
    `;

    db.query(queryRemoverNota, [alunoId, disciplinaId], (err, result) => {
      if (err) {
        console.error("Erro ao remover nota:", err);
        return res.status(500).json({ error: "Erro interno do servidor" });
      }

      return res.status(200).json({ message: "Nota removida com sucesso" });
    });
  } else {
    const queryGetUsuarioDisciplinaId = `
      SELECT id
      FROM usuario_disciplinas
      WHERE usuario_Id = ? AND disciplina_Id = ?;
    `;

    db.query(
      queryGetUsuarioDisciplinaId,
      [alunoId, disciplinaId],
      (err, rows) => {
        if (err) {
          console.error("Erro ao consultar usuario_disciplina_id:", err);
          return res.status(500).json({ error: "Erro interno do servidor" });
        }

        if (rows.length === 0) {
          return res
            .status(400)
            .json({ error: "Usuário ou disciplina não encontrados" });
        }

        const usuarioDisciplinaId = rows[0].id;

        const queryInsertOrUpdateNota = `
          INSERT INTO notas (usuario_disciplina_id, nome_nota, nota)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE nota = VALUES(nota);
        `;

        db.query(
          queryInsertOrUpdateNota,
          [usuarioDisciplinaId, nomeNota, valorNota],
          (err, result) => {
            if (err) {
              console.error("Erro ao inserir/atualizar nota:", err);
              return res.status(500).json({ error: "Erro interno do servidor" });
            }

            return res
              .status(200)
              .json({ message: "Nota inserida/atualizada com sucesso" });
          }
        );
      }
    );
  }
};

export const setFalta = (req, res) => {
  const { alunoId, disciplinaId, falta, dataFalta } = req.body;

  const queryGetUsuarioDisciplinaId = `
    SELECT id
    FROM usuario_disciplinas
    WHERE usuario_Id = ? AND disciplina_Id = ?;
  `;

  db.query(
    queryGetUsuarioDisciplinaId,
    [alunoId, disciplinaId],
    (err, rows) => {
      if (err) {
        console.error("Erro ao consultar usuario_disciplina_id:", err);
        return res.status(500).json({ error: "Erro interno do servidor" });
      }

      if (rows.length === 0) {
        return res
          .status(400)
          .json({ error: "Usuário ou disciplina não encontrados" });
      }

      const usuarioDisciplinaId = rows[0].id;

      const queryCheckExistingFalta = `
        SELECT id
        FROM faltas
        WHERE usuario_disciplina_id = ? AND data_falta = ?;
      `;

      db.query(
        queryCheckExistingFalta,
        [usuarioDisciplinaId, dataFalta],
        (err, existingFalta) => {
          if (err) {
            console.error("Erro ao verificar existência da falta:", err);
            return res.status(500).json({ error: "Erro interno do servidor" });
          }

          if (existingFalta.length > 0) {
            const faltaId = existingFalta[0].id;
            const queryUpdateFalta = `
              UPDATE faltas
              SET falta = ?
              WHERE id = ?;
            `;

            db.query(queryUpdateFalta, [falta, faltaId], (err, result) => {
              if (err) {
                console.error("Erro ao atualizar falta:", err);
                return res
                  .status(500)
                  .json({ error: "Erro interno do servidor" });
              }

              return res
                .status(200)
                .json({ message: "Falta atualizada com sucesso" });
            });
          } else {
            const queryInsertFalta = `
              INSERT INTO faltas (usuario_disciplina_id, falta, data_falta)
              VALUES (?, ?, ?);
            `;

            db.query(
              queryInsertFalta,
              [usuarioDisciplinaId, falta, dataFalta],
              (err, result) => {
                if (err) {
                  console.error("Erro ao inserir falta:", err);
                  return res
                    .status(500)
                    .json({ error: "Erro interno do servidor" });
                }

                return res
                  .status(200)
                  .json({ message: "Falta inserida com sucesso" });
              }
            );
          }
        }
      );
    }
  );
};

export const getAllAlunos = (req, res) => {
  const queryAllAlunos = `
    SELECT
      id,
      nome
    FROM
      Usuarios
    WHERE
      role = 'ALUNO';
  `;

  db.query(queryAllAlunos, (err, data) => {
    if (err) {
      console.error("Erro na consulta de todos os alunos:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    const todosAlunos = data.map((item) => ({
      id: item.id,
      nome: item.nome,
    }));
    return res.status(200).json(todosAlunos);
  });
};

export const getDisciplinasNaoVinculadasAoAluno = (req, res) => {
  const alunoId = req.body.id;

  const queryDisciplinasNaoVinculadas = `
    SELECT
      id,
      nome,
      descricao
    FROM
      Disciplinas
    WHERE
      id NOT IN (
        SELECT disciplina_id
        FROM usuario_disciplinas
        WHERE usuario_id = ? AND eh_professor = 0
      );
  `;

  db.query(queryDisciplinasNaoVinculadas, [alunoId], (err, data) => {
    if (err) {
      console.error("Erro na consulta de disciplinas não vinculadas:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    const disciplinasNaoVinculadas = data.map((item) => ({
      id: item.id,
      nome: item.nome,
      descricao: item.descricao,
    }));
    return res.status(200).json(disciplinasNaoVinculadas);
  });
};

export const getDisciplinasVinculadasAoAluno = (req, res) => {
  const alunoId = req.body.id;

  const queryDisciplinasVinculadasAoAluno = `
  SELECT
    d.id,
    d.nome,
    d.descricao
  FROM
    Disciplinas d
  JOIN
    usuario_disciplinas ud ON d.id = ud.disciplina_id
  WHERE
    ud.usuario_id = ? AND ud.eh_professor = 0;
`;

  db.query(queryDisciplinasVinculadasAoAluno, [alunoId], (err, data) => {
    if (err) {
      console.error("Erro na consulta de disciplinas vinculadas:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    const disciplinasVinculadas = data.map((item) => ({
      id: item.id,
      nome: item.nome,
      descricao: item.descricao,
    }));
    return res.status(200).json(disciplinasVinculadas);
  });
};

export const associarUsuarioDisciplina = (req, res) => {
  const { alunoId, disciplinaId } = req.body;

  const queryAssociarAlunoDisciplina = `
    INSERT INTO usuario_disciplinas (usuario_id, disciplina_id, eh_professor)
    VALUES (?, ?, 0);
  `;

  db.query(
    queryAssociarAlunoDisciplina,
    [alunoId, disciplinaId],
    (err, data) => {
      if (err) {
        console.error("Erro ao associar aluno à disciplina:", err);
        return res.status(500).json({ error: "Erro interno do servidor" });
      }

      return res
        .status(200)
        .json({
          success: true,
          message: "Aluno associado à disciplina com sucesso",
        });
    }
  );
};

export const removerAssociacaoUsuarioDisciplina = (req, res) => {
  const { alunoId2, disciplinaId2 } = req.body;

  const queryRemoverAssociacao = `
    DELETE FROM usuario_disciplinas
    WHERE usuario_id = ? AND disciplina_id = ? AND eh_professor = 0;
  `;

  db.query(
    queryRemoverAssociacao,
    [alunoId2, disciplinaId2],
    (err, data) => {
      if (err) {
        console.error("Erro ao remover associação entre aluno e disciplina:", err);
        return res.status(500).json({ error: "Erro interno do servidor" });
      }

      return res.status(200).json({
        success: true,
        message: "Associação entre aluno e disciplina removida com sucesso",
      });
    }
  );
};


export const cadastroDeUsuario = (req, res) => {
  const { nome, login, senha, role } = req.body;

  const querySetNewUsers = `
  INSERT INTO usuarios (nome, login, senha, role)
  Values (?, ?, ?, ?);
  `;
  db.query(querySetNewUsers, [nome, login, senha, role], (err, data) => {
    if (err) {
      console.error("Erro ao associar aluno à disciplina:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Usuario novo criado" });
  });
};
