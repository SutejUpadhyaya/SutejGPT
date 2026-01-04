import fs from "fs/promises";
import path from "path";

const USERS_PATH = path.join(process.cwd(), "data", "users.json");

async function ensureUsersFile() {
  try {
    await fs.access(USERS_PATH);
  } catch {
    // If missing, create folder + file
    const dir = path.dirname(USERS_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(USERS_PATH, JSON.stringify([], null, 2), "utf-8");
  }
}

export async function readUsers() {
  await ensureUsersFile();
  const raw = await fs.readFile(USERS_PATH, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeUsers(users) {
  await ensureUsersFile();
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), "utf-8");
}

export async function findUserByEmail(email) {
  const users = await readUsers();
  return users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase()) || null;
}

export async function addUser(user) {
  const users = await readUsers();
  users.push(user);
  await writeUsers(users);
  return user;
}
