import axios from "axios";
import { User } from "@/types";

export default async function UsersPage() {
  const { data: users } = await axios.get<User[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <ul>
        {users.map((user: User) => (
          <li key={user.id} className="mb-2">
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
