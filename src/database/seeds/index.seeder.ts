import JobPostSeeder from './job-post.seeder';
import UserSeeder from './user.seeder';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export default class RootSeeder implements Seeder {
  public async run(ds: DataSource): Promise<void> {
    await new UserSeeder().run(ds);
    await new JobPostSeeder().run(ds);
  }
}
