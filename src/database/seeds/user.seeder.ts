import { User } from '../../users/entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(User);

    console.log('🌱 Seeding user...');

    const users = [
      {
        username: 'seoulnight',
        nickname: '밤도깨비',
        phone: '010-9423-1284',
        email: 'seoulnight@example.com',
        password: 'password1',
        imageUrl: null,
        createdAt: '2025-08-02T21:15:42',
      },
      {
        username: 'catlover92',
        nickname: '고양이집사',
        phone: '010-5832-7712',
        email: 'catlover92@example.com',
        password: 'password2',
        imageUrl: null,
        createdAt: '2025-08-03T10:47:25',
      },
      {
        username: 'mountain_hiker',
        nickname: '산속정령',
        phone: '010-1124-5528',
        email: 'hiker@example.com',
        password: 'password3',
        imageUrl: null,
        createdAt: '2025-08-05T06:32:10',
      },
      {
        username: 'latteholic',
        nickname: '카페라떼중독',
        phone: '010-4459-8893',
        email: 'latteholic@example.com',
        password: 'password4',
        imageUrl: null,
        createdAt: '2025-08-07T15:58:02',
      },
      {
        username: 'retro_gamer',
        nickname: '추억의겜돌이',
        phone: '010-9921-4706',
        email: 'retro_gamer@example.com',
        password: 'password5',
        imageUrl: null,
        createdAt: '2025-08-09T19:20:55',
      },
    ];

    for (const u of users) {
      u.password = await bcrypt.hash(u.password, 10);
    }

    await repository.save(users);
  }
}
