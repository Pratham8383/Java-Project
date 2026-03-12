import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { addDays, format, parseISO, differenceInDays } from "date-fns";

const db = new Database("study_planner.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    exam_date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER,
    title TEXT,
    date TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    is_completed INTEGER DEFAULT 0,
    FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    is_completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/subjects", (req, res) => {
    const subjects = db.prepare("SELECT * FROM subjects ORDER BY exam_date ASC").all();
    res.json(subjects.map((s: any) => ({
      id: s.id,
      name: s.name,
      examDate: s.exam_date
    })));
  });

  app.post("/api/subjects", (req, res) => {
    const { name, examDate } = req.body;
    if (!name || !examDate) {
      return res.status(400).json({ error: "Name and exam date are required" });
    }
    const info = db.prepare("INSERT INTO subjects (name, exam_date) VALUES (?, ?)").run(name, examDate);
    const subjectId = info.lastInsertRowid;

    // Automatically create a task for today for the new subject
    const todayStr = format(new Date(), "yyyy-MM-dd");
    db.prepare("INSERT INTO tasks (subject_id, date, duration_minutes) VALUES (?, ?, ?)")
      .run(subjectId, todayStr, 60);

    res.json({ id: subjectId, name, examDate });
  });

  app.delete("/api/subjects/:id", (req, res) => {
    db.prepare("DELETE FROM subjects WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.put("/api/subjects/:id", (req, res) => {
    const { name, examDate } = req.body;
    if (!name || !examDate) {
      return res.status(400).json({ error: "Name and exam date are required" });
    }
    db.prepare("UPDATE subjects SET name = ?, exam_date = ? WHERE id = ?")
      .run(name, examDate, req.params.id);
    res.json({ success: true, id: req.params.id, name, examDate });
  });

  app.get("/api/schedule", (req, res) => {
    const subjects: any[] = db.prepare("SELECT * FROM subjects ORDER BY exam_date ASC").all();
    const tasks: any[] = db.prepare(`
      SELECT t.*, s.name as subject_name 
      FROM tasks t 
      LEFT JOIN subjects s ON t.subject_id = s.id 
      ORDER BY t.date ASC
    `).all();

    res.json({
      subjects: subjects.map(s => ({ id: s.id, name: s.name, examDate: s.exam_date })),
      tasks: tasks.map(t => ({
        id: t.id,
        subjectId: t.subject_id,
        subjectName: t.subject_name || t.title,
        date: t.date,
        durationMinutes: t.duration_minutes,
        isCompleted: !!t.is_completed
      }))
    });
  });

  app.post("/api/tasks", (req, res) => {
    const { title, date, durationMinutes, subjectId } = req.body;
    if (!date || (!title && !subjectId)) {
      return res.status(400).json({ error: "Date and either title or subjectId are required" });
    }
    const info = db.prepare("INSERT INTO tasks (title, date, duration_minutes, subject_id) VALUES (?, ?, ?, ?)")
      .run(title || null, date, durationMinutes || 60, subjectId || null);
    res.json({ id: info.lastInsertRowid, success: true });
  });

  app.delete("/api/tasks/:id", (req, res) => {
    db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/generate-schedule", (req, res) => {
    const subjects: any[] = db.prepare("SELECT * FROM subjects ORDER BY exam_date ASC").all();
    if (subjects.length === 0) {
      return res.json({ message: "No subjects to schedule" });
    }

    // Simple scheduling algorithm:
    // 1. Clear existing incomplete tasks
    db.prepare("DELETE FROM tasks WHERE is_completed = 0").run();

    const today = new Date();
    const scheduleDays = 14; // Generate for next 2 weeks

    for (let i = 0; i < scheduleDays; i++) {
      const currentDate = addDays(today, i);
      const dateStr = format(currentDate, "yyyy-MM-dd");

      // Pick subjects that have exams in the future
      const eligibleSubjects = subjects.filter(s => {
        const examDate = parseISO(s.exam_date);
        return differenceInDays(examDate, currentDate) > 0;
      });

      if (eligibleSubjects.length > 0) {
        // Prioritize subjects with closer exam dates
        // We'll pick up to 4 subjects per day for 1 hour each
        const dailySubjects = eligibleSubjects.slice(0, 4);
        for (const sub of dailySubjects) {
          db.prepare("INSERT INTO tasks (subject_id, date, duration_minutes) VALUES (?, ?, ?)")
            .run(sub.id, dateStr, 60);
        }
      }
    }

    res.json({ success: true });
  });

  app.post("/api/tasks/:id/toggle", (req, res) => {
    const task: any = db.prepare("SELECT is_completed FROM tasks WHERE id = ?").get(req.params.id);
    if (task) {
      const newValue = task.is_completed ? 0 : 1;
      db.prepare("UPDATE tasks SET is_completed = ? WHERE id = ?").run(newValue, req.params.id);
      res.json({ success: true, isCompleted: !!newValue });
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  });

  // Todo Routes
  app.get("/api/todos", (req, res) => {
    const todos = db.prepare("SELECT * FROM todos ORDER BY created_at DESC").all();
    res.json(todos.map((t: any) => ({
      id: t.id,
      text: t.text,
      isCompleted: !!t.is_completed
    })));
  });

  app.post("/api/todos", (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });
    const info = db.prepare("INSERT INTO todos (text) VALUES (?)").run(text);
    res.json({ id: info.lastInsertRowid, text, isCompleted: false });
  });

  app.post("/api/todos/:id/toggle", (req, res) => {
    const todo: any = db.prepare("SELECT is_completed FROM todos WHERE id = ?").get(req.params.id);
    if (todo) {
      const newValue = todo.is_completed ? 0 : 1;
      db.prepare("UPDATE todos SET is_completed = ? WHERE id = ?").run(newValue, req.params.id);
      res.json({ success: true, isCompleted: !!newValue });
    } else {
      res.status(404).json({ error: "Todo not found" });
    }
  });

  app.delete("/api/todos/:id", (req, res) => {
    db.prepare("DELETE FROM todos WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
