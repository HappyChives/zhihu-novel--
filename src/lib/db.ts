/**
 * 本地 SQLite 操作封装
 * 使用 @tauri-apps/plugin-sql
 */

import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:storyforge.db");
    await initSchema(db);
  }
  return db;
}

async function initSchema(database: Database) {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      hotspot_data TEXT,
      inspiration TEXT,
      selected_topic TEXT,
      outline TEXT,
      cover_materials TEXT
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);
}

export interface DbProject {
  id: string;
  name: string;
  created_at: string;
  hotspot_data: string | null;
  inspiration: string | null;
  selected_topic: string | null;
  outline: string | null;
  cover_materials: string | null;
}

export async function listProjects(): Promise<DbProject[]> {
  const database = await getDb();
  return (await database.select<DbProject[]>(
    "SELECT * FROM projects ORDER BY created_at DESC"
  ));
}

export async function saveProject(project: {
  id: string;
  name: string;
  created_at: string;
  hotspot_data?: string;
  inspiration?: string;
  selected_topic?: string;
  outline?: string;
  cover_materials?: string;
}): Promise<void> {
  const database = await getDb();
  await database.execute(
    `INSERT OR REPLACE INTO projects (id, name, created_at, hotspot_data, inspiration, selected_topic, outline, cover_materials)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      project.id,
      project.name,
      project.created_at,
      project.hotspot_data ?? null,
      project.inspiration ?? null,
      project.selected_topic ?? null,
      project.outline ?? null,
      project.cover_materials ?? null,
    ]
  );
}

export interface DbChapter {
  id: string;
  project_id: string;
  title: string;
  content: string;
  created_at: string;
}

export async function listChapters(projectId: string): Promise<DbChapter[]> {
  const database = await getDb();
  return (await database.select<DbChapter[]>(
    "SELECT * FROM chapters WHERE project_id = $1 ORDER BY created_at ASC",
    [projectId]
  ));
}

export async function saveChapter(chapter: {
  id: string;
  project_id: string;
  title: string;
  content: string;
  created_at: string;
}): Promise<void> {
  const database = await getDb();
  await database.execute(
    `INSERT OR REPLACE INTO chapters (id, project_id, title, content, created_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [chapter.id, chapter.project_id, chapter.title, chapter.content, chapter.created_at]
  );
}
