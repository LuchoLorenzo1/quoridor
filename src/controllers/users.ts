import sql from "@/database/db";

export interface UserProfile {
  id: string;
  image?: string;
  name: string;
  created_at: Date;
  rating: number;
  rating_deviation: number;
}

export async function getUserProfileById(userId: string) {
  try {
    return sql<
      UserProfile[]
    >`SELECT id, image, name, created_at, rating, rating_deviation FROM users WHERE id = ${userId} `;
  } catch {
    return null;
  }
}

export async function getUserProfileByName(name: string) {
  try {
    return sql<
      UserProfile[]
    >`SELECT id, image, name, created_at, rating, rating_deviation FROM users WHERE name = ${name} `;
  } catch {
    return null;
  }
}
