import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobPost } from '../src/job-posts/entities/job-post.entity';
import { LoginResponse } from '../src/auth/auth.service';

// 테스트 db 생성
// boforeall에서 app init, 서비스 연결, db 연결
// boforeEach에서 db 초기화

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let userRepository: Repository<User>;
  let jobPostRepository: Repository<JobPost>;
  let dataSource: DataSource;

  let user: User; // 테스트에 사용될 유저
  let userToken: string;

  const resetDb = async () => {
    const jobPostTable = jobPostRepository.metadata.tableName;
    const userTable = userRepository.metadata.tableName;

    await dataSource.query(
      `TRUNCATE "${jobPostTable}" RESTART IDENTITY CASCADE`,
    );
    await dataSource.query(`TRUNCATE "${userTable}" RESTART IDENTITY CASCADE`);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get(getRepositoryToken(User));
    jobPostRepository = moduleFixture.get(getRepositoryToken(JobPost));
    dataSource = moduleFixture.get(DataSource);
  });

  beforeEach(async () => {
    await resetDb();

    const hashed = await bcrypt.hash('testpassword', 10);
    user = await userRepository.save({
      username: 'testuser',
      password: hashed,
      nickname: 'tester',
      phone: '010-1111-1111',
      email: 'test@test.com',
      imageUrl: null,
    });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'testpassword' })
      .expect(200);
    userToken = (loginRes.body as LoginResponse).access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/job-posts', () => {
    it('게시글을 불러올 수 있다. (GET 200)', () => {
      return request(app.getHttpServer())
        .get('/job-posts')
        .expect(200)
        .expect({ data: [], nextCursor: null });
    });

    it('게시글을 작성할 수 있다. (POST 201)', () => {
      const createJobPostDto = {
        title: '게시글 작성 테스트',
        location: '경남 김해시 대청동',
        pay: 100000,
        date: new Date(),
        startTime: '10:00',
        endTime: '20:00',
        totalHours: 10,
        place: '우리집',
        imageUrl: null,
        content: '방청소 부탁드려요.',
        hourlyWage: 10000,
        userId: user.id,
      };
      return request(app.getHttpServer())
        .post('/job-posts')
        .send(createJobPostDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            identifiers: [{ id: user.id }],
          });
        });
    });
  });
  describe('/job-posts/:id', () => {
    let jobPost: JobPost;
    let otherUser: User;
    let otherToken: string;

    beforeEach(async () => {
      jobPost = await jobPostRepository.save({
        title: '게시글 작성 테스트',
        location: '경남 김해시 대청동',
        pay: 100000,
        date: new Date(),
        startTime: '10:00',
        endTime: '20:00',
        totalHours: 10,
        place: '우리집',
        imageUrl: null,
        content: '방청소 부탁드려요.',
        hourlyWage: 10000,
        userId: user.id,
      });

      const hashed = await bcrypt.hash('otherpassword', 10);
      otherUser = await userRepository.save({
        username: 'otheruser',
        password: hashed,
        nickname: 'tester2',
        phone: '010-1111-1111',
        email: 'test@test.com',
        imageUrl: null,
      });

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'otheruser', password: 'otherpassword' })
        .expect(200);
      otherToken = (loginRes.body as LoginResponse).access_token;
    });

    it('자신이 작성한 게시글을 수정할 수 있다. (PATCH 201)', () => {
      const updateJobPostDto = {
        title: '게시글 업데이트 테스트',
      };

      return request(app.getHttpServer())
        .patch(`/job-posts/${jobPost.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateJobPostDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            affected: 1,
          });
        });
    });
    it('다른 사람이 작성한 게시글을 수정할 수 없다. (PATCH 403)', () => {
      const updateJobPostDto = {
        title: '게시글 업데이트 테스트',
      };

      return request(app.getHttpServer())
        .patch(`/job-posts/${jobPost.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updateJobPostDto)
        .expect(403);
    });

    it('자신이 작성한 게시글을 삭제할 수 있다. (DELETE 201)', () => {
      return request(app.getHttpServer())
        .delete(`/job-posts/${jobPost.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });
    it('다른 사람이 작성한 게시글을 삭제할 수 없다. (DELETE 403)', () => {
      return request(app.getHttpServer())
        .delete(`/job-posts/${jobPost.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });
  });
});
