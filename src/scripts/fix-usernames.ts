import { AppDataSource } from "../config/dataSource";
import { User } from "../entities/user.entity";

async function fixUsernames() {
  try {
    // Initialize the data source
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    const userRepository = AppDataSource.getRepository(User);

    // Get all users
    const users = await userRepository.find();
    console.log(`Found ${users.length} users to update`);

    // Update each user with a unique username
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      // Generate username from firstName and lastName + index
      const baseUsername = `${user.firstName?.toLowerCase() || "user"}${
        user.lastName?.toLowerCase() || ""
      }${i + 1}`;

      // Remove any spaces and special characters
      const cleanUsername = baseUsername.replace(/[^a-zA-Z0-9]/g, "");

      // Ensure minimum length
      const username =
        cleanUsername.length >= 3 ? cleanUsername : `user${i + 1}`;

      // Update the user
      await userRepository.update(user.id, { username });
      console.log(
        `Updated user ${user.id}: ${user.firstName} ${user.lastName} -> username: ${username}`
      );
    }

    console.log("All usernames updated successfully!");
  } catch (error) {
    console.error("Error fixing usernames:", error);
  } finally {
    // Close the connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the script
fixUsernames();
