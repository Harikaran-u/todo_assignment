const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const { format } = require("date-fns");

const app = express();
app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, "todoApplication.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Started");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeDbAndServer();

///api_1///
app.get("/todos/", async (request, response) => {
  const { status, search_q, priority, category } = request.query;
  if (
    status !== undefined &&
    priority === undefined &&
    category === undefined &&
    search_q === undefined
  ) {
    const statusQuery = `SELECT id, todo, priority, status, category, due_date
      as dueDate FROM todo
      WHERE status = "${status}";`;
    const statusDetails = await db.all(statusQuery);
    if (statusDetails.length === 0) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      response.send(statusDetails);
    }
  }
  if (
    status === undefined &&
    priority !== undefined &&
    category === undefined &&
    search_q === undefined
  ) {
    const statusQuery = `SELECT id, todo, priority, status, category, due_date
      as dueDate FROM todo
      WHERE priority = "${priority}";`;
    const statusDetails = await db.all(statusQuery);
    if (statusDetails.length === 0) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else {
      response.send(statusDetails);
    }
  }
  if (
    status !== undefined &&
    priority !== undefined &&
    category === undefined &&
    search_q === undefined
  ) {
    const statusQuery = `SELECT id, todo, priority, status, category, due_date
      as dueDate FROM todo
      WHERE status = "${status}" AND
      priority = "${priority}";`;
    const statusDetails = await db.all(statusQuery);
    if (statusDetails.length === 0) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      response.send(statusDetails);
    }
  }
  if (
    status === undefined &&
    priority === undefined &&
    category === undefined &&
    search_q !== undefined
  ) {
    const statusQuery = `SELECT id, todo, priority, status, category, due_date
      as dueDate FROM todo
      WHERE todo LIKE "%${search_q}%";`;
    const statusDetails = await db.all(statusQuery);
    if (statusDetails.length === 0) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      response.send(statusDetails);
    }
  }
  if (
    status !== undefined &&
    priority === undefined &&
    category !== undefined &&
    search_q === undefined
  ) {
    const statusQuery = `SELECT id, todo, priority, status, category, due_date
      as dueDate FROM todo
      WHERE status = "${status}"
      AND category = "${category}";`;
    const statusDetails = await db.all(statusQuery);
    if (statusDetails.length === 0) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      response.send(statusDetails);
    }
  }
  if (
    status === undefined &&
    priority === undefined &&
    category !== undefined &&
    search_q === undefined
  ) {
    const statusQuery = `SELECT id, todo, priority, status, category, due_date
      as dueDate FROM todo
      WHERE category = "${category}";`;
    const statusDetails = await db.all(statusQuery);
    if (statusDetails.length === 0) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      response.send(statusDetails);
    }
  }
  if (
    status === undefined &&
    priority !== undefined &&
    category !== undefined &&
    search_q === undefined
  ) {
    const statusQuery = `SELECT id, todo, priority, status, category, due_date
      as dueDate FROM todo
      WHERE category = "${category}"
      AND priority = "${priority}";`;
    const statusDetails = await db.all(statusQuery);
    if (statusDetails.length === 0) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      response.send(statusDetails);
    }
  }
});

///api_2///

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoQuery = `SELECT id, todo, priority, status, category, due_date
      as dueDate FROM todo WHERE id = ${todoId};`;
  const todoData = await db.get(todoQuery);
  response.send(todoData);
});

///api_3///
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  try {
    const formatDate = format(new Date(date), "yyyy-MM-dd");
    const dateQuery = `SELECT id, todo, priority, status, category, due_date
      as dueDate FROM todo WHERE due_date = "${formatDate}";`;
    const dueTodoList = await db.all(dateQuery);
    if (dueTodoList.length === 0) {
      response.status(400);
      response.send("Invalid Due Date");
    } else {
      response.send(dueTodoList);
    }
  } catch (e) {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

///api_4///
app.post("/todos/", async (request, response) => {
  const newTodo = request.body;
  const { id, status, priority, category, dueDate, todo } = newTodo;
  if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
    response.status(400);
    response.send("Invalid Todo Status");
  }
  if (priority !== "HIGH" && priority !== "MEDIUM" && priority !== "LOW") {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
  if (category !== "WORK" && category !== "HOME" && category !== "LEARNING") {
    response.status(400);
    response.send("Invalid Todo Category");
  }
  try {
    const formatDate = format(new Date(dueDate), "yyyy-MM-dd");
    const newTodoQuery = `INSERT INTO todo(id, todo, category, priority, status, due_date)
  VALUES(${id}, "${todo}", "${category}", "${priority}","${status}" ,"${dueDate}");`;
    await db.run(newTodoQuery);
    response.send("Todo Successfully Added");
  } catch (error) {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

///api_5///
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, category, todo, dueDate } = request.body;
  const selectData = `SELECT * FROM todo WHERE id = ${todoId};`;
  const data = await db.get(selectData);
  if (data === undefined) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (status !== undefined) {
    if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      const updateDataQuery = `UPDATE todo SET status = "${status}"
      WHERE id = ${todoId};`;
      await db.run(updateDataQuery);
      response.send("Status Updated");
    }
  } else if (priority !== undefined) {
    if (priority !== "HIGH" && priority !== "MEDIUM" && priority !== "LOW") {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else {
      const updateDataQuery = `UPDATE todo SET priority = "${priority}"
      WHERE id = ${todoId};`;
      await db.run(updateDataQuery);
      response.send("Priority Updated");
    }
  } else if (todo !== undefined) {
    const updateDataQuery = `UPDATE todo SET todo = "${todo}"
      WHERE id = ${todoId};`;
    await db.run(updateDataQuery);
    response.send("Todo Updated");
  } else if (category !== undefined) {
    if (category !== "WORK" && category !== "HOME" && category !== "LEARNING") {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      const updateDataQuery = `UPDATE todo SET category = "${category}"
      WHERE id = ${todoId};`;
      await db.run(updateDataQuery);
      response.send("Category Updated");
    }
  } else if (dueDate !== undefined) {
    try {
      const upDate = format(new Date(dueDate), "yyyy-MM-dd");
      const updateDataQuery = `UPDATE todo SET due_date = "${upDate}"
      WHERE id = ${todoId};`;
      await db.run(updateDataQuery);
      response.send("Due Date Updated");
    } catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});

///api_6///
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo
  WHERE id = ${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
